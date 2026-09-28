/**
 * Key findings of the FinScope Survey 2024 (fieldwork 6 September to 8 October 2024, 14,000 households), from the
 * survey's publication page on statistics.gov.rw. Values are percentages of adults unless named otherwise.
 */

export const FINSCOPE_2024_SOURCE = "NISR, FinScope Survey 2024";

/** Adults using each kind of service, 2020 and 2024. An adult can use several, so the rows overlap. */
export const INCLUSION_BY_ROUND = [
  { measure: "Financially included", in2020: 93, in2024: 96 },
  { measure: "Formally served", in2020: 77, in2024: 92 },
  { measure: "Other formal (non bank)", in2020: 75, in2024: 92 },
  { measure: "Informal", in2020: 78, in2024: 72 },
  { measure: "Banked", in2020: 22, in2024: 22 },
  { measure: "Excluded", in2020: 7, in2024: 4 },
];

/** Adults in 2024, in millions, and the number of excluded adults. */
export const INCLUDED_ADULTS_MILLIONS = 7.8;
export const EXCLUDED_ADULTS = 316_000;

/** Mobile money, 2020 and 2024. */
export const MOBILE_MONEY_BY_ROUND = [
  { measure: "Registered wallet in own name", in2020: 60, in2024: 77 },
  { measure: "Use it weekly", in2020: 13, in2024: 21 },
  { measure: "Use it daily", in2020: 4, in2024: 19 },
];

/** Adults who own or have used mobile money, 2024. */
export const MOBILE_MONEY_EVER_USED = 86;

/**
 * Adults by financial health segment, 2024, from the report's financial health chapter (section 5.2). The published
 * shares are rounded, so they add up to 101.
 */
export const FINANCIAL_HEALTH_SEGMENTS = [
  { segment: "Financially healthy", share: 10 },
  { segment: "Coping", share: 57 },
  { segment: "Vulnerable", share: 31 },
  { segment: "Extremely vulnerable", share: 3 },
];
