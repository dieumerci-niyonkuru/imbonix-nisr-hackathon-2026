/**
 * National targets for financial inclusion and social protection, with the baseline each one starts from and the year
 * it is set for. The financial inclusion targets are from the National Financial Inclusion Roadmap 2025 to 2030 and are
 * set for 2030; the social protection target is from NST2 and is set for 2028/29. Values are percentages. These sit
 * under Rwanda's long-term goals in Vision 2050 and the National Strategy for Transformation (NST2).
 */

export const TARGETS_SOURCE = "National Financial Inclusion Roadmap 2025 to 2030, and NST2 for social protection";

/** The national frameworks the targets below serve, named for the challenge's national-priority alignment. */
export const NATIONAL_FRAMEWORKS = [
  "Vision 2050",
  "NST2 (2024–2029)",
  "National Financial Inclusion Roadmap 2025–2030",
  "Social Protection Sector Strategic Plan",
];

export type TargetProgress = { measure: string; baseline: number; target: number; by: string };

export const TARGET_PROGRESS: TargetProgress[] = [
  { measure: "Financially healthy adults", baseline: 10, target: 20, by: "2030" },
  { measure: "Active mobile money users", baseline: 68.5, target: 80, by: "2030" },
  { measure: "Adults with a formal loan", baseline: 12.7, target: 20, by: "2030" },
  { measure: "Poor and vulnerable people with social protection", baseline: 11, target: 20, by: "2028/29" },
];
