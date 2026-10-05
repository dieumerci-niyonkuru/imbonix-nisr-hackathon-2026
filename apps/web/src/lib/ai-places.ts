import placesJson from "@/data/generated/places.json";
import { DISTRICTS } from "@/lib/data";

/**
 * Resolve a sector, cell or village named in a question to the sector and district it sits in, so IMBONIX AI can answer
 * about the ~2,100 cells and ~14,800 villages that are far too many to put in the system prompt. The place index
 * (places.json) maps cells to their sector and villages to their cell; this builds a name lookup once, server-side, and
 * returns a short context note for any place names found in the text. NISR publishes figures to sector level, so a cell
 * or village takes its sector's figures.
 */

type PlaceKind = "sector" | "cell" | "village";
type PlaceHit = { name: string; kind: PlaceKind; sector: string; district: string };
type RawIndex = { sectors: [string, string][]; cells: [string, number][]; villages: [string, number][] };

const index = placesJson as unknown as RawIndex;
const districtNameBySlug: Record<string, string> = Object.fromEntries(
  DISTRICTS.map((district) => [district.slug, district.name]),
);

const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Common English and query words that are never a Rwandan place, so they can't trigger a false match. */
const STOP = new Set([
  "about",
  "access",
  "adults",
  "africa",
  "banked",
  "between",
  "centre",
  "child",
  "compare",
  "data",
  "district",
  "districts",
  "excluded",
  "figures",
  "financial",
  "financially",
  "gaps",
  "have",
  "health",
  "healthy",
  "highest",
  "household",
  "households",
  "inclusion",
  "income",
  "insurance",
  "kigali",
  "lowest",
  "measure",
  "mobile",
  "money",
  "most",
  "nutrition",
  "people",
  "phone",
  "population",
  "poor",
  "poverty",
  "province",
  "rate",
  "rural",
  "rwanda",
  "sector",
  "sectors",
  "show",
  "social",
  "stunting",
  "support",
  "that",
  "their",
  "them",
  "this",
  "unemployment",
  "urban",
  "village",
  "villages",
  "vulnerable",
  "water",
  "where",
  "which",
  "with",
  "women",
]);

const LOOKUP = new Map<string, PlaceHit[]>();
function add(hit: PlaceHit) {
  const key = fold(hit.name);
  const existing = LOOKUP.get(key);
  if (existing) {
    if (existing.length < 6) existing.push(hit);
  } else {
    LOOKUP.set(key, [hit]);
  }
}
for (const [name, slug] of index.sectors) {
  add({ name, kind: "sector", sector: name, district: districtNameBySlug[slug] ?? slug });
}
for (const [name, sectorIndex] of index.cells) {
  const [sectorName, slug] = index.sectors[sectorIndex] ?? ["", ""];
  add({ name, kind: "cell", sector: sectorName, district: districtNameBySlug[slug] ?? slug });
}
for (const [name, cellIndex] of index.villages) {
  const [, sectorIndex] = index.cells[cellIndex] ?? ["", 0];
  const [sectorName, slug] = index.sectors[sectorIndex] ?? ["", ""];
  add({ name, kind: "village", sector: sectorName, district: districtNameBySlug[slug] ?? slug });
}

/** A one-line context note naming the sector and district of any place found in the text, or null when none match. */
export function resolvePlaces(text: string): string | null {
  const words = Array.from(
    new Set(
      fold(text)
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length >= 4 && !STOP.has(word)),
    ),
  );
  const notes: string[] = [];
  for (const word of words) {
    const hits = LOOKUP.get(word);
    if (!hits) continue;
    const shown = hits.slice(0, 4).map((hit) => `${hit.name} (${hit.kind}) is in ${hit.sector} sector, ${hit.district} district`);
    notes.push(shown.join("; "));
    if (notes.length >= 3) break;
  }
  return notes.length ? notes.join(". ") : null;
}
