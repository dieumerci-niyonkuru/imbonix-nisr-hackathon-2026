import { describe, expect, it } from "vitest";
import { districtBySlug, rankOf } from "@/lib/data";
import { meta } from "@/lib/indicators";
import { EQUAL_WEIGHTS, reachScenario, weightedPriority, type Weights } from "@/lib/scenarios";

describe("reachScenario", () => {
  it("needs nobody when the target is at or above every district's rate", () => {
    expect(reachScenario(100).every((row) => row.toReach === 0)).toBe(true);
  });

  it("computes (rate - target)% of projected adults, never below zero", () => {
    for (const row of reachScenario(5)) {
      expect(row.toReach).toBe(Math.round((Math.max(0, row.rate - 5) / 100) * row.adults));
      expect(row.toReach).toBeGreaterThanOrEqual(0);
    }
  });

  it("lists districts with the most adults to reach first", () => {
    const rows = reachScenario(0);
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].toReach).toBeGreaterThanOrEqual(rows[i].toReach);
  });
});

describe("weightedPriority", () => {
  it("ranks all 30 districts with scores between 0 and 1", () => {
    const rows = weightedPriority(EQUAL_WEIGHTS);
    expect(rows).toHaveLength(30);
    expect(rows.map((r) => r.rank)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    for (const row of rows) {
      expect(row.score).toBeGreaterThanOrEqual(0);
      expect(row.score).toBeLessThanOrEqual(1);
    }
  });

  it("matches the equal-weights ranking when the weights are equal", () => {
    for (const row of weightedPriority(EQUAL_WEIGHTS)) expect(row.rank).toBe(row.equalRank);
  });

  it("follows the poverty ranking when only poverty is weighted", () => {
    const onlyPoverty: Weights = { ...EQUAL_WEIGHTS, finance: 0, nutrition: 0, shocks: 0 };
    const [top] = weightedPriority(onlyPoverty);
    expect(top.score).toBe(1);
    expect(rankOf(districtBySlug(top.slug)!, meta("eicv7_poverty_rate"))?.rank).toBe(1);
  });

  it("scores every district 0 when all weights are 0", () => {
    const none: Weights = { ...EQUAL_WEIGHTS, poverty: 0, finance: 0, nutrition: 0, shocks: 0 };
    expect(weightedPriority(none).every((row) => row.score === 0)).toBe(true);
  });
});
