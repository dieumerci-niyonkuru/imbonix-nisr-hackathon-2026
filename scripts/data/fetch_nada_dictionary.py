"""Fetch public variable metadata (names, labels, value labels, unweighted counts) from NISR NADA.

This reads only the public data-dictionary pages; it does not download microdata.

    python scripts/data/fetch_nada_dictionary.py                   # variable lists for studies 120, 119, 121
    python scripts/data/fetch_nada_dictionary.py --details          # also value labels for key variables
    python scripts/data/fetch_nada_dictionary.py --studies 89 125   # any other catalog ID (see nada_catalog.csv)

Outputs go to data/dictionaries/:
  nada_<study>_variables.csv          one row per variable (file, variable id, name, label)
  nada_key_variables.json             value labels and unweighted case counts for key variables
"""

import argparse
import csv
import html
import json
import re
import time
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "data" / "dictionaries"
BASE = "https://microdata.statistics.gov.rw/index.php/catalog"
STUDIES = {
    "120": "FinScope 2024",
    "119": "EICV7 2023/24 cross-section",
    "121": "EICV7 2023/24 VUP sample",
}
# Variables worth documenting in detail (matched by name within each study).
KEY_VARIABLES = {
    "120": [
        "a1", "a2", "a6", "b1", "b2", "c4d", "c13a", "c13b", "c5_4", "n1a_11", "n1a_12", "n1a_18",
        "h3_07", "i5a_3", "i6_15", "qf4_09", "f3", "f4d", "f7_1", "k8a_12", "l1", "n11", "cc7_13",
        "i2_1", "i2_11",
    ],
    "119": [
        "province", "district", "ur", "poverty", "quintile", "s9d1q1", "s9d1q2", "s9d1q3", "s9d1q5",
        "s9d1q7", "s9d1q8a", "s10aq1", "s10aq2", "s10aq6", "s10aq7", "s10cq1", "s10cq4", "s10cq5",
        "s10cq6", "s10cq8",
    ],
    "121": [
        "province", "district", "poverty", "quintile", "s9d1q5", "s9d1q7", "s9d1q8a",
    ],
}


def get(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "IMBONIX-research/1.0"})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read().decode("utf-8", "ignore")


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text))).strip()


def list_files(study: str) -> list[tuple[str, str]]:
    page = get(f"{BASE}/{study}/data-dictionary")
    files = []
    for file_id, name in re.findall(r"datafile/(F\d+)\"[^>]*>\s*([^<]+?)\s*</a>", page):
        if file_id not in [f for f, _ in files]:
            files.append((file_id, html.unescape(name).strip()))
    return files


def list_variables(study: str, file_id: str) -> list[dict]:
    rows, offset = {}, 0
    while True:
        page = get(f"{BASE}/{study}/datafile/{file_id}?offset={offset}&limit=100")
        found = 0
        for var_id, name, label in re.findall(
            r"datafile/F\d+/(V\d+)\">([^<]+)</a></td><td class=\"var-td\">(.*?)</td>", page, re.S
        ):
            if var_id not in rows:
                rows[var_id] = {"variable_id": var_id, "name": html.unescape(name).strip(), "label": clean(label)}
                found += 1
        if found == 0:
            break
        offset += 100
        time.sleep(0.2)
    return list(rows.values())


def variable_details(study: str, var_id: str) -> dict:
    text = clean(get(f"{BASE}/{study}/variable/{var_id}"))
    details = {}
    for key, pattern in {
        "type": r"Type: (\w+)", "range": r"Range: ([\d\-\.]+)",
        "valid_cases": r"Valid cases: (\d+)", "invalid": r"Invalid: (\d+)",
    }.items():
        match = re.search(pattern, text)
        if match:
            details[key] = match.group(1)
    categories = []
    block = text.split("Value Category Cases", 1)
    if len(block) == 2:
        body = block[1].split("warning_figures", 1)[0]
        for value, label, cases, pct in re.findall(r"(-?\d+) (.+?) (\d+) ([\d\.]+)%", body):
            categories.append({"value": int(value), "label": label.strip(), "cases": int(cases), "pct_unweighted": float(pct)})
    if categories:
        details["categories"] = categories
    return details


def study_title(study: str) -> str:
    if study in STUDIES:
        return STUDIES[study]
    catalog = OUT / "nada_catalog.csv"
    if catalog.exists():
        with catalog.open(encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                if row["study_id"] == study:
                    return row["title"]
    return f"study {study}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--details", action="store_true")
    parser.add_argument("--studies", nargs="+", metavar="STUDY_ID", default=list(STUDIES))
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    key_path = OUT / "nada_key_variables.json"
    key_output = json.loads(key_path.read_text(encoding="utf-8")) if key_path.exists() else {}

    for study in args.studies:
        title = study_title(study)
        all_rows = []
        for file_id, file_name in list_files(study):
            variables = list_variables(study, file_id)
            print(f"{title}: {file_id} {file_name}: {len(variables)} variables")
            for row in variables:
                all_rows.append({"study_id": study, "file_id": file_id, "file_name": file_name, **row})
        path = OUT / f"nada_{study}_variables.csv"
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=["study_id", "file_id", "file_name", "variable_id", "name", "label"])
            writer.writeheader()
            writer.writerows(all_rows)
        print(f"  -> {path.relative_to(REPO)} ({len(all_rows)} rows)")

        if args.details:
            wanted = set(KEY_VARIABLES.get(study, []))
            for row in all_rows:
                # Shared variables (district, poverty, ...) repeat in every file; document the first one.
                if row["name"] in wanted:
                    wanted.discard(row["name"])
                    key = f"{study}:{row['file_name']}:{row['name']}"
                    key_output[key] = {"study": title, "file": row["file_name"], "name": row["name"],
                                       "label": row["label"], **variable_details(study, row["variable_id"])}
                    time.sleep(0.2)

    if args.details:
        key_path.write_text(json.dumps(key_output, indent=1, ensure_ascii=False), encoding="utf-8")
        print(f"key variables -> {key_path.relative_to(REPO)} ({len(key_output)} entries)")


if __name__ == "__main__":
    main()
