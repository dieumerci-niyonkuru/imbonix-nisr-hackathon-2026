/**
 * The Intervention Explorer: choose a problem, a group and a place, and get the evidence, the people affected, where
 * the problem is concentrated, options to consider and what the evidence cannot tell us. Every figure comes from a
 * published table or a stated calculation on one; options come from existing programmes and the National Financial
 * Inclusion Roadmap, and are not predictions of impact.
 */
import { DISTRICTS, PROVINCE_LABEL, PROVINCES, rankOf, valueOf, weightedRate, type District } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { meta } from "@/lib/indicators";
import { LITERACY_BY_QUINTILE } from "@/lib/eicv7-poverty-profile";
import { POVERTY_AMONG_VUP_BENEFICIARIES, VUP_SHARE_BY_SEX } from "@/lib/poverty-social-protection";
import { sectorsOf } from "@/lib/sectors";
import { timeliness, USAGE, type UsageRow } from "@/lib/surveys";

export type ProblemId = "exclusion" | "poverty" | "digital" | "work" | "protection";
export type GroupId = "all" | "women" | "youth" | "rural" | "poorest";

type Problem = {
  id: ProblemId;
  label: string;
  question: string;
  indicatorId: string;
  /** The problem is the share without the measure, such as households without a smartphone. */
  invert: boolean;
  /** What the share says, as the end of a sentence that starts with the percentage. */
  measure: string;
  /** Who is counted, as a noun, for the number of people affected. */
  counted: string;
  /** Population the share applies to, used to weight province and national figures. */
  weightId: string;
  source: string;
};

export const PROBLEMS: Problem[] = [
  {
    id: "exclusion",
    label: "Financial exclusion",
    question: "Who is outside formal finance?",
    indicatorId: "finscope_not_formally_included",
    invert: false,
    measure: "of adults are outside formal finance",
    counted: "adults outside formal finance",
    weightId: "proj_adults_16plus_2024",
    source: "NISR, FinScope 2024",
  },
  {
    id: "poverty",
    label: "Poverty",
    question: "Who lives below the poverty line?",
    indicatorId: "eicv7_poverty_rate",
    invert: false,
    measure: "of people live in poverty",
    counted: "people living in poverty",
    weightId: "census_population",
    source: "NISR, EICV7 2023/24",
  },
  {
    id: "digital",
    label: "Limited digital access",
    question: "Who lacks the phone that digital finance needs?",
    indicatorId: "eicv7_hh_smartphone",
    invert: true,
    measure: "of households have no smartphone",
    counted: "households without a smartphone",
    weightId: "census_population",
    source: "NISR, EICV7 2023/24",
  },
  {
    id: "work",
    label: "Work and jobs",
    question: "Who is out of work?",
    indicatorId: "lfs_unemployment_rate",
    invert: false,
    measure: "of the labour force is unemployed",
    counted: "unemployed people",
    weightId: "proj_adults_16plus_2024",
    source: "NISR, Labour Force Survey 2025",
  },
  {
    id: "protection",
    label: "Social protection gap",
    question: "Who is not covered by social protection?",
    indicatorId: "eicv7_health_insurance",
    invert: true,
    measure: "of people have no health insurance",
    counted: "people without health insurance",
    weightId: "census_population",
    source: "NISR, EICV7 2023/24",
  },
];

export const GROUPS: { id: GroupId; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "women", label: "Women" },
  { id: "youth", label: "Youth" },
  { id: "rural", label: "Rural households" },
  { id: "poorest", label: "The poorest households" },
];

/** Places to choose from: Rwanda, each province, then each district by province. */
export const LOCATIONS: { value: string; label: string; group: string }[] = [
  { value: "rwanda", label: "All of Rwanda", group: "Country" },
  ...PROVINCES.map((province) => ({ value: `province:${province}`, label: PROVINCE_LABEL[province], group: "Provinces" })),
  ...PROVINCES.flatMap((province) =>
    DISTRICTS.filter((district) => district.province === province)
      .sort((first, second) => first.name.localeCompare(second.name))
      .map((district) => ({ value: `district:${district.slug}`, label: district.name, group: PROVINCE_LABEL[province] })),
  ),
];

