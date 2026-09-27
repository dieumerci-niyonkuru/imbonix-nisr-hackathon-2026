"""Index every study in the NISR microdata catalog (NADA): access type, data files, documentation, coverage.

Reads only public catalog pages; it never downloads microdata (that needs a personal NADA account).

    python scripts/data/index_nada_catalog.py                            # index all studies
    python scripts/data/index_nada_catalog.py --download-docs 120 119   # also fetch those studies' public documentation

Outputs (data/dictionaries/):
  nada_catalog.csv        one row per study, with IMBONIX's Track 2 relevance note
  nada_catalog_files.csv  one row per data file (cases, variables)
  nada_catalog_docs.csv   one row per documentation file (questionnaires, reports, technical documents)
Documentation downloads go to data/raw/nisr/nada-docs/<study>/ (gitignored).
"""

import argparse
import csv
import hashlib
import html
import io
import json
import re
import time
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "data" / "dictionaries"
DOCS = REPO / "data" / "raw" / "nisr" / "nada-docs"
SITE = "https://microdata.statistics.gov.rw/index.php"

# IMBONIX judgement of each study's use for Track 2 (financial inclusion, poverty, social protection).
# Studies not listed default to "low".
RELEVANCE = {
    "120": ("core", "FinScope 2024: financial access, usage, financial health, Ubudehe category, VUP income; district code and weights"),
    "119": ("core", "EICV7 2023/24: poverty, consumption, savings, credit, VUP payment channel and delays; district-representative"),
    "121": ("core", "EICV7 VUP sample: benefit delivery by component (national/component estimates, not districts)"),
    "89": ("high", "FinScope 2020: 2020 to 2024 trend; check that definitions and the access strand are comparable"),
    "85": ("high", "EICV5 VUP sample 2016/17: earlier VUP delivery and targeting, for a trend with the EICV7 VUP sample"),
    "82": ("high", "EICV5 2016/17 cross-section: 2017 poverty baseline (EICV7 re-estimated 2017 on its new method; use NISR's comparable series)"),
    "125": ("high", "LFS 2025: earnings, informality, youth NEET, income sources; district tables published"),
    "122": ("high", "CFSVA 2024: food insecurity, shocks, coping strategies, livelihoods by district; shock and vulnerability layer"),
    "126": ("high", "DHS 2025: wealth index; women's and men's bank-account and mobile-money use; gender angle"),
    "109": ("high", "Census 2022 public-use sample: population covariates, ICT, disability, employment"),
    "73": ("supporting", "EICV4 VUP sample 2013/14: third point for a VUP trend"),
    "75": ("supporting", "EICV4 2013/14 cross-section: poverty and finance modules (older methodology)"),
    "74": ("supporting", "EICV3/4 panel 2010/11 to 2013/14: the only household panel for poverty dynamics (dated)"),
    "71": ("supporting", "FinScope 2016: long-run inclusion trend"),
    "57": ("supporting", "FinScope 2012: long-run inclusion trend (2008 baseline cited in 2012 report)"),
    "24": ("supporting", "VUP baseline survey 2008: programme origins, early targeting"),
    "114": ("supporting", "LFS 2024: labour trend"),
    "110": ("supporting", "LFS 2023: labour trend"),
    "112": ("supporting", "Establishment Census 2023: financial-service establishments (ISIC K) by location; supply-side layer"),
    "123": ("supporting", "Agricultural Household Survey 2024: farm credit, inputs, agricultural insurance"),
    "124": ("supporting", "Seasonal Agricultural Survey 2025: farm production shocks (overlaps Track 1)"),
    "106": ("supporting", "CFSVA 2021: food-security trend to 2024"),
    "98": ("supporting", "DHS 2019/20: earlier wealth index and financial-account questions"),
    "36": ("supporting", "EICV3 2010/11: long-run poverty series"),
    "65": ("supporting", "Census 2012: 2012 to 2022 change in household conditions"),
}


