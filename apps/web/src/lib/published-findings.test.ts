import { describe, expect, it } from "vitest";
import { FINANCIAL_HEALTH_SEGMENTS } from "@/lib/finscope-2024";
import { TARGET_PROGRESS } from "@/lib/national-targets";

describe("published findings on the homepage", () => {
  it("keeps the four FinScope financial health segments, adding to 100 within rounding", () => {
    expect(FINANCIAL_HEALTH_SEGMENTS.map((row) => row.segment)).toEqual([
      "Financially healthy",
      "Coping",
      "Vulnerable",
      "Extremely vulnerable",
    ]);
    const total = FINANCIAL_HEALTH_SEGMENTS.reduce((sum, row) => sum + row.share, 0);
    expect(Math.abs(total - 100)).toBeLessThanOrEqual(1);
  });

  it("sets every national target above its baseline", () => {
    for (const row of TARGET_PROGRESS) expect(row.target).toBeGreaterThan(row.baseline);
  });
});
