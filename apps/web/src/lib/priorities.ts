/**
 * Transparent, rule-based intervention flags. Each lever names the evidence (one published indicator and a
 * threshold) that flags a district, so anyone can check or change the rule. These flags point to where the
 * evidence suggests a lever deserves attention; they are not budget allocations, eligibility decisions or
 * impact estimates.
 */
import { DISTRICTS, rankOf, reference, type District } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { meta } from "@/lib/indicators";
import { DIMENSION_COLORS } from "@/lib/palette";

/** A district is in the "most affected third" when it ranks 1-10 of 30 on an indicator. */
export const WORST_THIRD = 10;

export type LeverId = "income" | "access" | "digital" | "nutrition" | "shocks" | "youth" | "deepen";

export type Lever = {
  id: LeverId;
  title: string;
  question: string;
  rule: string;
  programmes: string;
  color: string;
  indicatorId: string;
};

export const LEVERS: Lever[] = [
  {
    id: "income",
    title: "Income support and graduation",
    question: "Are many people below the poverty line?",
    rule: "Poverty rate (EICV7 2023/24) among the 10 highest districts.",
    programmes: "VUP Direct Support and public works; the SP-SSP graduation package (250,000 households by 2028/29).",
    color: DIMENSION_COLORS.poverty.accent,
    indicatorId: "eicv7_poverty_rate",
  },
  {
    id: "access",
    title: "Last mile financial access",
    question: "Do many adults lack any formal financial service?",
    rule: "Adults not formally included (FinScope 2024) among the 10 highest districts.",
    programmes: "Agent and SACCO outreach, informal to formal pathways for savings groups (Financial Inclusion Roadmap).",
    color: DIMENSION_COLORS.finance.accent,
    indicatorId: "finscope_not_formally_included",
  },
  {
    id: "digital",
    title: "Digital readiness first",
    question: "Could a lack of smartphones hold back digital finance and payments?",
    rule: "Households with a smartphone (EICV7 2023/24) among the 10 lowest districts.",
    programmes: "Phone access and digital literacy support before shifting benefits or services to mobile channels.",
    color: DIMENSION_COLORS.digital.accent,
    indicatorId: "eicv7_hh_smartphone",
  },
  {
    id: "nutrition",
    title: "Nutrition sensitive support",
    question: "Are many young children stunted?",
    rule: "Child stunting (DHS 2025) among the 10 highest districts.",
    programmes: "Nutrition Sensitive Direct Support (NSDS) and early childhood development services.",
    color: DIMENSION_COLORS.nutrition.accent,
    indicatorId: "dhs_stunting",
  },
  {
    id: "shocks",
    title: "Shock responsive protection",
    question: "Are many households hit by natural hazards?",
    rule: "Households hit by a natural hazard (CFSVA 2024) among the 10 highest districts.",
    programmes: "Shock responsive cash (SP-SSP outcome 5), agricultural and climate insurance, emergency savings.",
    color: DIMENSION_COLORS.shocks.accent,
    indicatorId: "cfsva_hazard_any",
  },
  {
    id: "youth",
    title: "Jobs and skills for youth",
    question: "Are many young people out of work and education?",
    rule: "Youth not in employment, education or training (LFS 2025) among the 10 highest districts.",
    programmes: "Public works, TVET and youth access to formal credit (Roadmap target: 8.8% to 12%).",
    color: DIMENSION_COLORS.work.accent,
    indicatorId: "lfs_neet_youth",
  },
  {
    id: "deepen",
    title: "Deepen use of existing services",
    question: "Is the district poor even though most adults are formally included?",
    rule: "Poverty rate above the national 27.4%, while adults not formally included are below the national 8%.",
    programmes: "Savings, insurance and credit products that fit low incomes; financial health, not just access.",
    color: DIMENSION_COLORS.health.accent,
    indicatorId: "eicv7_poverty_rate",
  },
];

export type Flag = { lever: LeverId; evidence: string; rank?: number };

/** The levers a district triggers, each with the evidence that triggered it. */
export function flagsFor(district: District): Flag[] {
  const flags: Flag[] = [];
  for (const lever of LEVERS) {
    const indicator = meta(lever.indicatorId);
    const value = district.values[lever.indicatorId]?.v;
    if (value === undefined) continue;
    if (lever.id === "deepen") {
      const excluded = district.values.finscope_not_formally_included?.v;
      if (
        excluded !== undefined &&
        value > reference(lever.indicatorId).value &&
        excluded < reference("finscope_not_formally_included").value
      ) {
        flags.push({
          lever: lever.id,
          evidence: `Poverty ${formatValue(indicator, value)} with only ${formatValue(meta("finscope_not_formally_included"), excluded)} of adults outside formal finance`,
        });
      }
      continue;
    }
    const rank = rankOf(district, indicator);
    if (rank && rank.rank <= WORST_THIRD) {
      flags.push({
        lever: lever.id,
        evidence: `${indicator.short} ${formatValue(indicator, value)} (rank ${rank.rank} of ${rank.of})`,
        rank: rank.rank,
      });
    }
  }
  return flags;
}

export type DistrictFlags = { slug: string; name: string; province: string; flags: Flag[] };

/** Flags for every district, most-flagged first. Serializable, so it can be passed to client components. */
export function allFlags(): DistrictFlags[] {
  return DISTRICTS.map((d) => ({ slug: d.slug, name: d.name, province: d.province, flags: flagsFor(d) })).sort(
    (a, b) => b.flags.length - a.flags.length || a.name.localeCompare(b.name),
  );
}
