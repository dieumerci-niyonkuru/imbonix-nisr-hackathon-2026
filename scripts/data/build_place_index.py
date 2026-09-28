"""Build the place index the site search uses: every sector, cell and village, with the unit each one lies in.

    python scripts/data/build_place_index.py

Inputs, from geoBoundaries gbOpen release 9469f09 (CC BY 4.0, 2012 units), downloaded to data/raw/geo/ if missing:
  ADM2 districts and ADM3 sectors   Open Data Rwanda (NISR open geodata)
  ADM4 cells                         Open Data Rwanda (NISR open geodata)
  ADM5 villages                      The World Bank

Output in apps/web/src/data/generated/:
  places.json   {"sectors": [[sector, district slug]], "cells": [[cell, sector index]],
                 "villages": [[village, cell index]], ...counts and source}

The boundary files name each unit but not its parent, so each cell is placed in the sector that contains a point
inside it, and each village in the cell that contains a point inside it. A village's sector and district are then
those of its cell, so the three levels always agree. Sectors take the district and census spelling that
build_web_data.py already matches for the site's maps.
"""

import json
from pathlib import Path

import build_web_data as web

LEVELS = ("ADM2", "ADM3", "ADM4", "ADM5")
SOURCE = (
    "geoBoundaries gbOpen release 9469f09 (CC BY 4.0), 2012 units: districts, sectors and cells from Open Data "
    "Rwanda (NISR open geodata), villages from the World Bank"
)


def boundary(level: str) -> list[dict]:
    return json.loads((web.GEO / f"geoBoundaries-RWA-{level}_simplified.geojson").read_text(encoding="utf-8"))["features"]


def outer_rings(geometry) -> list[list[tuple[float, float]]]:
    return [[tuple(point) for point in polygon[0]] for polygon in web.rings_of(geometry)]


def interior_point(geometry) -> tuple[float, float]:
    """A point inside the unit's largest polygon: the middle of the widest stretch of a line across its middle."""
    ring = max(outer_rings(geometry), key=lambda points: abs(web.ring_area(points)))
    ys = [y for _, y in ring]
    # A line just off the exact middle, so it never passes through a vertex.
    y = (min(ys) + max(ys)) / 2 + (max(ys) - min(ys)) * 1e-7
    crossings = sorted(
        x1 + (y - y1) * (x2 - x1) / (y2 - y1)
        for (x1, y1), (x2, y2) in zip(ring, ring[1:])
        if (y1 > y) != (y2 > y)
    )
    start, end = max(zip(crossings[0::2], crossings[1::2]), key=lambda pair: pair[1] - pair[0])
    return ((start + end) / 2, y)


class Parents:
    """Finds which parent unit contains a point, checking only the parents whose bounding box holds it."""

    def __init__(self, features: list[dict]):
        self.units = []
        for index, feature in enumerate(features):
            rings = outer_rings(feature["geometry"])
            xs = [x for ring in rings for x, _ in ring]
            ys = [y for ring in rings for _, y in ring]
            self.units.append((index, rings, (min(xs), min(ys), max(xs), max(ys))))

    def containing(self, point: tuple[float, float]) -> int | None:
        x, y = point
        for index, rings, (left, bottom, right, top) in self.units:
            if left <= x <= right and bottom <= y <= top and any(web.inside(point, ring) for ring in rings):
                return index
        return None

    def nearest(self, point: tuple[float, float]) -> int:
        """For the rare point that falls in a gap between simplified outlines: the parent with the closest centre."""
        x, y = point
        return min(
            self.units,
            key=lambda unit: ((unit[2][0] + unit[2][2]) / 2 - x) ** 2 + ((unit[2][1] + unit[2][3]) / 2 - y) ** 2,
        )[0]


def place(children: list[dict], parents: Parents) -> tuple[list[int], int]:
    """The parent index of each child, and how many children needed the nearest parent fallback."""
    indexes, fallbacks = [], 0
    for feature in children:
        point = interior_point(feature["geometry"])
        parent = parents.containing(point)
        if parent is None:
            parent, fallbacks = parents.nearest(point), fallbacks + 1
        indexes.append(parent)
    return indexes, fallbacks


def build() -> dict:
    web.ensure_boundaries(LEVELS)
    _, _, problems, _, sector_match = web.build_geo()
    for problem in problems:
        print("WARNING", problem)

    adm3, adm4, adm5 = boundary("ADM3"), boundary("ADM4"), boundary("ADM5")
    # Sectors in the order of the boundary file, with the district and spelling the site's maps use.
    sectors = [
        [sector_match[index][1], web.slug(sector_match[index][0])] if index in sector_match else [feature["properties"]["shapeName"], ""]
        for index, feature in enumerate(adm3)
    ]
    cell_sector, cell_fallbacks = place(adm4, Parents(adm3))
    village_cell, village_fallbacks = place(adm5, Parents(adm4))
    cells = [[feature["properties"]["shapeName"].strip(), cell_sector[index]] for index, feature in enumerate(adm4)]
    villages = [[feature["properties"]["shapeName"].strip(), village_cell[index]] for index, feature in enumerate(adm5)]
    return {
        "source": SOURCE,
        "counts": {"sectors": len(sectors), "cells": len(cells), "villages": len(villages)},
        "placedByNearestCentre": {"cells": cell_fallbacks, "villages": village_fallbacks},
        "sectors": sectors,
        "cells": cells,
        "villages": villages,
    }


def main() -> None:
    index = build()
    print(f"cells placed by nearest centre: {index['placedByNearestCentre']['cells']} of {index['counts']['cells']}")
    print(f"villages placed by nearest centre: {index['placedByNearestCentre']['villages']} of {index['counts']['villages']}")
    web.write("places.json", index)


if __name__ == "__main__":
    main()
