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

/** A value in its unit: 27.4%, 13,246,394, RWF 31,200, 36 per 1,000 or 32 minutes. */
export function formatPoint(value: number, unit: string): string {
  const whole = (digits: number) => value.toLocaleString("en-US", { maximumFractionDigits: digits });
  switch (unit) {
    case "%":
      return `${whole(1)}%`;
    case "RWF":
      return `RWF ${whole(0)}`;
    case "persons":
      return whole(0);
    case "minutes":
      return `${whole(1)} minutes`;
    case "per 1,000":
    case "per 100,000":
      return `${whole(1)} ${unit}`;
    default:
      return whole(1);
  }
}
