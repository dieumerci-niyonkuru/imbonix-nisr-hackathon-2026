import { DISTRICTS, PROVINCE_LABEL, rankOf, reference, SOURCES, valueOf, type District } from "@/lib/data";
import { formatValue } from "@/lib/format";
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
    rows: ranked
      .slice(0, 6)
      .map((district) => ({
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
      return { label: meta(id).short, value: value(district, id), hint: rank ? `#${rank.rank} of ${rank.of}` : undefined };
    }),
    rowsCaption: `${district.name}, headline measures`,
    status: SOURCES[poverty.id]?.status,
    links: [
      { href: `/districts/${district.slug}`, label: `${district.name} profile` },
      { href: `/poverty-dynamics/district-map?district=${district.slug}`, label: "See it on the map" },
    ],
  };
}

export const SUGGESTIONS = [
  "How poor is Rulindo?",
  "Where is financial exclusion highest?",
  "Compare Rulindo and Gasabo",
  "Which district has the most child stunting?",
  "Unemployment in Nyamasheke",
  "Who is most affected by natural hazards?",
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
      { href: "/data/catalog", label: "The data behind this" },
    ],
  };
}
