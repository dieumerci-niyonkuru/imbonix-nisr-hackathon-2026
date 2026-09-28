"""Tests for the place index the site search uses: the point finder, and that the committed index is complete.

    python -m unittest discover -s scripts/data/tests -v

Standard library only, and no downloads: the index tests read the committed places.json.
"""

import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import build_place_index as places  # noqa: E402
import build_web_data as web  # noqa: E402


def polygon(ring):
    return {"type": "Polygon", "coordinates": [ring]}


class InteriorPointTests(unittest.TestCase):
    def test_the_point_lies_inside_a_concave_shape(self):
        # A U shape: its centre of area falls in the gap between the arms, outside the shape.
        u_shape = [[0, 0], [6, 0], [6, 6], [4, 6], [4, 2], [2, 2], [2, 6], [0, 6], [0, 0]]
        point = places.interior_point(polygon(u_shape))
        self.assertTrue(web.inside(point, [tuple(p) for p in u_shape]))

    def test_the_parent_finder_picks_the_unit_that_contains_the_point(self):
        left = {"geometry": polygon([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]])}
        right = {"geometry": polygon([[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]])}
        parents = places.Parents([left, right])
        self.assertEqual(parents.containing((1.5, 0.5)), 1)
        self.assertIsNone(parents.containing((5, 5)))
        self.assertEqual(parents.nearest((5, 0.5)), 1)


class PlaceIndexTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.index = json.loads((web.OUT / "places.json").read_text(encoding="utf-8"))
        districts = json.loads((web.OUT / "districts.json").read_text(encoding="utf-8"))["districts"]
        cls.district_slugs = {district["slug"] for district in districts}

    def test_every_unit_of_the_2012_boundaries_is_listed(self):
        self.assertEqual(self.index["counts"], {"sectors": 416, "cells": 2148, "villages": 14815})
        self.assertEqual(len(self.index["sectors"]), 416)
        self.assertEqual(len(self.index["cells"]), 2148)
        self.assertEqual(len(self.index["villages"]), 14815)

    def test_every_unit_has_a_name_and_a_valid_parent(self):
        for name, district in self.index["sectors"]:
            self.assertTrue(name)
            self.assertIn(district, self.district_slugs)
        for name, sector in self.index["cells"]:
            self.assertTrue(name)
            self.assertTrue(0 <= sector < len(self.index["sectors"]))
        for name, cell in self.index["villages"]:
            self.assertTrue(name)
            self.assertTrue(0 <= cell < len(self.index["cells"]))

    def test_every_unit_was_placed_by_containment_and_none_is_left_empty(self):
        self.assertEqual(self.index["placedByNearestCentre"], {"cells": 0, "villages": 0})
        sectors_with_cells = {sector for _, sector in self.index["cells"]}
        cells_with_villages = {cell for _, cell in self.index["villages"]}
        self.assertEqual(len(sectors_with_cells), 416)
        self.assertEqual(len(cells_with_villages), 2148)
        districts_with_villages = {self.index["sectors"][self.index["cells"][cell][1]][1] for _, cell in self.index["villages"]}
        self.assertEqual(districts_with_villages, self.district_slugs)

    def test_a_known_sector_holds_its_cells(self):
        # Kimihurura sector, Gasabo district, has three cells.
        sector = next(
            index for index, (name, district) in enumerate(self.index["sectors"]) if (name, district) == ("Kimihurura", "gasabo")
        )
        cells = sorted(name for name, parent in self.index["cells"] if parent == sector)
        self.assertEqual(cells, ["Kamukina", "Kimihurura", "Rugando"])


if __name__ == "__main__":
    unittest.main()
