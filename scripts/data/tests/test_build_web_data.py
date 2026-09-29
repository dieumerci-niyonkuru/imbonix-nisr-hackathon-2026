"""Tests for the web data build: helper functions, and that the committed JSON matches the committed extracts.

    python -m unittest discover -s scripts/data/tests -v

Standard library only, so CI needs no extra packages.
"""

import csv
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import build_web_data as build  # noqa: E402

STATUSES = {"observed", "calculated", "model_estimate", "projection"}


def generated(name: str):
    return json.loads((build.OUT / name).read_text(encoding="utf-8"))


class HelperTests(unittest.TestCase):
    def test_num_keeps_large_whole_numbers_as_integers_and_rounds_the_rest(self):
        self.assertIsNone(build.num(""))
        self.assertIsNone(build.num(None))
        self.assertEqual(build.num("551103.0"), 551103)
        self.assertIsInstance(build.num("551103.0"), int)
        self.assertEqual(build.num("51.39414"), 51.3941)
        self.assertEqual(build.num("0.148"), 0.148)

    def test_slug_and_key(self):
        self.assertEqual(build.slug("Kigali City"), "kigali-city")
        self.assertEqual(build.slug("Nyamagabe"), "nyamagabe")
        self.assertEqual(build.key("Nyarugenge District"), "nyarugengedistrict")

    def test_ring_area_and_centroid_of_a_unit_square(self):
        square = [(0, 0), (1, 0), (1, 1), (0, 1), (0, 0)]
        self.assertEqual(build.ring_area(square), 1)
        self.assertEqual(build.ring_centroid(square), (0.5, 0.5))

    def test_point_in_polygon(self):
        square = [(0, 0), (2, 0), (2, 2), (0, 2), (0, 0)]
        self.assertTrue(build.inside((1, 1), square))
        self.assertFalse(build.inside((3, 1), square))

    def test_simplify_drops_collinear_points_but_keeps_a_closed_ring(self):
        ring = [(0, 0), (1, 0), (2, 0), (2, 1), (2, 2), (1, 2), (0, 2), (0, 1), (0, 0)]
        result = build.simplify(ring, tolerance=0.01)
        self.assertGreaterEqual(len(result), 4)
        self.assertEqual(result[0], result[-1])
        self.assertNotIn((1, 0), result)

    def test_svg_path_closes_each_ring(self):
        self.assertEqual(build.path([[[(0, 0), (1, 0), (1, 1), (0, 0)]]], 0), "M0,0 1,0 1,1Z")


class ExtractTests(unittest.TestCase):
    def setUp(self):
        with (build.EXTRACTS / "district_indicators_long.csv").open(encoding="utf-8") as handle:
            self.rows = list(csv.DictReader(handle))

    def test_every_row_has_a_source_table_year_and_known_status(self):
        for row in self.rows:
            with self.subTest(indicator=row["indicator_id"], district=row["district"]):
                self.assertTrue(row["source"] and row["table"] and row["year"])
                self.assertIn(row["status"], STATUSES)

    def test_thirty_districts_in_five_provinces(self):
        self.assertEqual(len({row["district"] for row in self.rows}), 30)
        self.assertEqual({row["province"] for row in self.rows}, {"Kigali City", "North", "South", "East", "West"})

    def test_confidence_intervals_contain_their_estimates(self):
        # A few published 100% estimates carry floating-point noise (SE about 1e-15, bounds like 100.0000000000003);
        # the build rounds values to 4 decimals, so allow that noise here.
        tolerance = 1e-9
        for row in self.rows:
            if row["ci_low"] and row["ci_high"]:
                with self.subTest(indicator=row["indicator_id"], district=row["district"]):
                    self.assertLessEqual(float(row["ci_low"]), float(row["value"]) + tolerance)
                    self.assertGreaterEqual(float(row["ci_high"]), float(row["value"]) - tolerance)

    def test_no_indicator_is_repeated_for_a_district(self):
        pairs = [(row["district"], row["indicator_id"]) for row in self.rows]
        self.assertEqual(len(pairs), len(set(pairs)))


class ReproducibilityTests(unittest.TestCase):
    """The committed website data must be exactly what the build script produces from the committed extracts."""

    def test_districts_json_matches_the_extracts(self):
        self.assertEqual(build.build_districts(), generated("districts.json"))

    def test_usage_json_matches_the_extracts(self):
        self.assertEqual(build.build_usage(), generated("usage.json"))

    def test_vup_json_matches_the_extracts(self):
        self.assertEqual(build.build_vup(), generated("vup.json"))

    def test_timeline_json_matches_the_extracts(self):
        self.assertEqual(build.build_timeline(), generated("timeline.json"))

    def test_timeline_points_have_a_known_series_status_and_period(self):
        timeline = generated("timeline.json")
        for point in timeline["national"]:
            self.assertIn(point["id"], timeline["series"])
            self.assertIn(point["status"], STATUSES)
            self.assertTrue(1970 < point["start"] <= point["end"] < 2035, point)
        for points in timeline["districts"].values():
            for point in points:
                self.assertIn(point["id"], timeline["series"])

    def test_every_district_has_a_projected_population_for_each_year_to_2032(self):
        timeline = generated("timeline.json")
        self.assertEqual(len(timeline["districts"]), 30)
        for points in timeline["districts"].values():
            years = sorted(p["year"] for p in points if p["id"] == "projected_population")
            self.assertEqual(years, list(range(2023, 2033)))


if __name__ == "__main__":
    unittest.main()
