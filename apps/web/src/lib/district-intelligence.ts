/**
 * District intelligence: for one district, the path from financial access to poverty, vulnerability and social
 * protection, a priority level with the reason for it, the policy levers the evidence points to, and what the
 * evidence cannot say. Levels compare the district with the other 29: they are relative, not absolute thresholds.
 */
import { rankOf, reference, type District } from "@/lib/data";
import { formatDiff, formatValue } from "@/lib/format";
import { CORE_DIMENSIONS, DIMENSIONS, meta } from "@/lib/indicators";
import { flagsFor, LEVERS, WORST_THIRD, type Lever } from "@/lib/priorities";

/** How much need a measure shows, compared with the other districts: the most affected third is "high". */
export type Need = "high" | "moderate" | "low";

export type Reading = {
  indicatorId: string;
  label: string;
  value: string;
  comparison: string;
  rank?: { rank: number; of: number };
  need?: Need;
};

export type Step = {
  id: "access" | "poverty" | "vulnerability" | "protection";
  title: string;
  /** The level in words that fit the step, such as "Low" access or "High" poverty. */
  level: string;
  need: Need;
  readings: Reading[];
  summary: string;
};

/** The four core dimensions named by the measure behind each, as the priority reason says them. */
const CORE_MEASURE_NAMES: Record<string, string> = {
  poverty: "poverty",
  finance: "financial access",
  nutrition: "child stunting",
  shocks: "natural hazards",
};

export type Priority = { level: "High" | "Moderate" | "Lower"; count: number; dimensions: string[]; reason: string };
export type Action = { lever: Lever; evidence: string };

/** Whether a rank puts the district in the most affected, middle or least affected third. */
export function needOf(rank: { rank: number; of: number } | undefined): Need | undefined {
  if (!rank) return undefined;
  const third = Math.ceil(rank.of / 3);
  if (rank.rank <= third) return "high";
  return rank.rank <= third * 2 ? "moderate" : "low";
}

function reading(district: District, indicatorId: string, label: string): Reading | undefined {
  const indicator = meta(indicatorId);
  const value = district.values[indicatorId]?.v;
  if (value === undefined) return undefined;
  const ref = reference(indicatorId);
  const rank = rankOf(district, indicator);
  return {
    indicatorId,
    label,
    value: formatValue(indicator, value),
    comparison: `${formatDiff(indicator, value - ref.value)} vs ${ref.label === "Rwanda" ? "Rwanda" : "the district median"}`,
    rank,
    need: needOf(rank),
  };
}

const NEED_ORDER: Need[] = ["high", "moderate", "low"];
const worstNeed = (needs: (Need | undefined)[]): Need => NEED_ORDER.find((need) => needs.includes(need)) ?? "moderate";

