import { CATALOG_STUDIES, CATALOG_THEMES, CATALOG_YEARS } from "@/lib/catalog";
import { DISTRICTS, PROVINCE_LABEL, rankOf, reference, SOURCES, valueOf, type District } from "@/lib/data";
import { FINANCIAL_HEALTH_SEGMENTS, FINSCOPE_2024_SOURCE, INCLUSION_BY_ROUND } from "@/lib/finscope-2024";
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
      "unbanked",
      "excluded",
      "exclusion",
    ],
  },
  { id: "finscope_banked", words: ["bank account", "banked", "banking", "bank"] },
  { id: "eicv7_health_insurance", words: ["health insurance", "health cover", "mutuelle", "cbhi", "insurance"] },
  { id: "dhs_stunting", words: ["child stunting", "stunting", "stunted", "malnutrition", "nutrition"] },
  { id: "dhs_underweight", words: ["underweight children", "underweight"] },
  { id: "lfs_unemployment_rate", words: ["unemployment rate", "unemployment", "unemployed", "jobless"] },
  { id: "lfs_neet_youth", words: ["youth not in work", "neet", "idle youth"] },
  { id: "lfs_median_monthly_earnings", words: ["median earnings", "earnings", "income", "wages", "salary", "pay"] },
  { id: "eicv7_electricity_lighting", words: ["electricity", "power", "lighting"] },
  { id: "eicv7_internet_home", words: ["internet at home", "internet", "online"] },
  { id: "eicv7_hh_smartphone", words: ["smartphone", "smart phone"] },
  { id: "eicv7_hh_mobile_phone", words: ["mobile phone", "phone ownership"] },
  { id: "eicv7_improved_water", words: ["drinking water", "clean water", "water"] },
  { id: "eicv7_improved_sanitation", words: ["sanitation", "toilet"] },
  { id: "cfsva_hazard_any", words: ["natural hazard", "hazard", "disaster", "climate shock", "drought", "flood", "landslide"] },
  { id: "census_mpi_headcount", words: ["multidimensional poverty", "multidimensionally poor", "mpi"] },
  { id: "eicv7_poverty_rate", words: ["poverty rate", "poverty", "poor"] },
];
/** The compact profile shown for a district overview or a comparison. */
const PROFILE_IDS = [
  "eicv7_poverty_rate",
  "finscope_not_formally_included",
  "dhs_stunting",
  "lfs_unemployment_rate",
  "eicv7_health_insurance",
];
const HIGH_WORDS = ["highest", "most", "worst", "top", "biggest", "greatest"];
const LOW_WORDS = ["lowest", "least", "best", "bottom", "smallest", "fewest"];
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
      ` ${ref.label} is ${formatValue(indicator, ref.value)}.`,
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
  return {
    heading: `Access is ${included}%, but financial health is ${healthy}%`,
    body:
      "Being financially included means using any financial service — a bank, a SACCO, mobile money, insurance or a " +
      "savings group. Being financially healthy is harder: it means managing day-to-day money, saving for the future " +
      `and coping with a shock. In 2024, ${included}% of adults were included, yet only ${healthy}% were financially ` +
      "healthy. That gap, not access alone, is the heart of what IMBONIX examines.",
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

export const SUGGESTIONS = [
  "How poor is Rulindo?",
  "Where is financial exclusion highest?",
  "Compare Rulindo and Gasabo",
  "Which district has the most child stunting?",
  "Explain financial health vs. access",
  "What datasets do you have?",
];

/**
 * Answer a question from the published NISR figures the platform holds: a district on a measure, where a measure is
 * highest or lowest, two districts compared, a district overview, or a measure for Rwanda. Grounded only, with the
 * source on every answer; when nothing matches, it says what it can answer. No figure is ever invented.
 */
export function answerQuery(raw: string): Answer {
  const query = lower(raw).trim();
  if (!query) return fallback();
  const districts = districtByName(query);
  const topic = topicFor(query);
  const wantsHigh = HIGH_WORDS.some((word) => query.includes(word));
  const wantsLow = LOW_WORDS.some((word) => query.includes(word));
  const wantsCompare = /\b(compare|versus|vs\.?|against)\b/.test(query) || districts.length >= 2;

  if (districts.length >= 2 && wantsCompare) return compare(districts[0], districts[1]);
  if (topic && (wantsHigh || wantsLow) && districts.length === 0) return extremes(topic, wantsHigh || !wantsLow);
  if (topic && districts.length === 1) return districtValue(districts[0], topic) ?? nationalTopic(topic);
  if (districts.length === 1) return districtOverview(districts[0]);
  if (topic) return nationalTopic(topic);
  if (hasAny(query, HEALTH_WORDS)) return financialHealthAnswer();
  if (hasAny(query, DATASET_WORDS)) return datasetsAnswer();
  if (hasAny(query, HELP_WORDS)) return helpAnswer();
  if (wantsHigh || wantsLow) return extremes(meta("eicv7_poverty_rate"), wantsHigh || !wantsLow);
  return fallback();
}

function fallback(): Answer {
  return {
    heading: "Ask about any district or measure",
    body:
      "I answer from NISR's published figures for all 30 districts: poverty, financial exclusion, child stunting, " +
      "unemployment, health insurance, electricity, water, phones and more. Ask for a district, where a measure is " +
      "highest or lowest, or compare two districts. Every answer names its source.",
    links: [
      { href: "/data/key-figures", label: "Rwanda in figures" },
      { href: "/districts", label: "All 30 districts" },
    ],
  };
}
