import type { ChartEntry } from "@/lib/chart-index";

/** The kind of picture a chart is, so the chart library can be scanned and filtered by shape. */
export type ChartKind = "trend" | "ranking" | "comparison" | "relationship" | "map";

/** The order kinds appear in the filter chips. */
export const KIND_ORDER: ChartKind[] = ["trend", "ranking", "comparison", "relationship", "map"];

/**
 * What shape each chart on the site is. Kept here so a test can check it stays in step with the chart index; the
 * chart library reads it to show a type icon and to filter. Anything unlisted is treated as a ranking or share.
 */
export const KIND_BY_ID: Record<string, ChartKind> = {
  "chart-inclusion-by-service": "comparison",
  "chart-financial-health": "ranking",
  "chart-access-strand": "comparison",
  "chart-mobile-money": "comparison",
  "chart-credit-sources": "ranking",
  "chart-bank-account-by-sex": "comparison",
  "chart-province-poverty-finance": "comparison",
  "chart-use-by-wealth": "comparison",
  "chart-poverty-trend": "comparison",
  "chart-living-conditions": "comparison",
  "chart-electricity": "ranking",
  "chart-cooking-fuel": "ranking",
  "chart-literacy": "ranking",
  "chart-settlement": "ranking",
  "chart-payment-timeliness": "ranking",
  "chart-national-targets": "comparison",
  "chart-vup-poverty": "comparison",
  "chart-vup-by-sex": "comparison",
  "chart-vup-programmes": "ranking",
  "chart-dashboard-access": "ranking",
  "chart-dashboard-health": "ranking",
  "chart-dashboard-poverty-trend": "comparison",
  "chart-dashboard-poverty-province": "ranking",
  "chart-poverty-by-province-change": "comparison",
  "chart-extreme-poverty-by-province-change": "comparison",
  "chart-population-censuses": "trend",
  "chart-household-size": "trend",
  "chart-homes-over-time": "trend",
  "chart-services-over-time": "trend",
  "chart-child-mortality": "trend",
  "chart-maternal-mortality": "trend",
  "chart-child-nutrition": "trend",
  "chart-maternal-child-care": "trend",
  "chart-labour-market": "trend",
  "chart-district-unemployment-spread": "trend",
  "chart-district-map": "map",
  "chart-usage-explorer": "comparison",
  "chart-vup-timeliness": "ranking",
  "chart-vup-timeliness-by-poverty": "ranking",
  "chart-vup-payment-channel": "ranking",
  "chart-vup-amounts": "ranking",
  "chart-vup-timeliness-trend": "trend",
  "chart-priority-explorer": "ranking",
  "chart-priority-matrix": "relationship",
  "chart-reach-scenario": "ranking",
  "chart-priority-weights": "ranking",
  "overlap-matrix": "relationship",
  "chart-scatter-finance": "relationship",
  "chart-scatter-stunting": "relationship",
};

/** The shape of one chart, falling back to a ranking or share for anything unlisted. */
export const kindOf = (chart: ChartEntry): ChartKind => KIND_BY_ID[chart.id] ?? "ranking";
