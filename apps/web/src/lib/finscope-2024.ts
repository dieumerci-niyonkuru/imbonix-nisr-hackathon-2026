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

/**
 * Financial inclusion (formal and informal together) across the FinScope rounds, as NISR and AFR report the long-run
 * series. Earlier rounds used different methods, so this is the headline overall-inclusion trend, not a like-for-like
 * series for every sub-measure (banked and formal definitions changed — see the caveat on the data page).
 */
export const FINANCIAL_INCLUSION_TREND_SOURCE = "NISR/AFR FinScope surveys, 2008 to 2024";
export const FINANCIAL_INCLUSION_TREND = [
  { year: "2008", formal: 21, included: 48 },
  { year: "2012", formal: 42, included: 72 },
  { year: "2016", formal: 68, included: 89 },
  { year: "2020", formal: 77, included: 93 },
  { year: "2024", formal: 92, included: 96 },
];

/** Mobile money, 2020 and 2024. */
export const MOBILE_MONEY_BY_ROUND = [
  { measure: "Registered wallet in own name", in2020: 60, in2024: 77 },
  { measure: "Use it weekly", in2020: 13, in2024: 21 },
  { measure: "Use it daily", in2020: 4, in2024: 19 },
];

/** Adults who own or have used mobile money, 2024. */
export const MOBILE_MONEY_EVER_USED = 86;

/**
 * Why unbanked adults do not open a bank account, 2024 (FinScope 2024, Figure 24). One main reason per person. The
 * dominant barrier is income — people feel they do not earn enough to justify an account — not distance or documents.
 */
export const BANK_BARRIERS_SOURCE = "NISR, FinScope 2024, Figure 24";
export const BANK_ACCOUNT_BARRIERS = [
  { reason: "Not enough income to justify it", share: 83 },
  { reason: "Can't afford the costs", share: 4.2 },
  { reason: "Banks are too far", share: 3 },
  { reason: "No product knowledge", share: 1.9 },
  { reason: "No ID documents", share: 1 },
];

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