export type Evidence = { text: string; source: string };
export type Affected = { count?: number; text: string; note?: string };
export type ConcentrationRow = { label: string; href?: string; share: number; count?: number; highlight?: boolean };
export type Concentration = { title: string; rows: ConcentrationRow[]; note: string };
export type ExplorerResult = {
  problem: Problem;
  groupLabel: string;
  placeLabel: string;
  headline: string;
  evidence: Evidence[];
  affected: Affected;
  concentration: Concentration;
  options: string[];
  limitations: string[];
};

const round = (value: number) => Math.round(value * 10) / 10;
const pct = (value: number) => `${round(value)}%`;

/** The share with the problem, for a district: the published rate, or 100 minus it for measures of coverage. */
function problemShare(problem: Problem, district: District, indicatorId = problem.indicatorId): number | undefined {
  const value = valueOf(district, indicatorId);
  if (value === undefined) return undefined;
  return problem.invert ? 100 - value : value;
}

function usage(sex: UsageRow["sex"], group: string, category: string): UsageRow | undefined {
  return USAGE.find((row) => row.sex === sex && row.group === group && row.category === category);
}

/** National evidence for the chosen group, from the published breakdowns. Undefined when there is none. */
function groupEvidence(problem: ProblemId, group: GroupId): Evidence | undefined {
  const dhs = "NISR, Rwanda DHS 2025 (women and men aged 15 to 49)";
  const field = problem === "digital" ? "smartphone" : "either";
  const doing = problem === "digital" ? "own a smartphone" : "used a bank account or mobile money in the past year";
  if (problem === "exclusion" || problem === "digital") {
    if (group === "women") {
      const women = usage("women", "Total", "15-49");
      const men = usage("men", "Total", "15-49");
      if (women && men)
        return { text: `${pct(women[field])} of women ${doing}, against ${pct(men[field])} of men.`, source: dhs };
    }
    if (group === "youth") {
      const young = usage("women", "Age", "15-19");
      const older = usage("women", "Age", "25-29");
      const youngMen = usage("men", "Age", "15-19");
      if (young && older && youngMen)
        return {
          text: `Among people aged 15 to 19, ${pct(young[field])} of women and ${pct(youngMen[field])} of men ${doing}, against ${pct(older[field])} of women aged 25 to 29.`,
          source: dhs,
        };
    }
    if (group === "rural") {
      const rural = usage("women", "Residence", "Rural");
      const urban = usage("women", "Residence", "Urban");
      const ruralMen = usage("men", "Residence", "Rural");
      if (rural && urban && ruralMen)
        return {
          text: `In rural areas, ${pct(rural[field])} of women and ${pct(ruralMen[field])} of men ${doing}, against ${pct(urban[field])} of urban women.`,
          source: dhs,
        };
    }
    if (group === "poorest") {
      const poorest = usage("women", "Wealth quintile", "Lowest");
      const richest = usage("women", "Wealth quintile", "Highest");
      const poorestMen = usage("men", "Wealth quintile", "Lowest");
      if (poorest && richest && poorestMen)
        return {
          text: `In the poorest fifth of households, ${pct(poorest[field])} of women and ${pct(poorestMen[field])} of men ${doing}, against ${pct(richest[field])} of women in the richest fifth.`,
          source: dhs,
        };
    }
  }
  if (problem === "poverty" && group === "poorest") {
    const [poorest, richest] = LITERACY_BY_QUINTILE;
    return {
      text: `${poorest.literacyRate}% of the poorest fifth can read and write, against ${richest.literacyRate}% of the richest fifth.`,
      source: "NISR, EICV7 Poverty Profile 2023/24",
    };
  }
  if (problem === "protection") {
    if (group === "women") {
      const women = VUP_SHARE_BY_SEX.find((row) => row.sex === "Women")!;
      return {
        text: `Women are ${women.beneficiaries}% of VUP beneficiaries, against ${women.population}% of the population.`,
        source: "NISR, EICV7 VUP thematic report 2023/24",
      };
    }
    if (group === "poorest") {
      const onTime = timeliness("Direct Support")[0];
      if (onTime?.extremelyPoor != null && onTime.nonPoor != null)
        return {
          text: `In Direct Support, ${pct(onTime.extremelyPoor)} of extremely poor beneficiaries were paid on time the last time, against ${pct(onTime.nonPoor)} of non poor ones.`,
          source: "NISR, EICV7 VUP thematic report 2023/24, Table 4.2",
        };
    }
    if (group === "all") {
      const [national, beneficiaries] = POVERTY_AMONG_VUP_BENEFICIARIES;
      return {
        text: `VUP reaches poorer people: ${beneficiaries.povertyRate}% of beneficiaries are poor, against ${national.povertyRate}% of all Rwandans.`,
        source: "NISR, EICV7 VUP thematic report 2023/24",
      };
    }
  }
  if (problem === "work" && group === "youth") {
    const neet = meta("lfs_neet_youth");
    return {
      text: `${neet.national}% of young people are not in employment, education or training nationally.`,
      source: "NISR, Labour Force Survey 2025",
    };
  }
  return undefined;
}

