import { describe, expect, it } from "vitest";
import { answerQuery } from "./assistant";
import { DISTRICTS } from "./data";

/**
 * The assistant must answer well for EVERY one of Rwanda's 30 districts, not just a few — so a judge or a user can ask
 * about any place and get a clear, sourced figure, even on the on-device engine (the fallback when the live model is
 * unavailable). This guards that: for each district, its name returns an at-a-glance answer with figures, and a poverty
 * question returns a value with a named NISR source.
 */
describe("IMBONIX AI answers for every one of the 30 districts", () => {
  it("covers all 30 districts", () => {
    expect(DISTRICTS.length).toBe(30);
  });

  for (const district of DISTRICTS) {
    it(`gives a grounded, sourced answer for ${district.name}`, () => {
      // The district's own name returns its at-a-glance figures, not the generic fallback.
      const overview = answerQuery(district.name);
      expect(overview.heading.toLowerCase()).toContain(district.name.toLowerCase());
      expect((overview.rows?.length ?? 0) + (overview.stats?.length ?? 0)).toBeGreaterThan(0);

      // Asking about its poverty returns a figure with a named NISR source.
      const poverty = answerQuery(`How poor is ${district.name}?`);
      expect(poverty.heading.toLowerCase()).toContain(district.name.toLowerCase());
      expect(poverty.source ?? "").toMatch(/NISR|EICV|FinScope|Census|DHS|CFSVA|RPHC/i);
    });
  }
});
