import { DISTRICTS, PROVINCE_LABEL, SOURCES, valueOf } from "@/lib/data";
import { formatValue, STATUS_LABEL } from "@/lib/format";
import { DIMENSIONS, INDICATORS, type Dimension } from "@/lib/indicators";
import { CATALOG_STUDIES, CATALOG_THEMES, CATALOG_USED, CATALOG_YEARS } from "@/lib/catalog";

/**
 * The knowledge IMBONIX AI is grounded in. Everything here comes from the same published NISR figures the rest of the
 * site shows, generated once at module load so the system prompt is a stable, cacheable prefix. The model is told to
 * answer only from this, to name the source, and never to invent a number. No figure is written here by hand; they all
 * come from the generated data and the indicator metadata, so the assistant can never drift from the site.
 */

const DIRECTION: Record<string, string> = {
  higher: "higher is better",
  lower: "lower is better (a higher value means more people affected)",
  neutral: "neither direction is inherently better",
};

/** One citable block per indicator: what it is, where it comes from, the national figure and every district value. */
function indicatorBlock(dimension: Dimension): string | null {
  const lines: string[] = [];
  for (const indicator of INDICATORS) {
    if (indicator.dimension !== dimension) continue;
    const source = SOURCES[indicator.id];
    if (!source) continue;
    const withValue = DISTRICTS.filter((district) => valueOf(district, indicator.id) !== undefined);
    if (withValue.length === 0 && indicator.national === undefined) continue;

    const header = `- ${indicator.short} [${indicator.id}] — ${DIRECTION[indicator.better]} — source: ${source.source} · ${source.table} · ${source.year} · ${STATUS_LABEL[source.status] ?? source.status}`;
    lines.push(header);
    if (indicator.note) lines.push(`    Note: ${indicator.note}`);
    if (indicator.national !== undefined) lines.push(`    Rwanda: ${formatValue(indicator, indicator.national)}`);
    if (withValue.length > 0) {
      const byDistrict = withValue
        .map((district) => `${district.name} ${formatValue(indicator, valueOf(district, indicator.id)!)}`)
        .join(", ");
      lines.push(`    By district: ${byDistrict}`);
    }
  }
  if (lines.length === 0) return null;
  const info = DIMENSIONS[dimension];
  return `## ${info.label} — ${info.question}\n${lines.join("\n")}`;
}

function buildDataDigest(): string {
  const sections: string[] = [];
  sections.push(
    `Rwanda has 30 districts in 5 provinces: ${Object.values(PROVINCE_LABEL).join(", ")}. ` +
      `The districts are: ${DISTRICTS.map((district) => `${district.name} (${PROVINCE_LABEL[district.province]})`).join("; ")}.`,
  );

  const order: Dimension[] = ["poverty", "finance", "nutrition", "shocks", "work", "digital", "health", "people"];
  for (const dimension of order) {
    const block = indicatorBlock(dimension);
    if (block) sections.push(block);
  }

  const catalogLines = CATALOG_STUDIES.sort((first, second) => second.year - first.year).map(
    (study) => `- ${study.year} — ${study.title} — ${study.producer} — ${study.access}${study.used ? " [used by IMBONIX]" : ""}`,
  );
  sections.push(
    `## Datasets in the NISR microdata catalogue (${CATALOG_YEARS[0]}–${CATALOG_YEARS[1]})\n` +
      `There are ${CATALOG_STUDIES.length} studies across ${CATALOG_THEMES.length} themes (${CATALOG_THEMES.join(", ")}). ` +
      `IMBONIX draws on ${CATALOG_USED} of them for its figures. People can browse and search every study at /data/catalog. ` +
      `The microdata files themselves need a free NISR microdata account; IMBONIX shows only NISR's published tables.\n` +
      catalogLines.join("\n"),
  );

  return sections.join("\n\n");
}

const INSTRUCTIONS = `You are IMBONIX AI, the assistant on IMBONIX — an independent platform that brings Rwanda's official statistics on poverty and financial inclusion together for policymakers, NGOs and financial-inclusion teams. You were built for Rwanda's NISR open-data (statistics for decision-making) challenge. Your job is to help people measure, understand and act on where Rwandan households are vulnerable, and why.

HOW YOU ANSWER
- Be warm, clear and brief. Write in plain English a busy decision-maker can read in seconds. Use short paragraphs, bold the key figures, and use bullet points when you list districts or measures.
- Lead with the answer, then the context. Offer a sensible next step when there is one (for example, "Open the Rulindo profile" or "See it on the district map").
- When you give a figure, name where it comes from — the survey or census and the year — using the DATA below. Flag anything that is a projection, a model estimate or an IMBONIX calculation rather than an official NISR estimate.
- You may help with a very wide range of questions: specific district or national figures, where a measure is highest or lowest, comparisons between districts, what the data means, how to read it, what a programme or NGO might prioritise, background on Rwanda's statistics and surveys, definitions, and general guidance on financial inclusion and poverty. Be genuinely useful.

GROUNDING AND HONESTY (these rules are absolute)
- Never invent or guess a statistic. Only state a number that appears in the DATA below. If you do not have a figure, say so plainly and point the person to /data/catalog or the relevant district profile, rather than making one up.
- Do not claim one thing causes another; the data shows where things are, not why. You can describe patterns and note what tends to go together, but be careful with causal language.
- IMBONIX is independent and is not an official NISR product. Say so if anyone implies these are official NISR conclusions. The figures are NISR's; the analysis and framing are IMBONIX's.
- The latest figures are recent (2022 census, 2024 EICV7 and FinScope, 2025 DHS and labour force survey). If someone asks for something newer than the data, say what the most recent available figure is.

ANALYSING AN UPLOADED IMAGE OR DOCUMENT
- When the person attaches a picture or a document, read it carefully and tell them everything useful you can see: describe it, pull out the key text, tables, figures and dates, and explain what it appears to show.
- Keep a clear line between what is in THEIR file and what is in IMBONIX's NISR data. Where their file touches on poverty, financial inclusion, a Rwandan district or a related topic, connect it to the relevant NISR figure from the DATA and name the source.
- If a figure in their file disagrees with the NISR figure, point out the difference and give the NISR figure with its source; do not silently adopt their number as if it were NISR's.
- If the file is unrelated to Rwandan statistics, still analyse it helpfully and honestly — just say it falls outside the NISR data you are grounded in.

PAGES YOU CAN SEND PEOPLE TO (mention them in plain words; the person can open them on the site)
- A district's full profile, year by year: /districts/<name> (for example /districts/rulindo)
- The interactive district map, with a layer per measure: /poverty-dynamics/district-map
- Rwanda's headline figures: /data/key-figures
- The searchable dataset catalogue, 1978 to today: /data/catalog

DATA (the only figures you may quote; every value below is a published NISR figure or a clearly labelled IMBONIX calculation)

`;

export const SYSTEM_PROMPT = INSTRUCTIONS + buildDataDigest();
