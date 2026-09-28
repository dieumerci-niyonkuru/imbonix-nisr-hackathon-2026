/**
 * Presentation metadata for every district indicator: which dimension it belongs to, which direction is
 * better, how to format it, and the published national figure where one exists. Values, sources, years and
 * status labels come from the generated data (scripts/data/build_web_data.py), never from here.
 */

import { DIMENSION_COLORS } from "@/lib/palette";

/** A dimension's accent, ink and ramp, copied so the ramp is a plain mutable array. */
function colors(dimension: keyof typeof DIMENSION_COLORS) {
  const { accent, ink, ramp } = DIMENSION_COLORS[dimension];
  return { accent, ink, ramp: [...ramp] };
}

export type Dimension = "poverty" | "finance" | "digital" | "nutrition" | "shocks" | "work" | "health" | "people";
export type Better = "lower" | "higher" | "neutral";
export type Format = "pct" | "count" | "rwf" | "per" | "index";

export type IndicatorMeta = {
  id: string;
  short: string;
  dimension: Dimension;
  better: Better;
  format: Format;
  /** Published national figure, when NISR reports one. */
  national?: number;
  /** Caveat shown next to the indicator. */
  note?: string;
  /** Offered as a layer on the district map. */
  layer?: boolean;
};

export type DimensionInfo = {
  label: string;
  question: string;
  accent: string;
  /** The accent darkened to at least 4.5:1 on white and the page background, for text. */
  ink: string;
  /** Five colours, light to dark. Darker always means more vulnerable on that measure. */
  ramp: string[];
  headline?: string;
};

export const DIMENSIONS: Record<Dimension, DimensionInfo> = {
  poverty: {
    label: "Poverty",
    question: "Can households meet basic needs?",
    ...colors("poverty"),
    headline: "eicv7_poverty_rate",
  },
  finance: {
    label: "Financial access",
    question: "Can adults use formal financial services?",
    ...colors("finance"),
    headline: "finscope_not_formally_included",
  },
  nutrition: {
    label: "Nutrition",
    question: "Are children and households well fed?",
    ...colors("nutrition"),
    headline: "dhs_stunting",
  },
  shocks: {
    label: "Shocks",
    question: "How exposed are households to natural hazards?",
    ...colors("shocks"),
    headline: "cfsva_hazard_any",
  },
  digital: {
    label: "Digital readiness",
    question: "Do households have the phones and internet that digital finance needs?",
    ...colors("digital"),
  },
  work: {
    label: "Work & income",
    question: "Do people have decent work and earnings?",
    ...colors("work"),
  },
  health: {
    label: "Health cover",
    question: "Are people covered by health insurance?",
    ...colors("health"),
  },
  people: {
    label: "Population",
    question: "Who lives here?",
    ...colors("people"),
  },
};

export const CORE_DIMENSIONS: Dimension[] = ["poverty", "finance", "nutrition", "shocks"];

const FINSCOPE_NOTE = "FinScope district samples are about 400 adults, so values carry roughly ±3 points of uncertainty.";

