import type { IndicatorMeta } from "@/lib/indicators";

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** A rank as a plain-English ordinal, e.g. 1 -> "1st", 2 -> "2nd", 7 -> "7th", so ranks read clearly, not as "#7". */
export function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = n % 100;
  return `${n}${suffixes[(value - 20) % 10] ?? suffixes[value] ?? suffixes[0]}`;
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

/** Percentages keep one decimal when the source has decimals, and none when it publishes whole numbers. */
export function formatValue(indicator: Pick<IndicatorMeta, "format">, value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "n/a";
  switch (indicator.format) {
    case "pct":
      return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
    case "count":
      return whole.format(value);
    case "rwf":
      return `RWF ${whole.format(value)}`;
    case "per":
      return value.toFixed(1);
    case "index":
      return value.toFixed(3);
  }
}

export function formatDiff(indicator: Pick<IndicatorMeta, "format">, diff: number): string {
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "±";
  const magnitude = Math.abs(diff);
  if (indicator.format === "pct") return `${sign}${magnitude < 10 ? magnitude.toFixed(1) : Math.round(magnitude)} pts`;
  return `${sign}${formatValue(indicator, magnitude)}`;
}

export const STATUS_LABEL: Record<string, string> = {
  observed: "Official estimate",
  calculated: "Our calculation",
  model_estimate: "Model estimate",
  projection: "Projection",
  scenario: "Scenario",
  target: "Policy target",
};

/** A screen reader summary of 100% bars: each category with its shares. */
export function describeShares(
  rows: Record<string, string | number>[],
  categoryKey: string,
  series: { key: string; label: string }[],
) {
  return rows
    .map((row) => `${row[categoryKey]}: ${series.map((segment) => `${segment.label} ${row[segment.key]}%`).join(", ")}`)
    .join("; ");
}
