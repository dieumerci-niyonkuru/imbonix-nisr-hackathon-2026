import { describe, expect, it } from "vitest";
import { DISTRICTS, valueOf } from "@/lib/data";
import { explore, GROUPS, LOCATIONS, PROBLEMS } from "@/lib/intervention-explorer";

describe("intervention explorer", () => {
  it("answers every problem, group and place with evidence, options and limits", () => {
    for (const problem of PROBLEMS)
      for (const group of GROUPS)
        for (const location of ["rwanda", "province:South", "district:nyamagabe"]) {
          const result = explore(problem.id, group.id, location);
          expect(result.evidence.length, `${problem.id} ${group.id} ${location}`).toBeGreaterThan(0);
          expect(result.options.length).toBeGreaterThanOrEqual(2);
          expect(result.limitations.some((line) => line.includes("associations, not causes"))).toBe(true);
        }
  });

  it("offers Rwanda, the 5 provinces and the 30 districts as places", () => {
    expect(LOCATIONS).toHaveLength(36);
  });

  it("uses the published national rate and counts the adults it applies to", () => {
    const result = explore("exclusion", "all", "rwanda");
    expect(result.headline).toBe("8% of adults are outside formal finance in Rwanda");
    const adults = DISTRICTS.reduce((sum, district) => sum + (valueOf(district, "proj_adults_16plus_2024") ?? 0), 0);
    expect(result.affected.count).toBe(Math.round((0.08 * adults) / 100) * 100);
  });

  it("says when a count applies the rate for all adults to a group", () => {
    const result = explore("exclusion", "women", "district:nyamagabe");
    expect(result.evidence[1].source).toContain("DHS 2025");
    expect(result.affected.note).toContain("applies the rate for all adults to women");
  });

  it("does not count people where no published population fits", () => {
    const result = explore("digital", "poorest", "province:South");
    expect(result.affected.count).toBeUndefined();
    expect(result.affected.note).toContain("counted by household");
  });

  it("looks inside a district at its poorest sectors for poverty", () => {
    const result = explore("poverty", "all", "district:nyamagabe");
    expect(result.concentration.title).toBe("The poorest sectors of Nyamagabe");
    const shares = result.concentration.rows.map((row) => row.share);
    expect(shares).toEqual([...shares].sort((first, second) => second - first));
  });

  it("measures work for young people by those not in employment, education or training", () => {
    const result = explore("work", "youth", "rwanda");
    expect(result.headline).toBe("24.5% of young people are not in employment, education or training in Rwanda");
    expect(result.affected.count).toBeGreaterThan(0);
  });
});
