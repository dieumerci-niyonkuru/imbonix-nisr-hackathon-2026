import { describe, expect, it } from "vitest";
import { DIMENSIONS } from "@/lib/indicators";
import { NO_DATA } from "@/lib/scales";
import { sectorColors } from "@/lib/sector-colors";
import { sectorsOf } from "@/lib/sectors";

const RAMP = DIMENSIONS.poverty.ramp;

describe("sectorColors", () => {
  it("colours ten sectors in five classes of two, lightest to darkest", () => {
    const sectors = Array.from({ length: 10 }, (_, i) => ({ sector: `S${i}`, povertySae: 10 + i * 5 }));
    const { colors, legend } = sectorColors(sectors);
    expect(legend.map((c) => c.color)).toEqual(RAMP);
    expect(colors.S0).toBe(RAMP[0]);
    expect(colors.S9).toBe(RAMP[4]);
    expect(legend[0]).toEqual({ color: RAMP[0], from: 10, to: 15 });
  });

  it("gives sectors without an estimate the no-data colour and leaves them out of the legend", () => {
    const { colors, legend } = sectorColors([
      { sector: "A", povertySae: 20 },
      { sector: "B", povertySae: null },
    ]);
    expect(colors.B).toBe(NO_DATA);
    expect(legend.flatMap((c) => [c.from, c.to])).not.toContain(null);
  });

  it("covers every estimated sector of a real district exactly once in the legend", () => {
    const sectors = sectorsOf("Nyamagabe");
    const { legend } = sectorColors(sectors);
    const estimates = sectors.map((s) => s.povertySae).filter((v): v is number => v !== null);
    for (const value of estimates) {
      expect(legend.filter((c) => value >= c.from && value <= c.to)).toHaveLength(1);
    }
  });
});
