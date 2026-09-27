"""Digitize CFSVA 2024 Figure 8.4 (households affected by natural hazards, by district).

The report publishes this district chart only as stacked bars without value labels. This script renders the
page, calibrates the y-axis from the chart gridlines (0-90%), measures each bar's segments by colour, and
checks the result against the nine district values quoted in the report text before writing anything.

    pip install pypdfium2 pillow
    python scripts/data/digitize_cfsva2024_hazards.py

Input:  data/raw/nisr/published/other-nisr/Rwanda CFSVA 2024.pdf (from download_nisr_public.py)
Output: data/extracts/cfsva2024_district_natural_hazards.csv
"""

import csv
import sys
from pathlib import Path

import pypdfium2 as pdfium

REPO = Path(__file__).resolve().parents[2]
PDF = REPO / "data" / "raw" / "nisr" / "published" / "other-nisr" / "Rwanda CFSVA 2024.pdf"
OUT = REPO / "data" / "extracts" / "cfsva2024_district_natural_hazards.csv"
PAGE = 74  # printed and PDF page number of Figure 8.4
SCALE = 5

# Bar order in the chart (grouped by province, alphabetical within province).
BARS = [
    ("Bugesera", "East"), ("Gatsibo", "East"), ("Kayonza", "East"), ("Kirehe", "East"), ("Ngoma", "East"),
    ("Nyagatare", "East"), ("Rwamagana", "East"), ("Gasabo", "Kigali City"), ("Kicukiro", "Kigali City"),
    ("Nyarugenge", "Kigali City"), ("Burera", "North"), ("Gakenke", "North"), ("Gicumbi", "North"),
    ("Musanze", "North"), ("Rulindo", "North"), ("Gisagara", "South"), ("Huye", "South"), ("Kamonyi", "South"),
    ("Karongi", "West"), ("Muhanga", "South"), ("Nyamagabe", "South"), ("Nyanza", "South"), ("Nyaruguru", "South"),
    ("Ruhango", "South"), ("Ngororero", "West"), ("Nyabihu", "West"), ("Nyamasheke", "West"), ("Rubavu", "West"),
    ("Rusizi", "West"), ("Rutsiro", "West"),
]
# Legend colours sampled from the rendered page.
COLOURS = {"drought": (0, 115, 172), "floods": (26, 66, 98), "landslides": (54, 181, 197), "other": (208, 206, 206)}
# Values the report states in the text (section 8.1), used as a check.
TEXT_VALUES = {
    ("Gisagara", "any"): 81, ("Gisagara", "drought"): 39, ("Gisagara", "floods"): 40,
    ("Nyamagabe", "any"): 80, ("Nyamagabe", "drought"): 34,
    ("Rubavu", "any"): 84, ("Rubavu", "floods"): 41, ("Rubavu", "landslides"): 27,
    ("Ngororero", "landslides"): 51, ("Nyabihu", "landslides"): 52, ("Burera", "floods"): 59,
}


def classify(pixel):
    if min(pixel) > 240:
        return None
    best = min(COLOURS, key=lambda c: sum((a - b) ** 2 for a, b in zip(pixel, COLOURS[c])))
    return best if sum((a - b) ** 2 for a, b in zip(pixel, COLOURS[best])) < 2500 else None


def gridlines(px, width, k):
    """Rows (top to bottom) where light-grey pixels span the plot: the 90%, 80%, ..., 0% lines."""
    x0, x1 = int(165 * k), int(1175 * k)
    hits = []
    for y in range(int(380 * k), int(700 * k)):
        grey = sum(1 for x in range(x0, x1, 3) if 150 < px[x, y][0] < 250
                   and abs(px[x, y][0] - px[x, y][1]) < 10 and abs(px[x, y][1] - px[x, y][2]) < 10)
        if grey > (x1 - x0) / 3 * 0.25:
            hits.append(y)
    groups = []
    for y in hits:
        if groups and y - groups[-1][-1] <= 1:
            groups[-1].append(y)
        else:
            groups.append([y])
    return [sum(g) / len(g) for g in groups]


def main() -> int:
    page = pdfium.PdfDocument(str(PDF))[PAGE - 1]
    image = page.render(scale=SCALE).to_pil().convert("RGB")
    px, k = image.load(), image.size[0] / 1310
    lines = gridlines(px, image.size[0], k)
    if len(lines) != 10:
        print(f"expected 10 gridlines (0-90%), found {len(lines)}; the page layout may have changed")
        return 1
    y0, y90 = lines[-1], lines[0]
    per_point = (y0 - y90) / 90

    # Bars: runs of chart colour just above the baseline.
    runs, start = [], None
    for x in range(int(165 * k), int(1180 * k)):
        inside = classify(px[x, int(y0 - 8)]) is not None
        if inside and start is None:
            start = x
        elif not inside and start is not None:
            if x - start > 20:
                runs.append((start, x - 1))
            start = None
    if len(runs) != len(BARS):
        print(f"expected {len(BARS)} bars, found {len(runs)}")
        return 1

    rows = []
    for (left, right), (district, province) in zip(runs, BARS):
        x, y, counts, gap, top = (left + right) // 2, int(y0) - 1, dict.fromkeys(COLOURS, 0), 0, int(y0)
        while y > y90 - 80:
            kind = classify(px[x, y])
            if kind:
                counts[kind] += 1
                gap, top = 0, y
            else:
                gap += 1
                if gap > 12:
                    break
            y -= 1
        values = {"any": (y0 - top) / per_point, **{c: n / per_point for c, n in counts.items()}}
        rows.append({"district": district, "province": province,
                     **{f"hazard_{c}_pct": int(v + 0.5) for c, v in values.items()},
                     "_raw": values})

    worst = 0.0
    for (district, kind), expected in TEXT_VALUES.items():
        measured = next(r["_raw"][kind] for r in rows if r["district"] == district)
        worst = max(worst, abs(measured - expected))
        print(f"check {district:10} {kind:10} text={expected:>3}  measured={measured:5.1f}")
    if worst > 1.5:
        print(f"largest difference {worst:.1f} points: not writing output")
        return 1

    with OUT.open("w", newline="", encoding="utf-8") as handle:
        fields = ["district", "province", "hazard_any_pct", "hazard_drought_pct", "hazard_floods_pct",
                  "hazard_landslides_pct", "hazard_other_pct"]
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda r: (r["province"], r["district"])))
    print(f"largest difference from text values: {worst:.1f} points -> {OUT.relative_to(REPO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