/**
 * The population a share is counted against, where it is published by district. Missing entries have no published
 * base, so no count is made.
 */
const BASES: Record<ProblemId, Partial<Record<GroupId, string>>> = {
  exclusion: { all: "proj_adults_16plus_2024", women: "proj_women_16plus_2024", youth: "proj_youth_16_30_2024" },
  poverty: { all: "census_population" },
  digital: {},
  work: {},
  protection: { all: "census_population" },
};

/** Options to consider: the programmes and Roadmap measures that address the problem, then those for the group. */
const OPTIONS: Record<ProblemId, { all: string[] } & Partial<Record<Exclude<GroupId, "all">, string>>> = {
  exclusion: {
    all: [
      "Bring agents and Umurenge SACCO services closer to where adults outside formal finance live (National Financial Inclusion Roadmap).",
      "Link savings groups (ibimina) to formal accounts, so informal savers gain a formal path.",
    ],
    women: "Work through women's savings and community groups to open accounts and keep them in use.",
    youth: "Pair first accounts with access to credit: the Roadmap aims to raise youth access to formal credit from 8.8% to 12%.",
    rural: "Put agent coverage first in rural cells and sectors far from a bank branch or SACCO.",
    poorest: "Pay VUP benefits into basic accounts or mobile money, so receiving support also means being included.",
  },
  poverty: {
    all: [
      "VUP Direct Support for households with no labour capacity, and public works for those who can work.",
      "The SP-SSP graduation package, which aims to take 250,000 households through graduation by 2028/29.",
    ],
    women: "Nutrition Sensitive Direct Support for poor households with pregnant women or young children.",
    youth: "Public works and skills training for young people in poor households.",
    rural: "Look inside districts: target the sectors where small area estimates show the deepest poverty.",
    poorest: "Put the extremely poor first, with Direct Support where no one in the household can work.",
  },
  digital: {
    all: [
      "Support phone access and digital literacy before moving benefits or services to mobile channels.",
      "Keep cash and SACCO options open where smartphones are rare.",
    ],
    women: "Close the gap in phone ownership between women and men that DHS 2025 shows.",
    youth: "Use schools and TVET centres for digital skills, where young people already are.",
    rural: "Pair rural agent networks with simple phone based services that do not need a smartphone.",
    poorest: "Offer services that work on basic phones: few of the poorest own a smartphone.",
  },
  work: {
    all: [
      "VUP public works for households with labour capacity.",
      "Technical and vocational training matched to the work available locally.",
    ],
    youth: "Youth access to formal credit and start up support: the Roadmap aims to raise it from 8.8% to 12%.",
    women: "Flexible public works, which suit people who also care for children.",
  },
  protection: {
    all: [
      "Help households enrol in community based health insurance (Mutuelle de santé).",
      "Pay VUP benefits on time, including by mobile money: fewer than one in five last payments arrived on time.",
      "Shock responsive cash where natural hazards hit many households (SP-SSP).",
    ],
    women: "Nutrition Sensitive Direct Support for mothers and young children.",
    poorest: "Put extremely poor beneficiaries first in payment schedules: in several programmes they wait longest.",
  },
};

