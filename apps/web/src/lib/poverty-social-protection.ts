/**
 * Findings from the NISR "Poverty and social protection" page: EICV7 2023/24 poverty dynamics and the VUP survey,
 * and a credit and savings table from the Rwanda Household Survey (RHHS) 2019/20. Values are percentages unless
 * named otherwise. Values that are our arithmetic on published ones say so where they are defined.
 */

export const SOCIAL_PROTECTION_SOURCE = "NISR, EICV7 2023/24 and VUP survey";
export const HOUSEHOLD_SURVEY_SOURCE = "NISR, Rwanda Household Survey 2019/20";

/** People who came out of poverty between 2017 and 2024. */
export const PEOPLE_OUT_OF_POVERTY_MILLIONS = 1.5;
export const PEOPLE_OUT_OF_POVERTY_PER_YEAR = 214_000;

export const VUP_BENEFICIARIES = 410_000;

/** Poverty rate nationally and among VUP beneficiaries. */
export const POVERTY_AMONG_VUP_BENEFICIARIES = [
  { group: "All Rwandans", povertyRate: 27.4 },
  { group: "VUP beneficiaries", povertyRate: 40.5 },
];

/** Share of the population and of VUP beneficiaries, by sex. Women's population share is 100 minus the published 47.9% men. */
export const VUP_SHARE_BY_SEX = [
  { sex: "Women", population: 52.1, beneficiaries: 74 },
  { sex: "Men", population: 47.9, beneficiaries: 26 },
];

/** VUP beneficiaries by programme. "Other programmes" is 100 minus the three published shares. */
export const VUP_BENEFICIARIES_BY_PROGRAMME = [
  { programme: "Nutrition sensitive Direct Support", share: 28.8 },
  { programme: "Direct Support", share: 22.7 },
  { programme: "Classic Public Works", share: 22.5 },
  { programme: "Other programmes", share: 26 },
];

/** Where households with credit borrowed, 2019/20. A household can use several sources. */
export const CREDIT_SOURCES = [
  { source: "Tontine", share: 53.4, kind: "informal" },
  { source: "Relative", share: 53.1, kind: "informal" },
  { source: "SACCO", share: 6.3, kind: "formal" },
  { source: "Informal lender", share: 5.5, kind: "informal" },
  { source: "Commercial bank", share: 4.8, kind: "formal" },
  { source: "Credit cooperative", share: 3.5, kind: "formal" },
  { source: "Microfinance", share: 2.4, kind: "formal" },
  { source: "VUP loan", share: 1.6, kind: "government" },
  { source: "Ubudehe loan", share: 0.6, kind: "government" },
  { source: "Employer", share: 0.5, kind: "other" },
  { source: "Other", share: 2.7, kind: "other" },
] as const;

/** Adults aged 18 and over with a bank account, 2019/20. */
export const BANK_ACCOUNT_BY_SEX = [
  { group: "All adults", share: 33.3 },
  { group: "Men", share: 41.1 },
  { group: "Women", share: 26.7 },
];

/** Households where at least one person has a bank account, 2019/20. */
export const HOUSEHOLDS_WITH_A_BANK_ACCOUNT = 58.9;
