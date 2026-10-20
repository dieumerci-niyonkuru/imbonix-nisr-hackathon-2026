import districtsJson from "@/data/generated/districts.json";
import sectorsJson from "@/data/generated/sectors.json";

/**
 * In-app port of the standalone API's data store (apps/api/src/services/data-store.js), so the same read-only JSON API
 * can be served directly from the Next.js app — one Vercel deployment, no separate service. It reads the identical
 * published aggregates the website is built from and produces the identical response shapes, so docs/api.md stays
 * accurate whichever way the API is hosted.
 */

/** Where each sector field comes from. Sector figures have no sampling error except the small-area estimate. */
export const SECTOR_FIELDS: Record<string, { label: string; unit: string; source: string; status: string }> = {
  population: {
    label: "Population",
    unit: "people",
    source: "NISR Population and Housing Census 2022 (RPHC5)",
    status: "observed",
  },
  nonpoor: {
    label: "Non-poor, non-monetary measure",
    unit: "% of population",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.1, 2022",
    status: "observed",
  },
  vulnerable: {
    label: "Vulnerable, non-monetary measure",
    unit: "% of population",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.1, 2022",
    status: "observed",
  },
  moderatelyPoor: {
    label: "Moderately poor, non-monetary measure",
    unit: "% of population",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.1, 2022",
    status: "observed",
  },
  severelyPoor: {
    label: "Severely poor, non-monetary measure",
    unit: "% of population",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.1, 2022",
    status: "observed",
  },
  mpiHeadcount: {
    label: "Multidimensionally poor (headcount)",
    unit: "% of population",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.10, 2022",
    status: "observed",
  },
  mpi: {
    label: "Multidimensional Poverty Index (M0)",
    unit: "index, 0 to 1",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.10, 2022",
    status: "observed",
  },
  povertySae: {
    label: "Poverty rate, small-area estimate",
    unit: "% of population",
    source: "NISR EICV7 district presentations (small-area estimation with the 2022 census), 2023/24",
    status: "model_estimate",
  },
};

type IndicatorMeta = { label: string; unit: string; year: string; source: string; table: string; status: string };
type RawValue = { v: number; se?: number | null; lo?: number | null; hi?: number | null };
type DistrictRow = { name: string; slug: string; province: string; values: Record<string, RawValue> };
type Indicator = IndicatorMeta & { id: string };
type DistrictSummary = { name: string; slug: string; province: string };
type ApiValue = { value: number; standardError: number | null; ciLow: number | null; ciHigh: number | null };

const data = districtsJson as unknown as { indicators: Record<string, IndicatorMeta>; districts: DistrictRow[] };
const sectorData = sectorsJson as unknown as Record<string, Array<Record<string, unknown>>>;

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function toValue(raw: RawValue): ApiValue {
  return { value: raw.v, standardError: raw.se ?? null, ciLow: raw.lo ?? null, ciHigh: raw.hi ?? null };
}

const indicators: Indicator[] = Object.entries(data.indicators)
  .map(([id, meta]) => ({ id, ...meta }))
  .sort((a, b) => a.id.localeCompare(b.id));
const indicatorById = new Map(indicators.map((indicator) => [indicator.id, indicator]));

const districts: DistrictRow[] = data.districts
  .map(({ name, slug, province, values }) => ({ name, slug, province, values }))
  .sort((a, b) => a.name.localeCompare(b.name));
const districtBySlug = new Map(districts.map((district) => [district.slug, district]));

const sectorsBySlug = new Map<string, Array<Record<string, unknown>>>();
for (const district of districts) {
  const rows = sectorData[district.name] ?? [];
  sectorsBySlug.set(
    district.slug,
    // Drop drawing data (SVG paths, bounding boxes); the API serves figures only.
    rows.map(({ d: _path, bbox: _bbox, ...figures }) => figures).sort((a, b) => String(a.sector).localeCompare(String(b.sector))),
  );
}

const summaryOf = (district: DistrictRow): DistrictSummary => ({
  name: district.name,
  slug: district.slug,
  province: district.province,
});

export const provinces = [...new Set(districts.map((district) => district.province))].sort();
export const statuses = [...new Set(indicators.map((indicator) => indicator.status))].sort();
const sectorCount = [...sectorsBySlug.values()].reduce((sum, rows) => sum + rows.length, 0);

export const counts = { districts: districts.length, indicators: indicators.length, sectors: sectorCount };

export function listIndicators({ status }: { status?: string } = {}) {
  return status ? indicators.filter((indicator) => indicator.status === status) : indicators;
}

export function hasIndicator(id: string) {
  return indicatorById.has(id);
}

/** One indicator with its value in every district that has one, highest first. */
export function getIndicator(id: string) {
  const indicator = indicatorById.get(id);
  if (!indicator) return undefined;
  const values = districts
    .filter((district) => district.values[id])
    .map((district) => ({ district: summaryOf(district), ...toValue(district.values[id]) }))
    .sort((a, b) => b.value - a.value);
  const sorted = values.map((row) => row.value).sort((a, b) => a - b);
  const summary = sorted.length
    ? { count: sorted.length, min: sorted[0], median: median(sorted), max: sorted[sorted.length - 1] }
    : { count: 0, min: null, median: null, max: null };
  return { indicator, summary, values };
}

export function listDistricts({ province }: { province?: string } = {}) {
  const rows = province ? districts.filter((district) => district.province === province) : districts;
  return rows.map(summaryOf);
}

/** A district with its indicator values (all of them, or only the ids asked for). */
export function getDistrict(slug: string, { indicators: only }: { indicators?: string[] } = {}) {
  const district = districtBySlug.get(slug);
  if (!district) return undefined;
  const ids = only ?? indicators.map((indicator) => indicator.id);
  const values = ids
    .filter((id) => district.values[id])
    .map((id) => ({ indicator: indicatorById.get(id), ...toValue(district.values[id]) }));
  return { ...summaryOf(district), sectorCount: sectorsBySlug.get(slug)?.length ?? 0, values };
}

export function getSectors(slug: string) {
  const district = districtBySlug.get(slug);
  return district ? { district: summaryOf(district), sectors: sectorsBySlug.get(slug) ?? [] } : undefined;
}
