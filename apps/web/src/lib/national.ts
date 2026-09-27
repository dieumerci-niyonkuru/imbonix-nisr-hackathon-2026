/**
 * National figures and official targets, transcribed from published reports. Each carries its source so the
 * dashboard can cite it. Sources are summarised in docs/research/track2-research-dossier.md
 * (sections 2.1-2.5).
 */

export type Source = { name: string; detail: string; url?: string };

export const SRC = {
  finscope: {
    name: "FinScope 2024",
    detail: "NISR / Access to Finance Rwanda, adults 16+, fieldwork September to October 2024",
    url: "https://statistics.gov.rw/statistical-publications/business-establishment-finance-trade/finscope-survey-2024",
  },
  eicv7: {
    name: "EICV7 2023/24",
    detail: "NISR Poverty Profile and Main Indicators reports",
    url: "https://statistics.gov.rw/data-sources/surveys/EICV/integrated-household-living-conditions-survey-7-eicv-7",
  },
  roadmap: {
    name: "National Financial Inclusion Roadmap 2025 to 2030",
    detail: "National Bank of Rwanda and MINECOFIN, Annex 2 KPIs",
    url: "https://www.bnr.rw/documents/National_Financial_Inclusion_Roadmap_2026-2030.pdf",
  },
  nst2: { name: "NST2 2024 to 2029", detail: "Government of Rwanda, results matrix" },
  spssp: { name: "Social Protection Sector Strategic Plan 2024 to 2029", detail: "MINALOC, Annex 2" },
  cfsva: { name: "CFSVA 2024", detail: "WFP, MINAGRI and NISR" },
} satisfies Record<string, Source>;

/** FinScope access strand: each adult counted once, by the most formal service they use. */
export const ACCESS_STRAND = [
  { year: "2020", banked: 22, otherFormal: 55, informalOnly: 16, excluded: 7 },
  { year: "2024", banked: 22, otherFormal: 70, informalOnly: 4, excluded: 4 },
];

/** FinScope 2024 financial health segments, with the Roadmap's 2030 targets. */
export const FINANCIAL_HEALTH = [
  { segment: "Financially healthy", now: 10, target: 20 },
  { segment: "Coping", now: 57, target: 70 },
  { segment: "Vulnerable", now: 31, target: 10 },
  { segment: "Extremely vulnerable", now: 3, target: 0 },
];

export const POVERTY_TREND = [
  { period: "2016/17", poverty: 39.8, extreme: 11.3, note: "modelled on the EICV7 method" },
  { period: "2023/24", poverty: 27.4, extreme: 5.4, note: "95% CI 26.4 to 28.4" },
];

export const POVERTY_BY_PROVINCE = [
  { province: "Western", value: 37.4 },
  { province: "Southern", value: 34.7 },
  { province: "Eastern", value: 26.8 },
  { province: "Northern", value: 20.2 },
  { province: "Kigali City", value: 9.1 },
];

export type Target = {
  label: string;
  baseline: number;
  baselineYear: string;
  target: number;
  targetYear: string;
  unit: "%" | "M";
  /** Whether the target is a reduction (lower is better). */
  lowerIsBetter?: boolean;
  source: Source;
};

export const TARGETS: Target[] = [
  {
    label: "Financially vulnerable adults",
    baseline: 31,
    baselineYear: "2024",
    target: 10,
    targetYear: "2030",
    unit: "%",
    lowerIsBetter: true,
    source: SRC.roadmap,
  },
  {
    label: "Financially healthy adults",
    baseline: 10,
    baselineYear: "2024",
    target: 20,
    targetYear: "2030",
    unit: "%",
    source: SRC.roadmap,
  },
  {
    label: "Adults with savings skills",
    baseline: 14,
    baselineYear: "2024",
    target: 50,
    targetYear: "2030",
    unit: "%",
    source: SRC.roadmap,
  },
  {
    label: "Adults using more than one formal product type",
    baseline: 41,
    baselineYear: "2024",
    target: 65,
    targetYear: "2030",
    unit: "%",
    source: SRC.roadmap,
  },
  {
    label: "Adults with a formal loan",
    baseline: 12.7,
    baselineYear: "2024",
    target: 20,
    targetYear: "2030",
    unit: "%",
    source: SRC.roadmap,
  },
  {
    label: "Active mobile money users",
    baseline: 68.5,
    baselineYear: "2024",
    target: 80,
    targetYear: "2030",
    unit: "%",
    source: SRC.roadmap,
  },
  {
    label: "Poor and vulnerable covered by social protection",
    baseline: 11,
    baselineYear: "2023/24",
    target: 20,
    targetYear: "2028/29",
    unit: "%",
    source: SRC.nst2,
  },
  {
    label: "Community based health insurance coverage",
    baseline: 87.9,
    baselineYear: "2023/24",
    target: 100,
    targetYear: "2029",
    unit: "%",
    source: SRC.spssp,
  },
  {
    label: "Ejo Heza long term savings members",
    baseline: 3.81,
    baselineYear: "2023/24",
    target: 6.1,
    targetYear: "2028/29",
    unit: "M",
    source: SRC.spssp,
  },
];

export const RESILIENCE_FACTS = [
  { value: "88%", label: "ran out of money for food or essentials in the past year", source: SRC.finscope },
  { value: "72%", label: "had a major risk event, most often serious illness", source: SRC.finscope },
  { value: "1%", label: "of those claimed insurance to cope", source: SRC.finscope },
  { value: "76%", label: "receive their income in cash; only 18% digitally", source: SRC.finscope },
];