/** The four steps, from access to protection, each with its level and the readings behind it. */
export function stepsFor(district: District): Step[] {
  const present = (items: (Reading | undefined)[]) => items.filter((item): item is Reading => item !== undefined);

  const access = present([
    reading(district, "finscope_not_formally_included", "Adults outside formal finance"),
    reading(district, "eicv7_hh_smartphone", "Households with a smartphone"),
  ]);
  const poverty = present([
    reading(district, "eicv7_poverty_rate", "People living in poverty"),
    reading(district, "census_mpi_headcount", "Multidimensionally poor"),
  ]);
  const vulnerability = present([
    reading(district, "dhs_stunting", "Children under five who are stunted"),
    reading(district, "cfsva_hazard_any", "Households hit by a natural hazard"),
  ]);
  const protection = present([reading(district, "eicv7_health_insurance", "People with health insurance")]);

  // Access is as weak as the weaker of formal inclusion and smartphones, which digital finance depends on.
  const accessNeed = worstNeed(access.map((item) => item.need));
  const formalNeed = access.find((item) => item.indicatorId === "finscope_not_formally_included")?.need;
  const digitalNeed = access.find((item) => item.indicatorId === "eicv7_hh_smartphone")?.need;
  const povertyNeed = poverty[0]?.need ?? "moderate";
  const vulnerabilityNeed = worstNeed(vulnerability.map((item) => item.need));
  const protectionNeed = protection[0]?.need ?? "moderate";
  const name = district.name;

  return [
    {
      id: "access",
      title: "Financial and digital access",
      level: { high: "Low", moderate: "Moderate", low: "Good" }[accessNeed],
      need: accessNeed,
      readings: access,
      summary:
        formalNeed === "high"
          ? `${name} is among the districts with the most adults outside formal finance.`
          : digitalNeed === "high"
            ? `Most adults in ${name} are formally served, but few households have a smartphone, which holds back digital finance.`
            : accessNeed === "moderate"
              ? `${name} sits in the middle of the districts on formal and digital access.`
              : `${name} is among the districts with the best formal and digital access.`,
    },
    {
      id: "poverty",
      title: "Poverty",
      level: { high: "High", moderate: "Moderate", low: "Lower" }[povertyNeed],
      need: povertyNeed,
      readings: poverty,
      summary:
        povertyNeed === "high"
          ? `Poverty in ${name} is among the highest of the 30 districts.`
          : povertyNeed === "moderate"
            ? `Poverty in ${name} is in the middle of the 30 districts.`
            : `Poverty in ${name} is among the lowest of the 30 districts.`,
    },
    {
      id: "vulnerability",
      title: "Vulnerability",
      level: { high: "High", moderate: "Moderate", low: "Lower" }[vulnerabilityNeed],
      need: vulnerabilityNeed,
      readings: vulnerability,
      summary:
        vulnerabilityNeed === "high"
          ? `Child stunting or natural hazards put ${name} among the most affected districts.`
          : vulnerabilityNeed === "moderate"
            ? `On child stunting and natural hazards, ${name} is in the middle of the districts.`
            : `${name} is among the least affected districts on child stunting and natural hazards.`,
    },
    {
      id: "protection",
      title: "Social protection",
      level: { high: "Low", moderate: "Moderate", low: "Good" }[protectionNeed],
      need: protectionNeed,
      readings: protection,
      summary:
        protectionNeed === "high"
          ? `Health insurance cover in ${name} is among the lowest of the districts.`
          : protectionNeed === "moderate"
            ? `Health insurance cover in ${name} is in the middle of the districts.`
            : `Health insurance cover in ${name} is among the highest of the districts.`,
    },
  ];
}

/**
 * The priority rule: High when the district is among the 10 most affected on at least two of the four core
 * dimensions (poverty, financial access, child stunting, natural hazards), Moderate on one, Lower on none.
 */
export function priorityFor(district: District): Priority {
  const dimensions = CORE_DIMENSIONS.filter((dimension) => {
    const rank = rankOf(district, meta(DIMENSIONS[dimension].headline!));
    return rank !== undefined && rank.rank <= WORST_THIRD;
  }).map((dimension) => CORE_MEASURE_NAMES[dimension]);
  const count = dimensions.length;
  const level = count >= 2 ? "High" : count === 1 ? "Moderate" : "Lower";
  const list =
    dimensions.length > 1 ? `${dimensions.slice(0, -1).join(", ")} and ${dimensions[dimensions.length - 1]}` : dimensions[0];
  const reason = count
    ? `${district.name} is among the 10 most affected districts on ${list}: ${count} of the 4 core dimensions.`
    : `${district.name} is not among the 10 most affected districts on any of the 4 core dimensions.`;
  return { level, count, dimensions, reason };
}

/** The policy levers the evidence flags for the district, each with the figure that flagged it. */
export function actionsFor(district: District): Action[] {
  return flagsFor(district).map((flag) => ({ lever: LEVERS.find((lever) => lever.id === flag.lever)!, evidence: flag.evidence }));
}

/** What the evidence cannot say about a district, in plain words. */
export function limitationsFor(district: District): string[] {
  return [
    `These are district averages from surveys. Sectors and households inside ${district.name} differ, sometimes a lot.`,
    `Levels compare ${district.name} with the other 29 districts. Where confidence intervals overlap, a difference may not be real.`,
    "The measures come from different surveys between 2022 and 2025, so they describe slightly different moments.",
    "VUP coverage and mobile money use are not published by district, so social protection here is health insurance cover.",
    "Links between measures are associations, not causes. The actions are options the evidence points to, not proven effects.",
  ];
}
