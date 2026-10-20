import { resolvePlaceHit } from "@/lib/ai-places";
import { CATALOG_STUDIES, CATALOG_THEMES, CATALOG_YEARS } from "@/lib/catalog";
import { DISTRICTS, PROVINCE_LABEL, rankOf, reference, SOURCES, valueOf, type District } from "@/lib/data";
import { FINANCIAL_HEALTH_SEGMENTS, FINSCOPE_2024_SOURCE, INCLUSION_BY_ROUND } from "@/lib/finscope-2024";
import { TARGET_PROGRESS } from "@/lib/national-targets";
import { EICV7_PROFILE_SOURCE, POVERTY_RATE_BY_YEAR } from "@/lib/eicv7-poverty-profile";
import {
  POVERTY_AMONG_VUP_BENEFICIARIES,
  SOCIAL_PROTECTION_SOURCE,
  VUP_BENEFICIARIES,
  VUP_BENEFICIARIES_BY_PROGRAMME,
  VUP_SHARE_BY_SEX,
} from "@/lib/poverty-social-protection";
import { SITE_FACTS } from "@/lib/site-facts";
import { formatValue, ordinal } from "@/lib/format";
import { meta, type IndicatorMeta } from "@/lib/indicators";

export type AnswerStat = { value: string; label: string };
export type AnswerRow = { label: string; value: string; hint?: string };
export type AnswerLink = { href: string; label: string };
/** A grounded answer: a short heading, an explanation, optional figures, a table, a source and next steps. */
export type Answer = {
  heading: string;
  body: string;
  stats?: AnswerStat[];
  rows?: AnswerRow[];
  rowsCaption?: string;
  source?: string;
  status?: string;
  links?: AnswerLink[];
};

/** The measures the assistant answers about, with the words people use for each. Longer phrases win ties. */
const TOPICS: { id: string; words: string[] }[] = [
  {
    id: "finscope_not_formally_included",
    words: [
      "financial exclusion",
      "financially excluded",
      "not formally included",
      "outside formal finance",
      "financial access",
      "access to finance",
      "unbanked",
      "excluded",
      "exclusion",
    ],
  },
  {
    id: "finscope_formally_included",
    words: ["formally included", "formally served", "formal finance", "formal financial services", "formal services"],
  },
  { id: "finscope_banked", words: ["bank account", "banked", "banking", "have a bank", "own account", "bank"] },
  {
    id: "eicv7_health_insurance",
    words: ["health insurance", "health cover", "health coverage", "mutuelle", "cbhi", "insurance"],
  },
  { id: "dhs_stunting", words: ["child stunting", "stunting", "stunted", "chronic malnutrition", "malnutrition", "nutrition"] },
  { id: "dhs_underweight", words: ["underweight children", "underweight"] },
  { id: "dhs_wasting", words: ["wasting", "acute malnutrition"] },
  {
    id: "lfs_unemployment_rate",
    words: ["unemployment rate", "unemployment", "unemployed", "jobless", "out of work", "no job", "jobs"],
  },
  { id: "lfs_neet_youth", words: ["youth not in work", "neet", "idle youth", "young people not in work"] },
  {
    id: "lfs_median_monthly_earnings",
    words: ["median earnings", "earnings", "income", "incomes", "wages", "salary", "salaries", "pay", "how much people earn"],
  },
  { id: "lfs_participation_rate", words: ["labour force participation", "labor force participation", "participation rate"] },
  { id: "eicv7_electricity_lighting", words: ["electricity", "power", "lighting", "access to electricity"] },
  { id: "eicv7_internet_home", words: ["internet at home", "internet", "online", "broadband"] },
  { id: "eicv7_hh_smartphone", words: ["smartphone", "smart phone"] },
  { id: "eicv7_hh_mobile_phone", words: ["mobile phone", "phone ownership", "own a phone"] },
  { id: "eicv7_improved_water", words: ["drinking water", "clean water", "safe water", "water"] },
  { id: "eicv7_improved_sanitation", words: ["sanitation", "improved toilet", "toilet", "latrine"] },
  {
    id: "cfsva_hazard_any",
    words: [
      "natural hazard",
      "hazard",
      "disaster",
      "climate shock",
      "shocks",
      "drought",
      "flood",
      "floods",
      "landslide",
      "landslides",
    ],
  },
  {
    id: "cfsva_inadequate_food_consumption",
    words: [
      "food insecurity",
      "food insecure",
      "inadequate food",
      "not enough food",
      "hunger",
      "food consumption",
      "food security",
    ],
  },
  { id: "census_mpi_headcount", words: ["multidimensional poverty", "multidimensionally poor", "mpi"] },
  {
    id: "census_female_headed_hh",
    words: [
      "female headed",
      "female-headed",
      "women headed",
      "women-headed",
      "households headed by women",
      "female headed households",
    ],
  },
  {
    id: "census_disability_prevalence",
    words: ["disability", "disabled", "people with disabilities", "living with a disability"],
  },
  { id: "eicv7_poverty_rate", words: ["poverty rate", "poverty", "poor", "deprivation", "how poor"] },
];
/** The compact profile shown for a district overview or a comparison. */
const PROFILE_IDS = [
  "eicv7_poverty_rate",
  "finscope_not_formally_included",
  "dhs_stunting",
  "lfs_unemployment_rate",
  "eicv7_health_insurance",
];
/**
 * A feasible, measure-appropriate focus for "where to act" answers — the kind of support that fits each gap. These are
 * options a programme could consider, grounded in the measure, never a claim that one thing causes another.
 */
