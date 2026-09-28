"""Build the JSON files the IMBONIX website reads, from the published-table extracts and open boundaries.

    python scripts/data/extract_published_tables.py   # refresh the extracts first (optional)
    python scripts/data/build_web_data.py

Inputs:
  data/extracts/*.csv                       published NISR aggregates (see the extracts README)
  data/raw/geo/geoBoundaries-RWA-ADM2_simplified.geojson     district boundaries (geoBoundaries, CC BY 4.0,
  data/raw/geo/geoBoundaries-RWA-ADM3_simplified.geojson     sourced from NISR's open geodata portal; 2012 units)

Outputs in apps/web/src/data/generated/:
  districts.json   30 districts x 63 indicators with SE / CI, source, year and status
  geo.json         district outlines as SVG paths (equirectangular projection, simplified)
  sectors.json     416 sectors: census non-monetary poverty, MPI, EICV7 small-area poverty and SVG paths
  usage.json       DHS 2025 phone, mobile-money and bank-account use by sex and group
  vup.json         VUP delivery 2023/24 and the 2013/14-2023/24 timeliness series

And in apps/web/public/geo/ (fetched by the browser for the interactive MapLibre map):
  districts.geojson, sectors.geojson   simplified outlines in longitude/latitude, sectors with their values
"""

import csv
import json
import math
import re
import time
import urllib.request
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
EXTRACTS = REPO / "data" / "extracts"
GEO = REPO / "data" / "raw" / "geo"
OUT = REPO / "apps" / "web" / "src" / "data" / "generated"
WIDTH = 1000.0  # SVG units across Rwanda

# Boundary sector names that are spelled differently in the census tables: (district, boundary) -> census.
SECTOR_ALIASES: dict[tuple[str, str], str] = {("Rulindo", "Shyrongi"): "Shyorongi"}


