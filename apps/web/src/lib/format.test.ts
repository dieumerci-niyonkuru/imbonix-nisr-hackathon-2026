import { describe, expect, it } from "vitest";
import { formatDiff, formatNumber, formatValue, STATUS_LABEL } from "@/lib/format";

describe("formatValue", () => {
  it("keeps whole percentages whole and rounds others to one decimal", () => {
    expect(formatValue({ format: "pct" }, 8)).toBe("8%");
    expect(formatValue({ format: "pct" }, 51.3941)).toBe("51.4%");
  });

  it("formats counts, francs, rates and indices", () => {
    expect(formatValue({ format: "count" }, 551103)).toBe("551,103");
    expect(formatValue({ format: "rwf" }, 40000)).toBe("RWF 40,000");
    expect(formatValue({ format: "per" }, 32.0142)).toBe("32.0");
    expect(formatValue({ format: "index" }, 0.148)).toBe("0.148");
  });

  it("shows a dash for missing values", () => {
    expect(formatValue({ format: "pct" }, undefined)).toBe("n/a");
    expect(formatValue({ format: "pct" }, Number.NaN)).toBe("n/a");
  });
});

describe("formatDiff", () => {
  it("writes percentage differences in points with a true minus sign", () => {
    expect(formatDiff({ format: "pct" }, 24)).toBe("+24 pts");
    expect(formatDiff({ format: "pct" }, -3.25)).toBe("−3.3 pts");
    expect(formatDiff({ format: "pct" }, 0)).toBe("±0.0 pts");
  });

  it("uses the indicator's own format for other units", () => {
    expect(formatDiff({ format: "count" }, -1200)).toBe("−1,200");
  });
});

describe("number helpers", () => {
  it("formats fixed decimals", () => {
    expect(formatNumber(1234.5, 1)).toBe("1,234.5");
  });

  it("labels every value status, including scenarios and policy targets", () => {
    expect(Object.keys(STATUS_LABEL).sort()).toEqual([
      "calculated",
      "model_estimate",
      "observed",
      "projection",
      "scenario",
      "target",
    ]);
  });
});