const FOCUS_BY_MEASURE: Record<string, string> = {
  eicv7_poverty_rate: "targeted social protection (VUP) and income support",
  finscope_not_formally_included: "closer financial services — mobile money, SACCOs and agent networks",
  dhs_stunting: "nutrition-sensitive support for young children and mothers",
  lfs_unemployment_rate: "jobs and skills, especially for young people",
  eicv7_health_insurance: "health-insurance (Mutuelle/CBHI) enrolment",
};
const HIGH_WORDS = ["highest", "most", "worst", "top", "biggest", "greatest", "poorest", "most affected"];
const LOW_WORDS = ["lowest", "least", "best", "bottom", "smallest", "fewest", "richest", "wealthiest", "least affected"];
/** Common questions that aren't about one district or measure, answered from the figures the site already holds. */
const DATASET_WORDS = [
  "dataset",
  "datasets",
  "data do you have",
  "what data",
  "data behind",
  "catalogue",
  "catalog",
  "what surveys",
  "which surveys",
  "what sources",
];
const HEALTH_WORDS = ["financial health", "financially healthy", "health vs", "health versus", "healthy vs", "health against"];
const HELP_WORDS = [
  "what can you do",
  "who are you",
  "what do you do",
  "how can you help",
  "what can you help",
  "your capabilities",
  "what are you",
];
/** "Where to act" questions — the solution side of the challenge: what to prioritise and for whom. */
const ACTION_WORDS = [
  "prioritise",
  "prioritize",
  "priority",
  "priorities",
  "where to act",
  "act first",
  "what should be done",
  "what to do",
  "what can be done",
  "recommend",
  "recommendation",
  "intervene",
  "intervention",
  "target support",
  "how to help",
];
/** Questions about IMBONIX itself — the challenge it answers and the solution it offers. */
const ABOUT_WORDS = [
  "what is imbonix",
  "about imbonix",
  "what does imbonix",
  "why imbonix",
  "purpose of imbonix",
  "what problem",
  "the challenge",
  "what gap",
  "why does this matter",
  "what is this platform",
  "what is this site",
  "what is this tool",
];
/** Social protection questions, answered from the VUP figures the site holds. */
const VUP_WORDS = [
  "vup",
  "social protection",
  "social safety",
  "safety net",
  "cash transfer",
  "direct support",
  "public works",
  "nsds",
  "vision 2020 umurenge",
];
/** "How many …" questions about Rwanda's units and the data, answered from the site's own counts. */
const COUNT_WORDS = ["how many", "number of", "count of"];
/** Broad "how is Rwanda doing" questions, answered with a short national snapshot. */
const NATIONAL_WORDS = [
  "how is rwanda",
  "rwanda overall",
  "national picture",
  "overview of rwanda",
  "tell me about rwanda",
  "rwanda overview",
  "how is the country",
  "state of rwanda",
  "rwanda in general",
  "national overview",
  "how is rwanda doing",
];
/** A greeting, thanks or small talk with nothing else — met with a warm, human reply instead of a blank fallback. */
const GREETING_RE =
  /^(hi+|hello|hey|hiya|yo|greetings|good (morning|afternoon|evening|day)|muraho|mwaramutse|thanks?|thank you|bye|goodbye|welcome|how are (you|u|things|things going)|how('?s| is) (it going|things|everything|your day|life)|how do you do|how('?ve| have) you been|how are you doing|what('?s| is) up|wass?up|sup|nice to (meet|see) you|pleased to meet you|good to (meet|see) you)\b/i;
/** A request for a definition rather than a figure. */
const DEFINE_RE = /\b(what\s+(is|are|does)\s+|what's\s+|define\b|definition of\b|meaning of\b|what do you mean\b|explain\s+)/;

/** Plain-language definitions of the NISR terms the site uses, so "what is X" is answered without inventing a figure. */
type Definition = { words: string[]; heading: string; body: string; links?: AnswerLink[] };
const DEFINITIONS: Definition[] = [
  {
    words: ["financial inclusion", "financially included", "financial inclusivity"],
    heading: "Financial inclusion",
    body: "Financial inclusion means using at least one financial service — formal or informal — such as a bank, mobile money, a SACCO, insurance or a savings group. In Rwanda access is now almost universal; the harder goal is financial health.",
    links: [{ href: "/financial-exclusion", label: "Financial inclusion" }],
  },
  {
    words: ["financial exclusion", "financially excluded", "unbanked"],
    heading: "Financial exclusion",
    body: "Someone is financially excluded when they use no financial service at all — not a bank, mobile money, a SACCO, insurance or a savings group. It is the share of adults left outside every kind of finance.",
    links: [{ href: "/financial-exclusion", label: "Financial inclusion" }],
  },
  {
    words: ["formally served", "formally included", "formal finance"],
    heading: "Formally served",
    body: "Being formally served means using a regulated provider — a bank, mobile money, a SACCO, insurance or a pension. It is broader than being banked, which means holding your own bank account.",
    links: [{ href: "/financial-exclusion/access-and-use", label: "Access and use" }],
  },
  {
    words: ["financial health", "financially healthy"],
    heading: "Financial health",
    body: "Financial health is harder than access: it means managing money day to day, being able to save for the future, and coping with a shock — not just holding an account. It is the gap IMBONIX focuses on.",
    links: [{ href: "/financial-exclusion", label: "Financial inclusion" }],
  },
  {
    words: ["multidimensional poverty", "mpi", "multidimensionally poor"],
    heading: "Multidimensional poverty",
    body: "Multidimensional poverty counts people who are deprived at the same time in several dimensions of wellbeing — such as health, education, water, sanitation and housing — not only in income. It shows hardship that a money-only measure can miss.",
    links: [{ href: "/poverty-dynamics", label: "Poverty reduction" }],
  },
  {
    words: ["extreme poverty", "food poverty"],
    heading: "Extreme poverty",
    body: "Extreme poverty is being below the food (extreme) poverty line — consumption too low to meet basic food needs. It is a deeper line than the national poverty line.",
    links: [{ href: "/poverty-dynamics", label: "Poverty reduction" }],
  },
  {
    words: ["poverty line", "poverty rate", "poverty headcount", "headcount"],
    heading: "Poverty rate (headcount)",
    body: "The poverty rate, or headcount, is the share of people whose yearly consumption falls below the national poverty line. It counts how many are poor, not how far below the line they are.",
    links: [{ href: "/data/key-figures", label: "Rwanda in figures" }],
  },
  {
    words: ["stunting", "stunted", "chronic malnutrition"],
    heading: "Child stunting",
    body: "Stunting is when a child is too short for their age because of long-term undernutrition — a sign of chronic malnutrition in the first years of life, which can affect health and learning for good.",
    links: [{ href: "/poverty-dynamics/trends", label: "Trends" }],
  },
  {
    words: ["ubudehe"],
    heading: "Ubudehe category",
    body: "Ubudehe is Rwanda's official socio-economic categorisation of households, used to target support such as VUP and health-insurance subsidies to those who need it most.",
    links: [{ href: "/social-protection", label: "Social protection" }],
  },
  {
    words: ["sacco", "tontine", "savings group", "savings and credit"],
    heading: "SACCO and tontine",
    body: "A SACCO is a member-owned savings and credit cooperative (Umurenge SACCOs serve every sector). A tontine is an informal rotating savings and credit group. Both help people save and borrow outside the banks.",
    links: [{ href: "/financial-exclusion/access-and-use", label: "Access and use" }],
  },
  {
    words: ["mobile money", "momo"],
    heading: "Mobile money",
    body: "Mobile money lets people send, receive, save and pay using a phone account rather than a bank. It is the main reason formal financial access in Rwanda is now nearly universal.",
    links: [{ href: "/financial-exclusion/access-and-use", label: "Access and use" }],
  },
  {
    words: ["neet", "not in employment"],
    heading: "NEET (youth not in work or study)",
    body: "NEET means young people who are Not in Employment, Education or Training — neither working nor studying. It is a key sign of how well young people are moving into work.",
    links: [{ href: "/poverty-dynamics/trends", label: "Trends" }],
  },
  {
    words: ["small area estimation", "model estimate", "sae"],
    heading: "Small-area estimation",
    body: "Small-area estimation is a statistical model NISR uses to estimate figures for areas too small for the survey sample — such as sector poverty rates. Treat these as model estimates, and compare sectors only within the same district.",
    links: [{ href: "/poverty-dynamics/district-map", label: "District map" }],
  },
  {
    words: ["eicv", "finscope", "dhs", "cfsva", "rphc", "census"],
    heading: "Rwanda's NISR surveys",
    body: "IMBONIX is built on NISR's surveys and censuses: EICV (living conditions and poverty), FinScope (financial inclusion), the DHS (health and nutrition), the CFSVA (food security and shocks), the labour force survey, and the 2022 Population and Housing Census (RPHC5).",
    links: [{ href: "/data/key-figures", label: "Rwanda in figures" }],
  },
];
const hasAny = (query: string, words: string[]) => words.some((word) => query.includes(word));

const lower = (text: string) => text.toLowerCase();
const districtByName = (query: string): District[] =>
  DISTRICTS.filter((district) => new RegExp(`\\b${district.name.toLowerCase()}\\b`).test(query));

function topicFor(query: string): IndicatorMeta | null {
  let best: { id: string; score: number } | null = null;
  for (const topic of TOPICS) {
    for (const word of topic.words) {
      if (query.includes(word) && (!best || word.length > best.score)) best = { id: topic.id, score: word.length };
    }
  }
  return best ? meta(best.id) : null;
}

const sourceLine = (id: string) => {
  const source = SOURCES[id];
  return source ? `${source.source.replace(/^NISR /, "NISR ")} · ${source.table} · ${source.year}` : undefined;
};
const value = (district: District, id: string) => formatValue(meta(id), valueOf(district, id));
const topicLinks = (id: string): AnswerLink[] => {
  const links: AnswerLink[] = [];
  if (meta(id).layer) links.push({ href: `/poverty-dynamics/district-map?layer=${id}`, label: "See it on the map" });
  return links;
};

/** One district on one measure: its value, where it ranks and how it compares with Rwanda or the median. */
function districtValue(district: District, indicator: IndicatorMeta): Answer | null {
  if (valueOf(district, indicator.id) === undefined) return null;
  const rank = rankOf(district, indicator);
  const ref = reference(indicator.id);
  const short = indicator.short.toLowerCase();
  return {
    heading: `${district.name}: ${value(district, indicator.id)} ${short}`,
    body:
      `In ${district.name} (${PROVINCE_LABEL[district.province]}), ${short} is ${value(district, indicator.id)}.` +
      (rank ? ` That ranks ${rank.rank} of ${rank.of} districts, where 1 is the most affected.` : "") +
      ` ${ref.label} is ${formatValue(indicator, ref.value)}.` +
      (rank && rank.rank <= Math.ceil(rank.of / 3)
        ? ` On this measure ${district.name} is among the most affected districts, so it is a clear candidate for prioritised support.`
        : ""),
    stats: [
      { value: value(district, indicator.id), label: `${indicator.short}, ${district.name}` },
      { value: formatValue(indicator, ref.value), label: ref.label },
    ],
    source: sourceLine(indicator.id),
    status: SOURCES[indicator.id]?.status,
    links: [{ href: `/districts/${district.slug}`, label: `${district.name} profile` }, ...topicLinks(indicator.id)],
  };
}

/** The districts with the highest or lowest value on a measure. */
function extremes(indicator: IndicatorMeta, high: boolean): Answer {
  const ranked = DISTRICTS.filter((district) => valueOf(district, indicator.id) !== undefined).sort(
    (first, second) => (high ? 1 : -1) * (valueOf(second, indicator.id)! - valueOf(first, indicator.id)!),
  );
  // A measure published only nationally (no per-district values) has no "highest district" — answer it for Rwanda instead.
  if (ranked.length === 0) return nationalTopic(indicator);
  const short = indicator.short.toLowerCase();
  const top = ranked[0];
  return {
    heading: `${top.name} has the ${high ? "highest" : "lowest"} ${short}`,
    body: `Across the 30 districts, ${top.name} has the ${high ? "highest" : "lowest"} ${short} at ${value(top, indicator.id)}. ${ranked[ranked.length - 1].name} has the ${high ? "lowest" : "highest"}, at ${value(ranked[ranked.length - 1], indicator.id)}.`,
    rows: ranked.slice(0, 6).map((district) => ({
      label: district.name,
      value: value(district, indicator.id),
      hint: PROVINCE_LABEL[district.province],
    })),
    rowsCaption: `${high ? "Highest" : "Lowest"} ${short}, top 6`,
    source: sourceLine(indicator.id),
    status: SOURCES[indicator.id]?.status,
    links: topicLinks(indicator.id).length
      ? topicLinks(indicator.id)
      : [{ href: "/poverty-dynamics/district-map", label: "Open the district map" }],
  };
}

/** A measure for Rwanda, with the most and least affected district. */
function nationalTopic(indicator: IndicatorMeta): Answer {
  const ref = reference(indicator.id);
  const ranked = DISTRICTS.filter((district) => valueOf(district, indicator.id) !== undefined).sort(
    (first, second) =>
      (indicator.better === "higher" ? 1 : -1) * (valueOf(first, indicator.id)! - valueOf(second, indicator.id)!),
  );
  const short = indicator.short.toLowerCase();
  const worst = ranked[0];
  const best = ranked[ranked.length - 1];
  return {
    heading: `${short}: ${ref.label} ${formatValue(indicator, ref.value)}`,
    body:
      `${ref.label === "Rwanda" ? "For Rwanda" : "Across districts"}, ${short} is ${formatValue(indicator, ref.value)}.` +
      (worst
        ? ` It is hardest in ${worst.name} (${value(worst, indicator.id)}) and easiest in ${best.name} (${value(best, indicator.id)}).`
        : ""),
    stats: worst
      ? [
          { value: value(worst, indicator.id), label: `${worst.name} (most affected)` },
          { value: value(best, indicator.id), label: `${best.name} (least affected)` },
        ]
      : [{ value: formatValue(indicator, ref.value), label: ref.label }],
    source: sourceLine(indicator.id),
    status: SOURCES[indicator.id]?.status,
    links: topicLinks(indicator.id).length
      ? topicLinks(indicator.id)
      : [{ href: "/poverty-dynamics/district-map", label: "Open the district map" }],
  };
}

/** Two districts side by side on the headline measures. */
function compare(first: District, second: District): Answer {
  return {
    heading: `${first.name} and ${second.name}`,
    body: `How ${first.name} and ${second.name} compare on the headline measures. Each is the latest published NISR figure.`,
    rows: PROFILE_IDS.filter((id) => valueOf(first, id) !== undefined || valueOf(second, id) !== undefined).map((id) => ({
      label: meta(id).short,
      value: `${value(first, id)}  vs  ${value(second, id)}`,
    })),
    rowsCaption: `${first.name} vs ${second.name}`,
    links: [
      { href: `/districts/${first.slug}`, label: `${first.name} profile` },
      { href: `/districts/${second.slug}`, label: `${second.name} profile` },
    ],
  };
}

/** A district across the headline measures. */
function districtOverview(district: District): Answer {
  const poverty = meta("eicv7_poverty_rate");
  return {
    heading: `${district.name} at a glance`,
    body: `${district.name} is in the ${PROVINCE_LABEL[district.province]}. Here are its latest NISR figures on the headline measures; open its profile for everything, year by year.`,
    rows: PROFILE_IDS.filter((id) => valueOf(district, id) !== undefined).map((id) => {
      const rank = rankOf(district, meta(id));
      return {
        label: meta(id).short,
        value: value(district, id),
        hint: rank ? `${ordinal(rank.rank)} of ${rank.of}` : undefined,
      };
    }),
    rowsCaption: `${district.name}, headline measures`,
    status: SOURCES[poverty.id]?.status,
    links: [
      { href: `/districts/${district.slug}`, label: `${district.name} profile` },
      { href: `/poverty-dynamics/district-map?district=${district.slug}`, label: "See it on the map" },
    ],
  };
}

/** What data the platform is built on, from the NISR microdata catalogue the site indexes. */
function datasetsAnswer(): Answer {
  return {
    heading: "The data behind IMBONIX",
    body:
      `IMBONIX draws on ${CATALOG_STUDIES.length} NISR studies from ${CATALOG_YEARS[0]} to ${CATALOG_YEARS[1]}, across ` +
      `${CATALOG_THEMES.length} themes: the censuses, EICV, FinScope, the DHS, the labour force and establishment surveys, ` +
      `the CFSVA and more. Every figure here is traced to a published NISR table, including partner data collected under ` +
      `NISR (the DHS with ICF, the CFSVA with the World Food Programme).`,
    stats: [
      { value: String(CATALOG_STUDIES.length), label: "NISR studies used" },
      { value: `${CATALOG_YEARS[0]}–${CATALOG_YEARS[1]}`, label: "years covered" },
    ],
    source: "NISR, national surveys and censuses",
    links: [
      { href: "/data/key-figures", label: "Rwanda in figures" },
      { href: "/about#sources", label: "Sources & method" },
    ],
  };
}

/** The difference between using a financial service and being financially healthy, from FinScope 2024. */
function financialHealthAnswer(): Answer {
  const included = INCLUSION_BY_ROUND.find((row) => row.measure === "Financially included")!.in2024;
  const healthy = FINANCIAL_HEALTH_SEGMENTS.find((segment) => segment.segment === "Financially healthy")!.share;
  const vulnerable = FINANCIAL_HEALTH_SEGMENTS.filter((segment) => /vulnerable/i.test(segment.segment)).reduce(
    (sum, segment) => sum + segment.share,
    0,
  );
  const healthTarget = TARGET_PROGRESS.find((target) => /financially healthy/i.test(target.measure));
  return {
    heading: `Access is ${included}%, but only ${healthy}% are financially healthy`,
    body:
      `Access is effectively solved: ${included}% of adults use a financial service. The real frontier is resilience. ` +
      "Being financially healthy is harder — managing day-to-day money, saving, and coping with a shock, not just " +
      `holding an account. Only ${healthy}% reach it, while ${vulnerable}% are vulnerable or extremely vulnerable.` +
      (healthTarget
        ? ` Rwanda's National Financial Inclusion Roadmap targets ${healthTarget.target}% financially healthy by ${healthTarget.by}.`
        : "") +
      " Closing that gap — moving from access to meaningful usage and financial health — is what IMBONIX measures and helps act on.",
    rows: FINANCIAL_HEALTH_SEGMENTS.map((segment) => ({ label: segment.segment, value: `${segment.share}%` })),
    rowsCaption: "Adults by financial health, 2024",
    source: `${FINSCOPE_2024_SOURCE}, section 5.2`,
    status: "observed",
    links: [{ href: "/financial-exclusion", label: "See the evidence" }],
  };
}

/** What the assistant can do, for a "who are you" or "what can you do" question. */
function helpAnswer(): Answer {
  return {
    heading: "What I can help with",
    body:
      "Ask me about any of Rwanda's 30 districts or the measures behind financial inclusion and poverty: a single " +
      "figure, where a measure is highest or lowest, a comparison of two districts, or what a measure means. When the " +
      "site's AI service is connected I can also read a picture or document you attach. Every answer comes from NISR's " +
      "published figures, with the source named.",
    links: [
      { href: "/data/key-figures", label: "Rwanda in figures" },
      { href: "/districts", label: "All 30 districts" },
    ],
  };
}

/** How social protection (the VUP) reaches people, from the NISR poverty and social-protection figures. */
function vupAnswer(): Answer {
  const women = VUP_SHARE_BY_SEX.find((row) => row.sex === "Women")?.beneficiaries;
  const vupPoverty = POVERTY_AMONG_VUP_BENEFICIARIES.find((row) => /vup/i.test(row.group))?.povertyRate;
  return {
    heading: `VUP reaches about ${VUP_BENEFICIARIES.toLocaleString("en-US")} people`,
    body:
      "The Vision 2020 Umurenge Programme (VUP) is Rwanda's main social protection scheme: cash for households who cannot " +
      "work (Direct Support), paid public works, and financial services. It is targeted at the poorest, and most " +
      "beneficiaries are women. The gap to watch is whether payments reach people on time.",
    stats: [
      { value: VUP_BENEFICIARIES.toLocaleString("en-US"), label: "VUP beneficiaries" },
      ...(women !== undefined ? [{ value: `${women}%`, label: "are women" }] : []),
      ...(vupPoverty !== undefined ? [{ value: `${vupPoverty}%`, label: "of beneficiaries are poor" }] : []),
    ],
    rows: VUP_BENEFICIARIES_BY_PROGRAMME.map((programme) => ({ label: programme.programme, value: `${programme.share}%` })),
    rowsCaption: "VUP beneficiaries by programme",
    source: SOCIAL_PROTECTION_SOURCE,
    status: "observed",
    links: [
      { href: "/social-protection", label: "Social protection" },
      { href: "/social-protection/priority-districts", label: "Where to act first" },
    ],
  };
}

/** A short national snapshot, for a broad "how is Rwanda doing" question. */
function nationalOverview(): Answer {
  const latest = POVERTY_RATE_BY_YEAR[POVERTY_RATE_BY_YEAR.length - 1];
  const included = INCLUSION_BY_ROUND.find((row) => row.measure === "Financially included")?.in2024;
  const healthy = FINANCIAL_HEALTH_SEGMENTS.find((segment) => segment.segment === "Financially healthy")?.share;
  const stunting = meta("dhs_stunting");
  return {
    heading: "Rwanda at a glance",
    body:
      "The headline picture from NISR's latest figures: poverty is falling and financial access is almost universal, but " +
      "financial health and child nutrition still lag. That gap — reaching people, versus leaving them resilient — is what " +
      "IMBONIX examines.",
    stats: [
      ...(latest ? [{ value: `${latest.povertyRate}%`, label: `Poverty rate (${latest.year})` }] : []),
      ...(included !== undefined ? [{ value: `${included}%`, label: "Financially included (2024)" }] : []),
      ...(healthy !== undefined ? [{ value: `${healthy}%`, label: "Financially healthy (2024)" }] : []),
      ...(stunting.national !== undefined ? [{ value: formatValue(stunting, stunting.national), label: "Child stunting" }] : []),
    ],
    source: `${EICV7_PROFILE_SOURCE}; ${FINSCOPE_2024_SOURCE}`,
    status: "observed",
    links: [
      { href: "/data/key-figures", label: "Rwanda in figures" },
      { href: "/poverty-dynamics", label: "Poverty reduction" },
      { href: "/financial-exclusion", label: "Financial inclusion" },
    ],
  };
}

/** How many of a unit (districts, sectors, cells, villages, indicators, studies) there are, from the site's own counts. */
function countsAnswer(query: string): Answer | null {
  const facts: { words: string[]; value: string; label: string }[] = [
    { words: ["district"], value: String(SITE_FACTS.districts), label: "districts" },
    { words: ["sector"], value: String(SITE_FACTS.sectors), label: "sectors" },
    { words: ["cell"], value: SITE_FACTS.cells.toLocaleString("en-US"), label: "cells" },
    { words: ["village", "umudugudu"], value: SITE_FACTS.villages.toLocaleString("en-US"), label: "villages" },
    { words: ["indicator", "measure"], value: String(SITE_FACTS.indicators), label: "district indicators" },
    { words: ["province"], value: "5", label: "provinces (plus the City of Kigali)" },
    { words: ["study", "studies", "survey", "dataset"], value: String(CATALOG_STUDIES.length), label: "NISR studies" },
  ];
  const hit = facts.find((fact) => fact.words.some((word) => query.includes(word)));
  if (!hit) return null;
  return {
    heading: `Rwanda has ${hit.value} ${hit.label}`,
    body:
      `IMBONIX covers all ${SITE_FACTS.districts} districts and ${SITE_FACTS.sectors} sectors, with place search down to ` +
      `${SITE_FACTS.cells.toLocaleString("en-US")} cells and ${SITE_FACTS.villages.toLocaleString("en-US")} villages, over ` +
      `${SITE_FACTS.indicators} district indicators from ${CATALOG_STUDIES.length} NISR studies.`,
    stats: [{ value: hit.value, label: hit.label }],
    source: "NISR administrative units and published indicators",
    links: [
      { href: "/data/key-figures", label: "Rwanda in figures" },
      { href: "/districts", label: "All 30 districts" },
    ],
  };
}

/** A plain-language definition of a NISR term, for a "what is X" question. */
function definitionAnswer(concept: Definition): Answer {
  return {
    heading: concept.heading,
    body: concept.body,
    source: "Definition follows NISR's own usage",
    links: concept.links ?? [{ href: "/data/key-figures", label: "Rwanda in figures" }],
  };
}

/** A warm welcome for a greeting or thanks, so the first message is friendly, not a blank fallback. */
function greetingAnswer(): Answer {
  return {
    heading: "Hello — good to meet you",
    body:
      "I'm doing well, thanks for asking — and I'm ready to help. I'm IMBONIX AI, and I can help you explore Rwanda's " +
      "poverty, financial inclusion and social protection, all from NISR's published figures with the source named every " +
      "time. Ask in your own words: how a district is doing, where a measure is highest or lowest, how two places compare, " +
      "what a term means, or how support reaches vulnerable households. What would you like to look at first?",
    links: [
      { href: "/data/key-figures", label: "Rwanda in figures" },
      { href: "/districts", label: "All 30 districts" },
    ],
  };
}

/**
 * Where to focus in one district — the solution side of the challenge. It names the measures the district is most
 * affected on (by rank) and a feasible, measure-appropriate focus, framed as places and gaps to target, never a cause.
 */
function priorityAnswer(district: District): Answer {
  const ranked = PROFILE_IDS.map((id) => ({ id, rank: rankOf(district, meta(id)) }))
    .filter((entry): entry is { id: string; rank: { rank: number; of: number } } => entry.rank !== undefined)
    .sort((first, second) => first.rank.rank - second.rank.rank); // rank 1 = most affected
  const worst = ranked.slice(0, 3);
  if (worst.length === 0) return districtOverview(district);
  const focus = worst.map((entry) => FOCUS_BY_MEASURE[entry.id]).filter(Boolean);
  const named = worst.map((entry) => `${meta(entry.id).short.toLowerCase()} (${ordinal(entry.rank.rank)} of ${entry.rank.of})`);
  return {
    heading: `Where to focus in ${district.name}`,
    body:
      `On NISR's figures, ${district.name} (${PROVINCE_LABEL[district.province]}) is most affected on ${named.join(", ")}. ` +
      (focus.length ? `A feasible focus: ${focus.join("; ")}. ` : "") +
      "These are places and gaps, not causes — use them to target support where it goes furthest.",
    rows: worst.map((entry) => ({
      label: meta(entry.id).short,
      value: value(district, entry.id),
      hint: `${ordinal(entry.rank.rank)} of ${entry.rank.of}`,
    })),
    rowsCaption: `${district.name}: most affected measures`,
    status: "observed",
    links: [
      { href: "/social-protection/intervention-planner", label: "Plan an intervention" },
      { href: "/social-protection/priority-districts", label: "Where to act first" },
      { href: `/districts/${district.slug}`, label: `${district.name} profile` },
    ],
  };
}

/** Where to act first nationally: the districts most affected by poverty, with a pointer to the priority tools. */
function nationalPriorityAnswer(): Answer {
  const poverty = meta("eicv7_poverty_rate");
  const ranked = DISTRICTS.filter((district) => valueOf(district, poverty.id) !== undefined).sort(
    (first, second) => valueOf(second, poverty.id)! - valueOf(first, poverty.id)!,
  );
  const top = ranked.slice(0, 5);
  return {
    heading: "Where to act first",
    body:
      "On the headline measure of need — the poverty rate — these districts are most affected, so they are the clearest " +
      "candidates for prioritised support. IMBONIX ranks all 30 districts across seven policy levers, so you can target by " +
      "the specific gap, not poverty alone.",
    rows: top.map((district) => ({
      label: district.name,
      value: value(district, poverty.id),
      hint: PROVINCE_LABEL[district.province],
    })),
    rowsCaption: "Most affected by poverty, top 5",
    source: sourceLine(poverty.id),
    status: SOURCES[poverty.id]?.status,
    links: [
      { href: "/social-protection/priority-districts", label: "Priority ranking" },
      { href: "/poverty-dynamics/overlapping-needs", label: "Overlapping needs" },
      { href: "/poverty-dynamics/district-map", label: "District map" },
    ],
  };
}

/** What IMBONIX is for: the challenge it answers (Track 2) and the solution it offers. */
function aboutAnswer(): Answer {
  return {
    heading: "What IMBONIX is for",
    body:
      "IMBONIX answers Rwanda's NISR open-data challenge (Track 2): using data to understand financial exclusion, poverty " +
      "dynamics and the impact of social protection. The gap it addresses is that access to finance is now almost " +
      "universal, yet financial health is not, and poverty is uneven from one place to the next. IMBONIX brings NISR's " +
      "published figures together — down to sector, cell and village — with a map, district profiles, a priority ranking " +
      "and this assistant, so policymakers, NGOs and financial-inclusion teams can see where households are vulnerable, " +
      "and act.",
    stats: [
      { value: `${SITE_FACTS.indicators}`, label: "district indicators" },
      { value: `${SITE_FACTS.districts}`, label: "districts covered" },
      { value: `${SITE_FACTS.publications}`, label: "NISR publications" },
    ],
    source: "IMBONIX, built on NISR's published statistics",
    links: [
      { href: "/about", label: "About IMBONIX" },
      { href: "/data/key-figures", label: "Rwanda in figures" },
    ],
  };
}

export const SUGGESTIONS = [
  "Which districts have the highest poverty rates?",
  "Compare financial inclusion across districts.",
  "How can social protection reduce household poverty?",
  "Which vulnerable households may need more support?",
  "What does the available data tell us about Gasabo?",
];

/**
 * Answer a question from the published NISR figures the platform holds: a district on a measure, where a measure is
 * highest or lowest, two districts compared, a district overview, or a measure for Rwanda. Grounded only, with the
 * source on every answer; when nothing matches, it says what it can answer. No figure is ever invented.
 */
export function answerQuery(raw: string): Answer {
  const query = lower(raw).trim();
  if (!query) return fallback();
  const namedDistricts = districtByName(query);

  // No district named? See if a sector, cell or village is, and answer at its district's level — NISR publishes figures
  // to sector and district level, so a cell or village takes the figures of the sector and district it sits in.
  const place = namedDistricts.length === 0 ? resolvePlaceHit(raw) : null;
  const placeDistrict = place ? DISTRICTS.find((district) => district.name === place.district) : undefined;
  const districts = namedDistricts.length > 0 ? namedDistricts : placeDistrict ? [placeDistrict] : [];

  const topic = topicFor(query);
  const wantsHigh = HIGH_WORDS.some((word) => query.includes(word));
  const wantsLow = LOW_WORDS.some((word) => query.includes(word));
  const wantsCompare = /\b(compare|versus|vs\.?|against)\b/.test(query) || districts.length >= 2;
  const wantsDefine = DEFINE_RE.test(query);
  const concept = wantsDefine ? DEFINITIONS.find((entry) => entry.words.some((word) => query.includes(word))) : undefined;

  // When the place found was a sector, cell or village, open the answer by naming where it sits.
  const withPlace = (answer: Answer): Answer =>
    place
      ? {
          ...answer,
          heading: `${place.name}: in ${place.district}`,
          body:
            `${place.name} is a ${place.kind} in ${place.sector} sector, ${place.district} district. NISR publishes figures to ` +
            `sector and district level, so these are ${place.district}'s figures. ${answer.body}`,
        }
      : answer;

  // Conversational and broad intents first, so a plain "what is …", "how many …", a VUP question or a greeting is met
  // directly rather than falling through to a figure or a blank fallback.
  if (districts.length >= 2 && wantsCompare) return compare(districts[0], districts[1]);
  if (hasAny(query, HEALTH_WORDS)) return financialHealthAnswer();
  if (hasAny(query, VUP_WORDS)) return vupAnswer();
  if (hasAny(query, COUNT_WORDS)) {
    const counts = countsAnswer(query);
    if (counts) return counts;
  }
  if (concept && districts.length === 0) return definitionAnswer(concept);

  // The solution side of the challenge: what to prioritise, and for whom.
  if (hasAny(query, ACTION_WORDS)) return districts.length === 1 ? priorityAnswer(districts[0]) : nationalPriorityAnswer();

  // A specific district and/or measure.
  if (topic && (wantsHigh || wantsLow) && districts.length === 0) return extremes(topic, wantsHigh || !wantsLow);
  if (topic && districts.length === 1) return withPlace(districtValue(districts[0], topic) ?? nationalTopic(topic));
  if (districts.length === 1) return withPlace(districtOverview(districts[0]));
  if (topic) return nationalTopic(topic);

  // Broad standbys, then a helpful fallback.
  if (hasAny(query, DATASET_WORDS)) return datasetsAnswer();
  if (hasAny(query, NATIONAL_WORDS)) return nationalOverview();
  if (hasAny(query, ABOUT_WORDS)) return aboutAnswer();
  if (hasAny(query, HELP_WORDS)) return helpAnswer();
  if (GREETING_RE.test(query)) return greetingAnswer();
  if (wantsHigh || wantsLow) return extremes(meta("eicv7_poverty_rate"), wantsHigh || !wantsLow);
  return fallback();
}

/**
 * A few relevant next questions to offer as tappable chips after an answer, shaped by what was last asked: if a
 * district was named, lead with questions about it, then fill with the common ones. Each is phrased so the engine
 * answers it well. Capped at four.
 */
export function followUpSuggestions(lastUserText: string): string[] {
  const query = lower(lastUserText);
  const district = districtByName(query)[0];
  const place = district ? null : resolvePlaceHit(lastUserText);
  const chips: string[] = [];
  // Lead with questions about the place in hand (the spec's deeper-geography, comparison and intervention angles).
  if (district) {
    chips.push(
      `${district.name} at a glance`,
      `How poor is ${district.name}?`,
      `Financial exclusion in ${district.name}`,
      `What should be prioritised in ${district.name}?`,
    );
  } else if (place) {
    chips.push(`How poor is ${place.district}?`, `Financial exclusion in ${place.district}`);
  }
  // Then the Track 2 standbys: where need is highest, how social protection reaches people, how to prioritise, and what
  // the measures mean.
  chips.push(
    "Where is financial exclusion highest?",
    "How does VUP reach people?",
    "Which districts should be prioritised?",
    "Explain financial health vs. access",
  );
  return Array.from(new Set(chips)).slice(0, 5);
}

function fallback(): Answer {
  return {
    heading: "Happy to help — what would you like to explore?",
    body:
      "I can look at any of Rwanda's 30 districts across poverty, financial exclusion, child stunting, unemployment, " +
      "health insurance, electricity, water, phones and more — all from NISR's published figures, with the source named. " +
      "Try naming a district, asking where a measure is highest or lowest, comparing two places, or asking what a term " +
      "means. What shall we start with?",
    links: [
      { href: "/data/key-figures", label: "Rwanda in figures" },
      { href: "/districts", label: "All 30 districts" },
    ],
  };
}
