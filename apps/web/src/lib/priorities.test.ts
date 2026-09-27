import { describe, expect, it } from "vitest";
import { districtBySlug, rankOf, reference } from "@/lib/data";
import { meta } from "@/lib/indicators";
import { allFlags, flagsFor, LEVERS, WORST_THIRD } from "@/lib/priorities";

describe("intervention flags", () => {
  const rows = allFlags();

  it("covers all 30 districts, most-flagged first", () => {
    expect(rows).toHaveLength(30);
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].flags.length).toBeGreaterThanOrEqual(rows[i].flags.length);
  });

  it("flags a ranked lever only for districts in the most affected third", () => {
    for (const row of rows) {
      for (const flag of row.flags) {
        if (flag.lever === "deepen") continue;
        expect(flag.rank).toBeLessThanOrEqual(WORST_THIRD);
      }
    }
  });

  it("flags each ranked lever in exactly the districts ranked 1 to 10, ties included", () => {
    for (const lever of LEVERS.filter((l) => l.id !== "deepen")) {
      const indicator = meta(lever.indicatorId);
      for (const row of rows) {
        const rank = rankOf(districtBySlug(row.slug)!, indicator);
        const flagged = row.flags.some((f) => f.lever === lever.id);
        expect(flagged).toBe(Boolean(rank && rank.rank <= WORST_THIRD));
      }
    }
  });

  it("applies the 'deepen use' rule: poverty above national while exclusion is below national", () => {
    for (const row of rows) {
      const d = districtBySlug(row.slug)!;
      const poverty = d.values.eicv7_poverty_rate?.v;
      const excluded = d.values.finscope_not_formally_included?.v;
      const expected =
        poverty !== undefined &&
        excluded !== undefined &&
        poverty > reference("eicv7_poverty_rate").value &&
        excluded < reference("finscope_not_formally_included").value;
      expect(row.flags.some((f) => f.lever === "deepen")).toBe(expected);
    }
  });

  it("explains every flag with its evidence", () => {
    for (const flag of flagsFor(districtBySlug("nyamagabe")!)) expect(flag.evidence.length).toBeGreaterThan(10);
  });
});
