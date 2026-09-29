import timelineJson from "@/data/generated/timeline.json";

/**
 * Rwanda over the years and each district's yearly series, from scripts/data/build_web_data.py: census totals from
 * 1978, EICV, DHS and LFS rounds from the Statistical Yearbook 2025, province poverty in 2016/17 and 2023/24, each
 * district's LFS labour indicators from 2017 and its projected population from 2023.
 */

export type TimelineSeries = { label: string; unit: string; source: string; table: string };
/** A national or province value for one period: a single year, or a survey period such as 2023/24. */
export type NationalPoint = {
  id: string;
  area: string;
  period: string;
  start: number;
  end: number;
  value: number;
  status: string;
  note?: string;
};
/** A district value for one year; `status` is set when it is not an official estimate. */
export type DistrictPoint = { id: string; year: number; value: number; status?: string };

const TIMELINE = timelineJson as unknown as {
  series: Record<string, TimelineSeries>;
  national: NationalPoint[];
  districts: Record<string, DistrictPoint[]>;
};

/** Rwanda's first census, and the current year. */
export const FIRST_YEAR = 1978;
export const LAST_YEAR = 2026;
/** The 30 districts date from the territorial reform that took effect in 2006. */
export const DISTRICTS_CREATED = 2006;

/** The first and last year of a period: "2023/24" is 2023 to 2024; "2022" is 2022. */
export function periodYears(period: string): [number, number] {
  const [first, last] = period.split("/");
  const start = Number(first);
  return [start, last ? Number(first.slice(0, 2) + last) : start];
}

/** The series, national points and district points a district page needs: Rwanda, its province and itself. */
export function timelineFor(districtSlug: string, province: string) {
  const national = TIMELINE.national.filter((point) => point.area === "Rwanda" || point.area === province);
  const district = TIMELINE.districts[districtSlug] ?? [];
  const used = new Set([...national, ...district].map((point) => point.id));
  const series = Object.fromEntries(Object.entries(TIMELINE.series).filter(([id]) => used.has(id)));
  return { series, national, district };
}

/**
 * One point of a trend: `x` places a survey period at its middle year, so 2023/24 sits between 2023 and 2024 and
 * rounds that are further apart stand further apart.
 */
export type TrendPoint = { x: number; period: string; value: number; status: string };
export type TrendSeries = TimelineSeries & { id: string; area: string; points: TrendPoint[] };

/** A national (or province) series with every published period, oldest first. */
export function nationalSeries(id: string, area = "Rwanda"): TrendSeries {
  const info = TIMELINE.series[id];
  if (!info) throw new Error(`Unknown timeline series ${id}`);
  const points = TIMELINE.national
    .filter((point) => point.id === id && point.area === area)
    .map((point) => ({ x: (point.start + point.end) / 2, period: point.period, value: point.value, status: point.status }))
    .sort((first, second) => first.x - second.x);
  return { id, area, ...info, points };
}

/** The first and latest point of a series. */
export function firstAndLatest(series: TrendSeries): [TrendPoint, TrendPoint] {
  return [series.points[0], series.points[series.points.length - 1]];
}

/** How the 30 districts spread in one year: the lowest, the median and the highest, with the districts named. */
export type DistrictSpreadYear = {
  year: number;
  low: number;
  lowDistrict: string;
  median: number;
  high: number;
  highDistrict: string;
  /** Set when any district's value that year is our calculation rather than published. */
  calculated: boolean;
};

/** For each year of a district series, the lowest, median and highest district. `names` maps a slug to its name. */
export function districtSpread(id: string, names: Record<string, string>): DistrictSpreadYear[] {
  const byYear = new Map<number, { district: string; value: number; status?: string }[]>();
  for (const [slug, points] of Object.entries(TIMELINE.districts)) {
    for (const point of points.filter((candidate) => candidate.id === id)) {
      byYear.set(point.year, [
        ...(byYear.get(point.year) ?? []),
        { district: names[slug] ?? slug, value: point.value, status: point.status },
      ]);
    }
  }
  return [...byYear.entries()]
    .sort(([first], [second]) => first - second)
    .map(([year, rows]) => {
      const sorted = [...rows].sort((first, second) => first.value - second.value);
      const middle = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 ? sorted[middle].value : (sorted[middle - 1].value + sorted[middle].value) / 2;
      return {
        year,
        low: sorted[0].value,
        lowDistrict: sorted[0].district,
        median,
        high: sorted[sorted.length - 1].value,
        highDistrict: sorted[sorted.length - 1].district,
        calculated: rows.some((row) => row.status === "calculated"),
      };
    });
}

/**
 * Rwanda's projected population for each year, as the sum of NISR's projections for the 30 districts. Only years with
 * a projection for every district are included.
 */
export function projectedNationalPopulation(): TrendPoint[] {
  const totals = new Map<number, { sum: number; districts: number }>();
  for (const points of Object.values(TIMELINE.districts)) {
    for (const point of points.filter((candidate) => candidate.id === "projected_population")) {
      const total = totals.get(point.year) ?? { sum: 0, districts: 0 };
      totals.set(point.year, { sum: total.sum + point.value, districts: total.districts + 1 });
    }
  }
  const districtCount = Object.keys(TIMELINE.districts).length;
  return [...totals.entries()]
    .filter(([, total]) => total.districts === districtCount)
    .sort(([first], [second]) => first - second)
    .map(([year, total]) => ({ x: year, period: String(year), value: total.sum, status: "projection" }));
}

/** A value in its unit: 27.4%, 13,246,394, RWF 31,200, 36 per 1,000 or 32 minutes. */
export function formatPoint(value: number, unit: string): string {
  const whole = (digits: number) => value.toLocaleString("en-US", { maximumFractionDigits: digits });
  switch (unit) {
    case "%":
      return `${whole(1)}%`;
    case "RWF":
      return `RWF ${whole(0)}`;
    case "persons":
      // Counts of people are whole; an average such as household size keeps its decimal.
      return whole(value < 100 ? 1 : 0);
    case "minutes":
      return `${whole(1)} minutes`;
    case "per 1,000":
    case "per 100,000":
      return `${whole(1)} ${unit}`;
    default:
      return whole(1);
  }
}