def get(url: str, retries: int = 3) -> bytes:
    for attempt in range(retries):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "IMBONIX-research/1.0"})
            with urllib.request.urlopen(request, timeout=120) as response:
                return response.read()
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(2 * (attempt + 1))
    return b""


def decode(raw: bytes) -> str:
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return raw.decode("cp1252", "replace")


def clean(fragment: str) -> str:
    fragment = re.sub(r"<script.*?</script>|<style.*?</style>", " ", fragment, flags=re.S)
    fragment = re.sub(r"<br\s*/?>", " ", fragment)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def catalog() -> list[dict]:
    rows = list(csv.DictReader(io.StringIO(decode(get(f"{SITE}/catalog/export/csv?ps=5000&collection[]=")).lstrip("﻿"))))
    listing = decode(get(f"{SITE}/catalog?ps=500&page=1"))
    access = {}
    for block in listing.split('<div class="survey-row"')[1:]:
        study = re.search(r"catalog/(\d+)\"", block)
        icon = re.search(r'data-access-icon [^"]*" title="([^"]*)"', block)
        if study:
            access[study.group(1)] = icon.group(1) if icon else ""
    for row in rows:
        row["access"] = access.get(row["id"], "")
    return rows


def fields(page: str) -> dict:
    """Label/value pairs from a DDI study page (<div class="xsl-caption|xsl-subtitle">Label</div>value)."""
    body = page.split('class="tab-body', 1)[-1]
    parts = re.split(r'<div[^>]*class="xsl-(?:caption|subtitle)"[^>]*>(.*?)</div>', body, flags=re.S)
    found = {}
    for label, value in zip(parts[1::2], parts[2::2]):
        value = re.split(r'<div[^>]*class="xsl-(?:caption|subtitle|title)"', value, maxsplit=1)[0]
        text = clean(value)
        if text:
            found.setdefault(clean(label), text)
    return found


def data_files(study: str) -> list[dict]:
    page = decode(get(f"{SITE}/catalog/{study}/data_dictionary"))
    files = []
    for row in re.findall(r'<tr class="data-file-row.*?</tr>', page, re.S):
        file_id = re.search(r"datafile/(F\d+)", row)
        values = [clean(c) for c in re.findall(r"<td[^>]*/>|<td[^>]*>.*?</td>", row, re.S)]
        if file_id and len(values) >= 4:
            files.append({"file_id": file_id.group(1), "file_name": values[0], "description": values[1],
                          "cases": values[2], "variables": values[3]})
    return files


def documents(study: str, page: str) -> list[dict]:
    docs = []
    for legend, block in re.findall(r"<legend>(.*?)</legend>(.*?)</fieldset>", page, re.S):
        for resource in re.split(r'<div class="resource[ "]', block)[1:]:
            title = re.search(r'class="resource-info"[^>]*>(.*?)</div>', resource, re.S)
            link = re.search(r'<a[^>]*href="([^"]+)"[^>]*title="([^"]*)"[^>]*class="download"', resource, re.S)
            size = re.search(r'class="resource-file-size">(.*?)</span>', resource, re.S)
            docs.append({
                "study_id": study,
                "doc_type": clean(legend),
                "title": clean(title.group(1)) if title else "",
                "filename": html.unescape(link.group(2)).strip() if link else "",
                "size": clean(size.group(1)) if size else "",
                "url": link.group(1) if link else "",
            })
    return docs


def district_sentences(text: str, limit: int = 2) -> str:
    sentences = re.split(r"(?<=[.;])\s+", text)
    hits = [s for s in sentences if re.search(r"district", s, re.I)]
    return " | ".join(hits[:limit])[:600]