export const INDICATORS: IndicatorMeta[] = [
  // Poverty and living standards
  {
    id: "eicv7_poverty_rate",
    short: "Poverty rate",
    dimension: "poverty",
    better: "lower",
    format: "pct",
    national: 27.4,
    layer: true,
    note: "Direct survey estimate with its 95% confidence interval.",
  },
  {
    id: "census_mpi_headcount",
    short: "Multidimensionally poor (census)",
    dimension: "poverty",
    better: "lower",
    format: "pct",
    layer: true,
    note: "Census 2022 full count: no sampling error.",
  },
  {
    id: "census_severely_poor",
    short: "Severely poor (nonmonetary)",
    dimension: "poverty",
    better: "lower",
    format: "pct",
    layer: true,
  },
  { id: "census_moderately_poor", short: "Moderately poor (nonmonetary)", dimension: "poverty", better: "lower", format: "pct" },
  { id: "census_vulnerable", short: "Vulnerable (nonmonetary)", dimension: "poverty", better: "lower", format: "pct" },
  { id: "census_nonpoor", short: "Not poor (nonmonetary)", dimension: "poverty", better: "higher", format: "pct" },
  { id: "census_mpi", short: "Multidimensional Poverty Index", dimension: "poverty", better: "lower", format: "index" },
  { id: "eicv7_electricity_lighting", short: "Lit mainly by electricity", dimension: "poverty", better: "higher", format: "pct" },
  { id: "census_electricity", short: "Access to electricity (census)", dimension: "poverty", better: "higher", format: "pct" },
  { id: "eicv7_improved_water", short: "Improved drinking water", dimension: "poverty", better: "higher", format: "pct" },
  { id: "eicv7_improved_sanitation", short: "Improved sanitation", dimension: "poverty", better: "higher", format: "pct" },
  { id: "eicv7_metal_roof", short: "Metal sheet roof", dimension: "poverty", better: "higher", format: "pct" },
  { id: "eicv7_umudugudu", short: "Living in umudugudu settlements", dimension: "poverty", better: "neutral", format: "pct" },

  // Financial access
  {
    id: "finscope_not_formally_included",
    short: "Not formally included",
    dimension: "finance",
    better: "lower",
    format: "pct",
    national: 8,
    layer: true,
    note: `Adults using only informal services or none at all. ${FINSCOPE_NOTE}`,
  },
  {
    id: "finscope_excluded",
    short: "Financially excluded",
    dimension: "finance",
    better: "lower",
    format: "pct",
    national: 4,
    layer: true,
    note: `${FINSCOPE_NOTE} Nyarugenge is not reported separately.`,
  },
  {
    id: "finscope_informal_only",
    short: "Informal services only",
    dimension: "finance",
    better: "lower",
    format: "pct",
    national: 4,
    layer: true,
    note: FINSCOPE_NOTE,
  },
  {
    id: "finscope_banked",
    short: "Banked (own account)",
    dimension: "finance",
    better: "higher",
    format: "pct",
    national: 22,
    layer: true,
    note: FINSCOPE_NOTE,
  },
  {
    id: "finscope_other_formal_only",
    short: "Formal nonbank only",
    dimension: "finance",
    better: "neutral",
    format: "pct",
    national: 70,
    note: "Mobile money, SACCOs, insurance or pensions, but no bank.",
  },
  {
    id: "finscope_formally_included",
    short: "Formally included",
    dimension: "finance",
    better: "higher",
    format: "pct",
    national: 92,
  },
  {
    id: "finscope2020_banked_incl_otc",
    short: "Used bank services, 2020",
    dimension: "finance",
    better: "higher",
    format: "pct",
    national: 36,
    layer: true,
    note: "Includes over the counter users without their own account. Not comparable with the 2024 'banked' figure.",
  },
  {
    id: "calc_excluded_adults_2024",
    short: "Excluded adults (approx.)",
    dimension: "finance",
    better: "neutral",
    format: "count",
    note: "FinScope district rate × 2024 adult projection.",
  },
  {
    id: "calc_informal_only_adults_2024",
    short: "Adults using only informal finance (approx.)",
    dimension: "finance",
    better: "neutral",
    format: "count",
    note: "FinScope district rate × 2024 adult projection.",
  },
  {
    id: "calc_rssb_members_per_100_adults",
    short: "RSSB contributors per 100 adults",
    dimension: "finance",
    better: "higher",
    format: "per",
    layer: true,
    note: "Counts people where employers register them, not only where they live.",
  },
  { id: "rssb_active_members", short: "RSSB contributing members", dimension: "finance", better: "neutral", format: "count" },

  // Digital readiness
  {
    id: "eicv7_hh_smartphone",
    short: "Households with a smartphone",
    dimension: "digital",
    better: "higher",
    format: "pct",
    layer: true,
  },
  {
    id: "census_internet_use_16plus",
    short: "Adults who used the internet",
    dimension: "digital",
    better: "higher",
    format: "pct",
    layer: true,
  },
  {
    id: "eicv7_hh_mobile_phone",
    short: "Households with a mobile phone",
    dimension: "digital",
    better: "higher",
    format: "pct",
    layer: true,
  },
  { id: "eicv7_internet_home", short: "Internet access at home", dimension: "digital", better: "higher", format: "pct" },
  {
    id: "census_hh_mobile_phone",
    short: "Households with a phone (census)",
    dimension: "digital",
    better: "higher",
    format: "pct",
  },

  // Nutrition and food
  {
    id: "dhs_stunting",
    short: "Child stunting",
    dimension: "nutrition",
    better: "lower",
    format: "pct",
    national: 26.8,
    layer: true,
    note: "DHS 2025 measured about 160 to 550 children per district.",
  },
  { id: "dhs_severe_stunting", short: "Severe stunting", dimension: "nutrition", better: "lower", format: "pct", national: 6.4 },
  {
    id: "dhs_underweight",
    short: "Underweight children",
    dimension: "nutrition",
    better: "lower",
    format: "pct",
    national: 6.1,
    layer: true,
  },
  { id: "dhs_wasting", short: "Wasted children", dimension: "nutrition", better: "lower", format: "pct", national: 0.9 },
  {
    id: "cfsva_inadequate_food_consumption",
    short: "Inadequate food consumption",
    dimension: "nutrition",
    better: "lower",
    format: "pct",
    national: 17,
    layer: true,
    note: "Poor plus borderline food consumption; the sum of two rounded chart labels.",
  },
  { id: "cfsva_fcs_borderline", short: "Borderline food consumption", dimension: "nutrition", better: "lower", format: "pct" },
  { id: "cfsva_fcs_poor", short: "Poor food consumption", dimension: "nutrition", better: "lower", format: "pct" },

  // Shocks
  {
    id: "cfsva_hazard_any",
    short: "Hit by a natural hazard",
    dimension: "shocks",
    better: "lower",
    format: "pct",
    layer: true,
    note: "Measured from CFSVA 2024 Figure 8.4 (about ±1 point); the 12 months before April 2024.",
  },
  { id: "cfsva_hazard_drought", short: "Mainly drought", dimension: "shocks", better: "lower", format: "pct", layer: true },
  {
    id: "cfsva_hazard_floods",
    short: "Mainly floods or heavy rain",
    dimension: "shocks",
    better: "lower",
    format: "pct",
    layer: true,
  },
  { id: "cfsva_hazard_landslides", short: "Mainly landslides", dimension: "shocks", better: "lower", format: "pct", layer: true },

  // Work and income
  { id: "lfs_unemployment_rate", short: "Unemployment", dimension: "work", better: "lower", format: "pct", layer: true },
  {
    id: "lfs_neet_youth",
    short: "Youth not in work or education (NEET)",
    dimension: "work",
    better: "lower",
    format: "pct",
    national: 24.5,
    layer: true,
  },
  { id: "lfs_labour_underutilisation", short: "Labour underutilisation", dimension: "work", better: "lower", format: "pct" },
  {
    id: "lfs_median_monthly_earnings",
    short: "Median monthly earnings",
    dimension: "work",
    better: "higher",
    format: "rwf",
    layer: true,
    note: "Main job, 2025. LFS medians cluster at round amounts.",
  },
  { id: "lfs_participation_rate", short: "Labour force participation", dimension: "work", better: "higher", format: "pct" },
  { id: "lfs_employment_ratio", short: "Employment to population ratio", dimension: "work", better: "higher", format: "pct" },
  { id: "lfs_outside_labour_force", short: "Outside the labour force", dimension: "work", better: "neutral", format: "pct" },
  { id: "eicv7_workforce_ratio", short: "Workforce to population (EICV7)", dimension: "work", better: "higher", format: "pct" },
  {
    id: "ec_informal_employment_share",
    short: "Informal jobs in establishments",
    dimension: "work",
    better: "lower",
    format: "pct",
    layer: true,
  },
  { id: "ec_informal_enterprises_share", short: "Informal enterprises", dimension: "work", better: "lower", format: "pct" },
  {
    id: "calc_establishments_per_1000_adults",
    short: "Establishments per 1,000 adults",
    dimension: "work",
    better: "higher",
    format: "per",
  },
  { id: "ec_establishments", short: "Establishments", dimension: "work", better: "neutral", format: "count" },

  // Health cover
  { id: "eicv7_health_insurance", short: "Health insurance", dimension: "health", better: "higher", format: "pct", layer: true },
  { id: "census_medical_insurance", short: "Medical insurance (census)", dimension: "health", better: "higher", format: "pct" },
  { id: "cbhi_registrations", short: "Mutuelle (CBHI) registrations", dimension: "health", better: "neutral", format: "count" },

  // People
  { id: "census_population", short: "Population, 2022", dimension: "people", better: "neutral", format: "count", layer: true },
  { id: "proj_adults_16plus_2024", short: "Adults 16+ (2024)", dimension: "people", better: "neutral", format: "count" },
  { id: "proj_women_16plus_2024", short: "Women 16+ (2024)", dimension: "people", better: "neutral", format: "count" },
  { id: "proj_youth_16_30_2024", short: "Youth 16 to 30 (2024)", dimension: "people", better: "neutral", format: "count" },
  { id: "proj_adults_16plus_2026", short: "Adults 16+ (2026)", dimension: "people", better: "neutral", format: "count" },
  { id: "proj_women_16plus_2026", short: "Women 16+ (2026)", dimension: "people", better: "neutral", format: "count" },
  { id: "proj_youth_16_30_2026", short: "Youth 16 to 30 (2026)", dimension: "people", better: "neutral", format: "count" },
  { id: "census_female_headed_hh", short: "Households headed by women", dimension: "people", better: "neutral", format: "pct" },
  {
    id: "eicv7_hh_sending_transfers",
    short: "Households sending transfers",
    dimension: "people",
    better: "neutral",
    format: "pct",
  },
];

export const INDICATOR_BY_ID: Record<string, IndicatorMeta> = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));

export const MAP_LAYERS = INDICATORS.filter((i) => i.layer);

export function meta(id: string): IndicatorMeta {
  const found = INDICATOR_BY_ID[id];
  if (!found) throw new Error(`Unknown indicator ${id}`);
  return found;
}
