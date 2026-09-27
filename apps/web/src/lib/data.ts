import districtsJson from "@/data/generated/districts.json";
import geoJson from "@/data/generated/geo.json";
import { INDICATOR_BY_ID, type IndicatorMeta } from "@/lib/indicators";

export type Status = "observed" | "calculated" | "model_estimate" | "projection";

export type Value = { v: number; se?: number; lo?: number; hi?: number };

export type District = {
  name: string;
  slug: string;
  province: string;
  values: Record<string, Value | undefined>;
};

export type SourceMeta = { label: string; unit: string; year: string; source: string; table: string; status: Status };

export type DistrictShape = { name: string; slug: string; d: string; cx: number; cy: number };

const data = districtsJson as unknown as { indicators: Record<string, SourceMeta>; districts: District[] };
const geo = geoJson as unknown as { viewBox: string; districts: DistrictShape[] };

export const DISTRICTS: District[] = data.districts;
export const SOURCES: Record<string, SourceMeta> = data.indicators;
export const SHAPES: DistrictShape[] = geo.districts;
export const VIEWBOX: string = geo.viewBox;

export const PROVINCES = ["Kigali City", "North", "South", "East", "West"] as const;
export const PROVINCE_LABEL: Record<string, string> = {
  "Kigali City": "City of Kigali",
  North: "Northern Province",
  South: "Southern Province",
  East: "Eastern Province",
  West: "Western Province",
};

export function districtBySlug(slug: string): District | undefined {
  return DISTRICTS.find((d) => d.slug === slug);
}

export function valueOf(district: District, id: string): number | undefined {
  return district.values[id]?.v;
}

export function valuesFor(id: string): number[] {
  return DISTRICTS.map((d) => d.values[id]?.v).filter((v): v is number => typeof v === "number");
}

/**
 * A rate for a province, or for Rwanda when no province is given, from district rates each weighted by a district count
 * such as population. This is an IMBONIX calculation, not a published figure; over all 30 districts it reproduces the
 * published national rate, which the tests check.
 */
export function weightedRate(rateId: string, weightId: string, province?: string): number | undefined {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const district of DISTRICTS) {
    if (province && district.province !== province) continue;
    const rate = valueOf(district, rateId);
    const weight = valueOf(district, weightId);
    if (rate === undefined || weight === undefined) continue;
    weightedSum += rate * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : undefined;
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Published national figure, or the median of the 30 districts when NISR publishes none. */
export function reference(id: string): { value: number; label: string } {
  const indicator = INDICATOR_BY_ID[id];
  if (indicator?.national !== undefined) return { value: indicator.national, label: "Rwanda" };
  return { value: median(valuesFor(id)), label: "District median" };
}

/** Rank among districts, where 1 is the most affected (worst) on this measure. */
export function rankOf(district: District, indicator: IndicatorMeta): { rank: number; of: number } | undefined {
  const own = district.values[indicator.id]?.v;
  if (own === undefined) return undefined;
  const values = valuesFor(indicator.id);
  const worse = indicator.better === "higher" ? values.filter((v) => v < own) : values.filter((v) => v > own);
  return { rank: worse.length + 1, of: values.length };
}

export function sortedDistricts(id: string, better: IndicatorMeta["better"]): District[] {
  return DISTRICTS.filter((d) => d.values[id] !== undefined).sort((a, b) => {
    const av = a.values[id]!.v;
    const bv = b.values[id]!.v;
    return better === "higher" ? av - bv : bv - av;
  });
}
