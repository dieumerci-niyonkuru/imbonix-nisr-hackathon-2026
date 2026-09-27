import { DIMENSIONS } from "@/lib/indicators";
import { NO_DATA } from "@/lib/scales";

const SECTOR_RAMP = DIMENSIONS.poverty.ramp;

export type SectorLegendClass = { color: string; from: number; to: number };

/**
 * Colour one district's sectors by their small-area poverty rate, with five quantile classes computed within that
 * district only. Sectors without an estimate get the no-data colour.
 */
export function sectorColors(sectors: { sector: string; povertySae: number | null }[]): {
  colors: Record<string, string>;
  legend: SectorLegendClass[];
} {
  const values = sectors
    .map((s) => s.povertySae)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  const breaks = [1, 2, 3, 4].map((i) => values[Math.min(values.length - 1, Math.floor((i * values.length) / 5))]);
  const classOf = (v: number) => breaks.filter((b) => v >= b).length;
  const colors = Object.fromEntries(
    sectors.map((s) => [s.sector, s.povertySae === null ? NO_DATA : SECTOR_RAMP[classOf(s.povertySae)]]),
  );
  const legend = SECTOR_RAMP.map((color, i) => {
    const members = values.filter((v) => classOf(v) === i);
    return members.length ? { color, from: members[0], to: members[members.length - 1] } : null;
  }).filter((x): x is SectorLegendClass => Boolean(x));
  return { colors, legend };
}
