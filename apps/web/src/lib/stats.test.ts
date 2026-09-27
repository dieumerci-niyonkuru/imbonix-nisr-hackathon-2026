import { describe, expect, it } from "vitest";
import { correlation, formatR } from "@/lib/stats";

describe("correlation", () => {
  it("is 1 for a measure against itself across all 30 districts", () => {
    const { r, n } = correlation("eicv7_poverty_rate", "eicv7_poverty_rate");
    expect(n).toBe(30);
    expect(r).toBeCloseTo(1, 10);
  });

  it("stays between -1 and 1", () => {
    const { r } = correlation("eicv7_poverty_rate", "eicv7_hh_smartphone");
    expect(Math.abs(r)).toBeLessThanOrEqual(1);
  });

  it("respects a district filter", () => {
    expect(correlation("eicv7_poverty_rate", "dhs_stunting", (d) => d.province !== "Kigali City").n).toBe(27);
  });
});

describe("formatR", () => {
  it("uses two decimals and a true minus sign", () => {
    expect(formatR(0.4567)).toBe("0.46");
    expect(formatR(-0.4567)).toBe("−0.46");
  });
});