def index(sleep: float) -> tuple[list[dict], list[dict], list[dict]]:
    studies, all_files, all_docs = [], [], []
    for row in catalog():
        study = row["id"]
        main = decode(get(f"{SITE}/catalog/{study}"))
        overview = fields(decode(get(f"{SITE}/catalog/{study}/overview")))
        sampling = fields(decode(get(f"{SITE}/catalog/{study}/sampling")))
        files = data_files(study)
        docs = documents(study, main)
        priority, note = RELEVANCE.get(study, ("low", ""))
        if row["access"].startswith("No microdata"):
            priority = "not available"
        sampling_text = " ".join(sampling.values())
        studies.append({
            "study_id": study,
            "idno": row["surveyid"],
            "title": row["titl"].strip(),
            "year_start": row["data_coll_start"],
            "year_end": row["data_coll_end"],
            "producer": row["authenty"].strip("[]\""),
            "access": row["access"],
            "data_files": len(files),
            "max_cases": max((int(f["cases"]) for f in files if f["cases"].isdigit()), default=""),
            "total_variables": sum(int(f["variables"]) for f in files if f["variables"].isdigit()),
            "units_of_analysis": overview.get("Units of Analysis", "")[:200],
            "geographic_coverage": overview.get("Geographic Coverage", "")[:200],
            "universe": overview.get("Universe", "")[:300],
            "sampling_district_note": district_sentences(sampling_text),
            "documents": len(docs),
            "track2_priority": priority,
            "track2_note": note,
            "url": f"{SITE}/catalog/{study}",
        })
        all_files += [{"study_id": study, **f} for f in files]
        all_docs += docs
        print(f"{study:>4} {row['access'][:12]:12} files={len(files):>3} docs={len(docs):>2} {row['titl'][:70]}")
        time.sleep(sleep)
    order = {"core": 0, "high": 1, "supporting": 2, "low": 3, "not available": 4}
    studies.sort(key=lambda s: (order[s["track2_priority"]], -int(s["year_end"] or 0), s["title"]))
    return studies, all_files, all_docs


def write(path: Path, rows: list[dict]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"-> {path.relative_to(REPO)} ({len(rows)} rows)")


def download_docs(studies: list[str], docs_csv: Path) -> None:
    with docs_csv.open(encoding="utf-8") as handle:
        docs = [d for d in csv.DictReader(handle) if d["study_id"] in studies and "/download/" in d["url"]]
    log_path = DOCS / "_download_log.json"
    log = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else {}
    for doc in docs:
        target = DOCS / doc["study_id"] / re.sub(r'[<>:"/\\|?*]', "_", doc["filename"] or doc["title"])
        if not target.exists():
            data = get(doc["url"])
            target.parent.mkdir(parents=True, exist_ok=True)
            part = target.with_name(target.name + ".part")
            part.write_bytes(data)
            part.replace(target)
            log[target.relative_to(DOCS).as_posix()] = {
                "url": doc["url"], "title": doc["title"], "bytes": len(data),
                "sha256": hashlib.sha256(data).hexdigest(), "downloaded": time.strftime("%Y-%m-%dT%H:%M:%S"),
            }
            log_path.write_text(json.dumps(log, indent=1, ensure_ascii=False), encoding="utf-8")
            time.sleep(0.5)
        print(f"{doc['study_id']:>4} {target.stat().st_size:>11,} {target.name}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--download-docs", nargs="*", metavar="STUDY_ID",
                        help="download the public documentation of these studies (after indexing)")
    parser.add_argument("--skip-index", action="store_true", help="reuse the existing nada_catalog_docs.csv")
    parser.add_argument("--sleep", type=float, default=0.3)
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    docs_csv = OUT / "nada_catalog_docs.csv"
    if not args.skip_index:
        studies, files, docs = index(args.sleep)
        write(OUT / "nada_catalog.csv", studies)
        write(OUT / "nada_catalog_files.csv", files)
        write(docs_csv, docs)
    if args.download_docs:
        download_docs(args.download_docs, docs_csv)


if __name__ == "__main__":
    main()
