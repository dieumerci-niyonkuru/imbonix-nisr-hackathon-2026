/**
 * Key findings of the NISR EICV7 Poverty Profile 2023/24, from the report's publication page on statistics.gov.rw.
 * All values are percentages. Two values are our arithmetic on the published ones, and say so where they are defined.
 */

export const EICV7_PROFILE_SOURCE = "NISR, EICV7 Poverty Profile 2023/24";

/** Poverty rate on the updated methodology. */
export const POVERTY_RATE_BY_YEAR = [
  { year: "2016/17", povertyRate: 39.8 },
  { year: "2023/24", povertyRate: 27.4 },
];

/**
 * Multidimensional child poverty: a child who is deprived at the same time in at least three of five dimensions —
 * health, education, water, sanitation and housing. From the NISR EICV7 Multidimensional Child Poverty thematic report.
 */
export const CHILD_POVERTY_SOURCE = "NISR, EICV7 Multidimensional Child Poverty 2023/24";
export const CHILD_POVERTY_BY_AGE = [
  { age: "Children 5 to 14", in2017: 25.3, in2024: 11.9 },
  { age: "Children 15 to 17", in2017: 40.1, in2024: 26.8 },
];

/**
 * Poverty rate by the sex of the household head, 2023/24, from the NISR EICV7 Gender thematic report. About 26% of
 * households are headed by women, and they are poorer than male-headed households (the national rate is 27.4%).
 */
export const POVERTY_BY_HEADSHIP_SOURCE = "NISR, EICV7 Gender 2023/24";
export const FEMALE_HEADED_SHARE = 26;
export const POVERTY_BY_HEADSHIP = [
  { head: "Female-headed", povertyRate: 30.2 },
  { head: "Male-headed", povertyRate: 26.6 },
];

/** Living conditions in 2016/17 (EICV5) and 2023/24 (EICV7). Improved drinking water is "at least 90%" in 2024. */
export const LIVING_STANDARDS_BY_YEAR = [
  { measure: "Near an all weather road", in2017: 93, in2024: 96 },
  { measure: "Improved drinking water", in2017: 87, in2024: 90 },
  { measure: "Adult literacy", in2017: 86.7, in2024: 87.7 },
  { measure: "Iron sheet roof", in2017: 67, in2024: 76 },
  { measure: "Planned rural settlement", in2017: 59, in2024: 68 },
];

/** Households by source of electricity, 2024. "No electricity" is 100 minus the published 72%. */
export const ELECTRICITY_SOURCES = [
  { source: "National grid", share: 50 },
  { source: "Solar", share: 22 },
  { source: "No electricity", share: 28 },
];

/** Households by main cooking fuel, 2024. "Gas and other" is the published 24% improved, minus 19% charcoal. */
export const COOKING_FUELS = [
  { fuel: "Firewood", share: 63 },
  { fuel: "Charcoal", share: 19 },
  { fuel: "Straw or sticks", share: 12 },
  { fuel: "Gas and other", share: 5 },
];

/** Literacy rate by quintile of consumption per adult equivalent, 2024. */
export const LITERACY_BY_QUINTILE = [
  { quintile: "Poorest fifth", literacyRate: 80 },
  { quintile: "Richest fifth", literacyRate: 94 },
];

/** Households by type of settlement, 2024. */
export const SETTLEMENT_TYPES = [
  { settlement: "Planned rural (umudugudu)", share: 68 },
  { settlement: "Dispersed", share: 16 },
  { settlement: "Unplanned or informal", share: 10 },
  { settlement: "Planned urban", share: 6 },
];