/** The districts in a place: all 30, a province's districts, or a district with the rest of its province. */
function scope(location: string): { districts: District[]; label: string; district?: District } {
  if (location.startsWith("province:")) {
    const province = location.slice("province:".length);
    return { districts: DISTRICTS.filter((district) => district.province === province), label: PROVINCE_LABEL[province] };
  }
  if (location.startsWith("district:")) {
    const district = DISTRICTS.find((item) => item.slug === location.slice("district:".length))!;
    return {
      districts: DISTRICTS.filter((item) => item.province === district.province),
      label: `${district.name} district`,
      district,
    };
  }
  return { districts: DISTRICTS, label: "Rwanda" };
}

/** Work out everything the explorer shows for one problem, group and place. */
export function explore(problemId: ProblemId, groupId: GroupId, location: string): ExplorerResult {
  const problem = PROBLEMS.find((item) => item.id === problemId)!;
  const groupLabel = GROUPS.find((item) => item.id === groupId)!.label;
  const place = scope(location);
  // For young people and work, the measure is youth not in employment, education or training.
  const youthWork = problemId === "work" && groupId === "youth";
  const indicatorId = youthWork ? "lfs_neet_youth" : problem.indicatorId;
  const indicator = meta(indicatorId);
  const measure = youthWork ? "of young people are not in employment, education or training" : problem.measure;
  const counted = youthWork ? "young people not in employment, education or training" : problem.counted;
  const weightId = youthWork ? "proj_youth_16_30_2024" : problem.weightId;

  // The rate for the place: the district figure, or the districts weighted by population.
  const share = (() => {
    if (place.district) return problemShare(problem, place.district, indicatorId);
    if (location === "rwanda" && indicator.national !== undefined && !problem.invert) return indicator.national;
    const rate = weightedRate(indicatorId, weightId, location.startsWith("province:") ? location.slice(9) : undefined);
    return rate === undefined ? undefined : problem.invert ? 100 - rate : rate;
  })();

  const headline =
    share === undefined
      ? `${problem.label}: no published figure for ${place.label}`
      : `${pct(share)} ${measure} in ${place.label}`;

  const evidence: Evidence[] = [];
  if (share !== undefined) {
    const districtRank = place.district ? rankOf(place.district, indicator) : undefined;
    evidence.push({
      text: `${pct(share)} ${measure} in ${place.label}${districtRank ? `, rank ${districtRank.rank} of ${districtRank.of} districts (1 is the most affected)` : ""}.`,
      source: youthWork ? "NISR, Labour Force Survey 2025" : problem.source,
    });
  }
  const groupFact = groupEvidence(problemId, groupId);
  if (groupFact) evidence.push(groupFact);

  // People affected: the rate times the population it applies to, where that population is published.
  const baseId = youthWork ? "proj_youth_16_30_2024" : BASES[problemId][groupId];
  const base = baseId
    ? (place.district ? [place.district] : place.districts).reduce((sum, district) => sum + (valueOf(district, baseId) ?? 0), 0)
    : undefined;
  const count = share !== undefined && base ? Math.round(((share / 100) * base) / 100) * 100 : undefined;
  const assumesGroupRate = problemId === "exclusion" && (groupId === "women" || groupId === "youth");
  const affected: Affected = count
    ? {
        count,
        text: `About ${formatNumber(count)} ${assumesGroupRate ? `${groupLabel.toLowerCase()} ${counted.replace("adults ", "")}` : counted} in ${place.label}.`,
        note: `IMBONIX calculation: ${pct(share!)} of ${formatNumber(base!)} (${meta(baseId!).short.toLowerCase()}).${
          assumesGroupRate
            ? ` It applies the rate for all adults to ${groupLabel.toLowerCase()}, because their own rate is not published by district.`
            : ""
        }`,
      }
    : {
        text:
          share === undefined
            ? "No published figure to count from."
            : `${pct(share)} ${measure} in ${place.label}. The number of ${groupId === "all" ? "people" : groupLabel.toLowerCase()} affected cannot be counted from published figures.`,
        note:
          problemId === "digital"
            ? "Smartphones are counted by household, and household numbers are not published by district."
            : problemId === "work" && !youthWork
              ? "Unemployment is a share of the labour force, whose size is not published by district."
              : groupId !== "all"
                ? `District figures are not published for ${groupLabel.toLowerCase()}.`
                : undefined,
      };

  // Where it is concentrated: the districts in the place, most affected first; inside a district, its poorest sectors.
  const rows: ConcentrationRow[] = place.districts
    .map((district): ConcentrationRow | undefined => {
      const value = problemShare(problem, district, indicatorId);
      const districtBase = baseId ? valueOf(district, baseId) : undefined;
      return value === undefined
        ? undefined
        : {
            label: district.name,
            href: `/districts/${district.slug}`,
            share: value,
            count: districtBase ? Math.round(((value / 100) * districtBase) / 100) * 100 : undefined,
            highlight: district.slug === place.district?.slug,
          };
    })
    .filter((row): row is ConcentrationRow => row !== undefined)
    .sort((first, second) => second.share - first.share);
  let concentration: Concentration = {
    title: place.district
      ? `${place.district.name} among the districts of its province`
      : `Districts of ${place.label}, most affected first`,
    rows: location === "rwanda" ? rows.slice(0, 8) : rows,
    note: location === "rwanda" ? "The 8 most affected of the 30 districts." : "Every district in the province.",
  };
  if (place.district && problemId === "poverty") {
    const sectors = sectorsOf(place.district.name)
      .filter((sector) => sector.povertySae !== null)
      .map((sector) => ({ label: sector.sector, share: sector.povertySae! }))
      .sort((first, second) => second.share - first.share);
    concentration = {
      title: `The poorest sectors of ${place.district.name}`,
      rows: sectors.slice(0, 8),
      note: "Small area estimates of poverty by sector (NISR model estimates): compare them within the district only.",
    };
  }

  const optionSet = OPTIONS[problemId];
  const groupOption = groupId === "all" ? undefined : optionSet[groupId];
  const options = [...optionSet.all, ...(groupOption ? [groupOption] : [])];

  const limitations = [
    "District figures are averages from surveys: places and households inside them differ.",
    ...(groupId !== "all" && groupFact
      ? [`The figure for ${groupLabel.toLowerCase()} is national; it is not published by district.`]
      : []),
    ...(groupId !== "all" && !groupFact
      ? [`There is no published figure for ${groupLabel.toLowerCase()} on this problem, so the evidence is for everyone.`]
      : []),
    ...(problemId === "protection"
      ? ["VUP coverage is not published by district; health insurance is the district measure of social protection."]
      : []),
    "Links between measures are associations, not causes.",
    "The options come from existing programmes and the National Financial Inclusion Roadmap. The data does not show whether they would work here.",
  ];

  return { problem, groupLabel, placeLabel: place.label, headline, evidence, affected, concentration, options, limitations };
}