def read_csv(name: str) -> list[dict]:
    with (EXTRACTS / name).open(encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def num(value):
    if value in (None, ""):
        return None
    value = float(value)
    return int(value) if value.is_integer() and abs(value) > 1000 else round(value, 4)


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def key(name: str) -> str:
    return re.sub(r"[^a-z]", "", name.lower())


# ---------------------------------------------------------------------------------------------- geometry
def rings_of(geometry) -> list[list[list[list[float]]]]:
    """Return polygons as lists of rings, for Polygon and MultiPolygon geometries."""
    return [geometry["coordinates"]] if geometry["type"] == "Polygon" else geometry["coordinates"]


def simplify(points: list[tuple[float, float]], tolerance: float) -> list[tuple[float, float]]:
    """Douglas-Peucker (iterative) on a closed ring; keeps at least 4 points."""
    if len(points) < 5:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        start, end = stack.pop()
        (x1, y1), (x2, y2) = points[start], points[end]
        dx, dy = x2 - x1, y2 - y1
        length = math.hypot(dx, dy)
        best, index = 0.0, None
        for i in range(start + 1, end):
            px, py = points[i]
            if length == 0:
                distance = math.hypot(px - x1, py - y1)
            else:
                distance = abs(dy * px - dx * py + x2 * y1 - y2 * x1) / length
            if distance > best:
                best, index = distance, i
        if index is not None and best > tolerance:
            keep[index] = True
            stack += [(start, index), (index, end)]
    result = [p for p, k in zip(points, keep) if k]
    if len(result) < 4:  # ring collapsed: keep its extreme points instead
        step = max(1, len(points) // 4)
        result = points[::step] + [points[0]]
    return result


def ring_area(points) -> float:
    return sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(points, points[1:])) / 2


def ring_centroid(points) -> tuple[float, float]:
    area, cx, cy = 0.0, 0.0, 0.0
    for (x1, y1), (x2, y2) in zip(points, points[1:]):
        cross = x1 * y2 - x2 * y1
        area += cross
        cx += (x1 + x2) * cross
        cy += (y1 + y2) * cross
    if area == 0:
        return points[0]
    return cx / (3 * area), cy / (3 * area)


def inside(point, ring) -> bool:
    x, y = point
    result = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            result = not result
    return result


def path(polygons, decimals: int) -> str:
    parts = []
    for polygon in polygons:
        for ring in polygon:
            coords = " ".join(f"{x:.{decimals}f},{y:.{decimals}f}" for x, y in ring[:-1])
            parts.append(f"M{coords}Z")
    return "".join(parts)


def ensure_boundaries(levels: tuple[str, ...] = ("ADM2", "ADM3")) -> None:
    """Download the geoBoundaries files (gbOpen release 9469f09) into data/raw/geo/ if they are missing."""
    base = "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/RWA"
    for level in levels:
        target = GEO / f"geoBoundaries-RWA-{level}_simplified.geojson"
        if target.exists():
            continue
        GEO.mkdir(parents=True, exist_ok=True)
        url = f"{base}/{level}/geoBoundaries-RWA-{level}_simplified.geojson"
        for attempt in range(5):
            try:
                request = urllib.request.Request(url, headers={"User-Agent": "IMBONIX-research/1.0"})
                with urllib.request.urlopen(request, timeout=120) as response:
                    target.write_bytes(response.read())
                print(f"downloaded {target.relative_to(REPO)}")
                break
            except OSError as error:
                print(f"retry {attempt + 1}/5 for {level}: {error}")
                time.sleep(3)
        else:
            raise SystemExit(f"could not download {url}")


def load_geometry():
    ensure_boundaries()
    adm2 = json.loads((GEO / "geoBoundaries-RWA-ADM2_simplified.geojson").read_text(encoding="utf-8"))["features"]
    adm3 = json.loads((GEO / "geoBoundaries-RWA-ADM3_simplified.geojson").read_text(encoding="utf-8"))["features"]
    lons = [pt[0] for f in adm2 for poly in rings_of(f["geometry"]) for ring in poly for pt in ring]
    lats = [pt[1] for f in adm2 for poly in rings_of(f["geometry"]) for ring in poly for pt in ring]
    min_lon, max_lon, max_lat, min_lat = min(lons), max(lons), max(lats), min(lats)
    k = WIDTH / ((max_lon - min_lon) * math.cos(math.radians((max_lat + min_lat) / 2)))
    cos_lat = math.cos(math.radians((max_lat + min_lat) / 2))

    def project(polygons):
        return [[[((lon - min_lon) * cos_lat * k, (max_lat - lat) * k) for lon, lat in ring] for ring in poly]
                for poly in polygons]

    height = (max_lat - min_lat) * k
    return adm2, adm3, project, height


def build_geo():
    adm2, adm3, project, height = load_geometry()
    districts, district_rings = [], {}
    for feature in adm2:
        name = feature["properties"]["shapeName"]
        polygons = project(rings_of(feature["geometry"]))
        district_rings[name] = [ring for poly in polygons for ring in poly[:1]]
        simple = [[simplify(ring, 0.9) for ring in poly] for poly in polygons]
        outer = max((poly[0] for poly in polygons), key=lambda r: abs(ring_area(r)))
        cx, cy = ring_centroid(outer)
        districts.append({"name": name, "slug": slug(name), "d": path(simple, 1), "cx": round(cx, 1), "cy": round(cy, 1)})
    districts.sort(key=lambda d: d["name"])

    census = defaultdict(dict)
    for row in read_csv("sector_census2022.csv"):
        census[row["district"]][key(row["sector"])] = row["sector"]

    sectors, problems, sector_match = defaultdict(list), [], {}
    for index, feature in enumerate(adm3):
        name = feature["properties"]["shapeName"]
        polygons = project(rings_of(feature["geometry"]))
        points = [pt for poly in polygons for pt in poly[0][:-1]]
        votes = defaultdict(int)
        for district, rings in district_rings.items():
            for pt in points[:: max(1, len(points) // 40)]:
                if any(inside(pt, ring) for ring in rings):
                    votes[district] += 1
        if not votes:
            problems.append(f"no district for sector {name}")
            continue
        district = max(votes, key=votes.get)
        census_name = SECTOR_ALIASES.get((district, name)) or census[district].get(key(name))
        if not census_name:
            problems.append(f"{district}/{name}: no census match")
            continue
        sector_match[index] = (district, census_name)
        simple = [[simplify(ring, 0.2) for ring in poly] for poly in polygons]
        xs = [x for poly in polygons for x, _ in poly[0]]
        ys = [y for poly in polygons for _, y in poly[0]]
        sectors[district].append({"sector": census_name, "d": path(simple, 2),
                                  "bbox": [round(min(xs), 2), round(min(ys), 2), round(max(xs), 2), round(max(ys), 2)]})
    matched = {(d, s["sector"]) for d, items in sectors.items() for s in items}
    missing = [(d, s) for d, names in census.items() for s in names.values() if (d, s) not in matched]
    return {"viewBox": f"0 0 {WIDTH:.0f} {height:.0f}", "districts": districts}, sectors, problems, missing, sector_match


# ------------------------------------------------------------------------------------------------ tables
def build_districts():
    rows = read_csv("district_indicators_long.csv")
    meta, districts = {}, {}
    for row in rows:
        meta.setdefault(row["indicator_id"], {
            "label": row["indicator"], "unit": row["unit"], "year": row["year"], "source": row["source"],
            "table": row["table"], "status": row["status"],
        })
        district = districts.setdefault(row["district"], {
            "name": row["district"], "slug": slug(row["district"]), "province": row["province"], "values": {},
        })
        value = {"v": num(row["value"])}
        for field, short in [("se", "se"), ("ci_low", "lo"), ("ci_high", "hi")]:
            if row[field] not in ("", None):
                value[short] = num(row[field])
        district["values"][row["indicator_id"]] = value
    return {"indicators": meta, "districts": sorted(districts.values(), key=lambda d: d["name"])}


def build_sectors(paths):
    sae = {(r["district"], r["sector"]): r for r in read_csv("sector_poverty_eicv7_sae.csv")}
    result = defaultdict(list)
    shapes = {(d, s["sector"]): s for d, items in paths.items() for s in items}
    for row in read_csv("sector_census2022.csv"):
        district, sector = row["district"], row["sector"]
        estimate = sae.get((district, sector), {})
        shape = shapes.get((district, sector), {})
        result[district].append({
            "sector": sector,
            "population": num(row["population_2022"]),
            "nonpoor": num(row["nonpoor_pct"]), "vulnerable": num(row["vulnerable_pct"]),
            "moderatelyPoor": num(row["moderately_poor_pct"]), "severelyPoor": num(row["severely_poor_pct"]),
            "mpiHeadcount": num(row["mpi_headcount_pct"]), "mpi": num(row["mpi"]),
            "povertySae": num(estimate.get("poverty_rate_sae_pct")),
            "d": shape.get("d"), "bbox": shape.get("bbox"),
        })
    return dict(result)


def build_usage():
    rows = []
    for row in read_csv("dhs2025_mobile_bank_by_group.csv"):
        rows.append({
            "sex": row["sex"], "group": row["group"], "category": row["category"],
            "phone": num(row["own_mobile_phone_pct"]), "smartphone": num(row["own_smartphone_pct"]),
            "mobileMoney": num(row["used_mobile_phone_financial_12m_pct"]), "bank": num(row["has_and_uses_bank_account_pct"]),
            "bankActive": num(row["bank_deposit_or_withdrawal_12m_pct"]), "either": num(row["bank_or_mobile_financial_12m_pct"]),
            "n": num(row["respondents_weighted_n"]),
        })
    return rows


def build_vup():
    delivery = [{
        "component": r["component"], "table": r["table"], "block": r["block"], "category": r["category"],
        "extremelyPoor": num(r["extremely_poor"]), "moderatelyPoor": num(r["moderately_poor"]),
        "nonPoor": num(r["non_poor"]), "all": num(r["all_beneficiaries"]),
    } for r in read_csv("vup_benefit_delivery_eicv7.csv")]
    trend = [{**r, "pct": num(r["pct"]), "base_n": num(r["base_n"])} for r in read_csv("vup_timeliness_trend.csv")]
    return {"delivery": delivery, "trend": trend}


# ------------------------------------------------------------------------------------ GeoJSON for MapLibre
PUBLIC_GEO = REPO / "apps" / "web" / "public" / "geo"


def lonlat_polygons(geometry, tolerance: float):
    """Simplified polygons in longitude/latitude, rounded to 4 decimals (about 11 m)."""
    polygons = []
    for polygon in rings_of(geometry):
        rings = []
        for ring in polygon:
            points = simplify([tuple(pt) for pt in ring], tolerance)
            rings.append([[round(x, 4), round(y, 4)] for x, y in points])
        polygons.append(rings)
    return {"type": "MultiPolygon", "coordinates": polygons}


def write_lonlat_geojson(sector_match: dict) -> None:
    """District and sector outlines for the interactive MapLibre map, loaded by the browser on demand."""
    adm2 = json.loads((GEO / "geoBoundaries-RWA-ADM2_simplified.geojson").read_text(encoding="utf-8"))["features"]
    adm3 = json.loads((GEO / "geoBoundaries-RWA-ADM3_simplified.geojson").read_text(encoding="utf-8"))["features"]
    province = {r["district"]: r["province"] for r in read_csv("sector_census2022.csv")}
    census = {(r["district"], r["sector"]): r for r in read_csv("sector_census2022.csv")}
    sae = {(r["district"], r["sector"]): r for r in read_csv("sector_poverty_eicv7_sae.csv")}

    districts = [{
        "type": "Feature",
        "properties": {"name": f["properties"]["shapeName"], "slug": slug(f["properties"]["shapeName"]),
                       "province": province.get(f["properties"]["shapeName"])},
        "geometry": lonlat_polygons(f["geometry"], 0.0006),
    } for f in adm2]

    sectors = []
    for index, feature in enumerate(adm3):
        if index not in sector_match:
            continue
        district, sector = sector_match[index]
        row, estimate = census[(district, sector)], sae.get((district, sector), {})
        sectors.append({
            "type": "Feature",
            "properties": {
                "district": district, "districtSlug": slug(district), "sector": sector,
                "povertySae": num(estimate.get("poverty_rate_sae_pct")), "mpiHeadcount": num(row["mpi_headcount_pct"]),
                "severelyPoor": num(row["severely_poor_pct"]), "population": num(row["population_2022"]),
            },
            "geometry": lonlat_polygons(feature["geometry"], 0.00025),
        })

    PUBLIC_GEO.mkdir(parents=True, exist_ok=True)
    for name, features in [("districts.geojson", districts), ("sectors.geojson", sectors)]:
        target = PUBLIC_GEO / name
        target.write_text(json.dumps({"type": "FeatureCollection", "features": features}, separators=(",", ":")),
                          encoding="utf-8")
        print(f"-> {target.relative_to(REPO)} ({target.stat().st_size / 1024:.0f} KB, {len(features)} features)")


def write(name: str, payload) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / name
    target.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"-> {target.relative_to(REPO)} ({target.stat().st_size / 1024:.0f} KB)")


def main() -> None:
    geo, sector_paths, problems, missing, sector_match = build_geo()
    for problem in problems:
        print("WARNING", problem)
    for district, sector in missing:
        print(f"WARNING no boundary for census sector {district}/{sector}")
    write("geo.json", geo)
    write("districts.json", build_districts())
    write("sectors.json", build_sectors(sector_paths))
    write("usage.json", build_usage())
    write("vup.json", build_vup())
    write_lonlat_geojson(sector_match)


if __name__ == "__main__":
    main()
