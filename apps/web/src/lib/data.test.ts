import { describe, expect, it } from "vitest";
import {
  districtBySlug,
  DISTRICTS,
  median,
  PROVINCES,
  rankOf,
  reference,
  SHAPES,
  SOURCES,
  sortedDistricts,
  weightedRate,
} from "@/lib/data";
import { INDICATORS, meta } from "@/lib/indicators";

describe("generated data", () => {
  it("has 30 districts with unique slugs, each with a map shape", () => {
    expect(DISTRICTS).toHaveLength(30);
    expect(new Set(DISTRICTS.map((d) => d.slug)).size).toBe(30);
    for (const d of DISTRICTS) expect(SHAPES.some((s) => s.slug === d.slug)).toBe(true);
  });

  it("places every district in one of the five provinces", () => {
    for (const d of DISTRICTS) expect(PROVINCES).toContain(d.province);
  });

  it("has source metadata for every indicator the site displays", () => {
    const missing = INDICATORS.filter((i) => !SOURCES[i.id]).map((i) => i.id);
    expect(missing).toEqual([]);
  });

  it("labels every source with a known status", () => {
    for (const source of Object.values(SOURCES)) {
      expect(["observed", "calculated", "model_estimate", "projection"]).toContain(source.status);
    }
  });

  it("keeps confidence intervals around their estimates", () => {
    for (const d of DISTRICTS) {
      for (const value of Object.values(d.values)) {
        if (value?.lo !== undefined && value.hi !== undefined) {
          expect(value.lo).toBeLessThanOrEqual(value.v);
          expect(value.hi).toBeGreaterThanOrEqual(value.v);
        }
      }
    }
  });
});

describe("rankOf", () => {
  it("ranks the poorest district first on poverty", () => {
    const poverty = meta("eicv7_poverty_rate");
    const poorest = sortedDistricts(poverty.id, poverty.better)[0];
    expect(rankOf(poorest, poverty)).toEqual({ rank: 1, of: 30 });
    expect(poorest.slug).toBe("nyamagabe");
  });

  it("ranks the district with the fewest smartphones first when higher is better", () => {
    const smartphones = meta("eicv7_hh_smartphone");
    const fewest = [...DISTRICTS].sort((a, b) => a.values[smartphones.id]!.v - b.values[smartphones.id]!.v)[0];
    expect(rankOf(fewest, smartphones)?.rank).toBe(1);
  });

  it("returns undefined when the district has no value", () => {
    const district = { ...districtBySlug("gasabo")!, values: {} };
    expect(rankOf(district, meta("eicv7_poverty_rate"))).toBeUndefined();
  });
});

describe("median and reference", () => {
  it("computes medians for odd and even counts", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it("prefers the published national figure", () => {
    expect(reference("eicv7_poverty_rate")).toEqual({ value: 27.4, label: "Rwanda" });
  });

  it("falls back to the district median when NISR publishes no national figure", () => {
    const withoutNational = INDICATORS.find((i) => i.national === undefined)!;
    expect(reference(withoutNational.id).label).toBe("District median");
  });
});

describe("weightedRate", () => {
  it("reproduces the published national poverty rate from the 30 district rates", () => {
    const national = weightedRate("eicv7_poverty_rate", "census_population")!;
    expect(national).toBeCloseTo(reference("eicv7_poverty_rate").value, 1);
  });

  it("reproduces the published national share outside formal finance to within a point", () => {
    const national = weightedRate("finscope_not_formally_included", "proj_adults_16plus_2024")!;
    expect(Math.abs(national - reference("finscope_not_formally_included").value)).toBeLessThan(1);
  });

  it("gives a rate for each province, between its lowest and highest district", () => {
    for (const province of PROVINCES) {
      const rates = DISTRICTS.filter((d) => d.province === province).map((d) => d.values.eicv7_poverty_rate!.v);
      const rate = weightedRate("eicv7_poverty_rate", "census_population", province)!;
      expect(rate).toBeGreaterThanOrEqual(Math.min(...rates));
      expect(rate).toBeLessThanOrEqual(Math.max(...rates));
    }
  });
});
