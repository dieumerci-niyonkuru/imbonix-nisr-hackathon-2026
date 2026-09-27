import { describe, expect, it } from "vitest";
import { valuesFor } from "@/lib/data";
import { DIMENSIONS, meta } from "@/lib/indicators";
import { BRAND, DIVERGING, INK, PAPER, RAMPS, SEVERITY, WHITE } from "@/lib/palette";
import { contrastRatio, NO_DATA, scaleFor, textOn } from "@/lib/scales";

describe("scaleFor", () => {
  const poverty = meta("eicv7_poverty_rate");
  const values = valuesFor(poverty.id);
  const scale = scaleFor(poverty, values);
  const ramp = DIMENSIONS.poverty.ramp;

  it("splits the 30 districts into five classes of six", () => {
    expect(scale.classes).toHaveLength(5);
    for (const c of scale.classes) expect(values.filter((v) => v >= c.from && v <= c.to)).toHaveLength(6);
  });

  it("gives the darkest colour to the most affected districts when lower is better", () => {
    expect(scale.color(Math.max(...values))).toBe(ramp[4]);
    expect(scale.color(Math.min(...values))).toBe(ramp[0]);
  });

  it("reverses the ramp when higher is better, so darker still means more vulnerable", () => {
    const smartphones = meta("eicv7_hh_smartphone");
    expect(smartphones.better).toBe("higher");
    const phoneValues = valuesFor(smartphones.id);
    const phoneScale = scaleFor(smartphones, phoneValues);
    const phoneRamp = DIMENSIONS[smartphones.dimension].ramp;
    expect(phoneScale.color(Math.min(...phoneValues))).toBe(phoneRamp[4]);
    expect(phoneScale.color(Math.max(...phoneValues))).toBe(phoneRamp[0]);
  });

  it("uses the no-data colour for missing values", () => {
    expect(scale.color(undefined)).toBe(NO_DATA);
  });
});

describe("textOn", () => {
  it("picks dark text on light fills and white text on dark fills", () => {
    expect(textOn(PAPER)).toBe(INK);
    expect(textOn(BRAND.navy)).toBe(WHITE);
  });

  it("chooses by contrast, so mid-tone fills get the more readable colour", () => {
    // White on this cyan is only 3.0:1; navy reaches 5.0:1.
    expect(textOn(RAMPS.cyan[1])).toBe(INK);
    expect(contrastRatio(RAMPS.cyan[1], INK)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps every labelled chart fill readable at 4.5:1 or better", () => {
    const labelled = [
      ...Object.values(RAMPS).flat(),
      ...SEVERITY,
      ...DIVERGING.negative,
      ...DIVERGING.positive,
      DIVERGING.neutral,
    ];
    for (const fill of labelled) expect(contrastRatio(fill, textOn(fill))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("dimension ink colours", () => {
  it("reach 4.5:1 on white and on the page background", () => {
    for (const info of Object.values(DIMENSIONS)) {
      expect(contrastRatio(info.ink, WHITE)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(info.ink, PAPER)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
