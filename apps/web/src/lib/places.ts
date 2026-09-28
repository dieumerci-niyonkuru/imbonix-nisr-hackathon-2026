/**
 * Rwanda's sectors, cells and villages, for search. The place index (scripts/data/build_place_index.py) is served by
 * /api/search-index and fetched once per visit, the first time a search needs it, so the 14,815 villages are not part
 * of every page. NISR publishes poverty estimates down to the sector, so a cell or village is shown with the figures of
 * the sector it lies in.
 */

/** Sectors as [name, district slug], cells as [name, sector index], villages as [name, cell index]. */
export type PlaceIndex = {
  sectors: [string, string][];
  cells: [string, number][];
  villages: [string, number][];
};

export type PlaceKind = "sector" | "cell" | "village";

export type Place = {
  key: string;
  kind: PlaceKind;
  name: string;
  districtSlug: string;
  districtName: string;
  sector: string;
  cell?: string;
  /** The name folded once, so matching thousands of places stays quick. */
  folded: string;
  /** The units the place lies in, and its kind in English and Kinyarwanda, folded: they narrow a search down. */
  terms: string;
};

/** Lower case without accents, so a query matches however it is typed. */
export const foldText = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const PLACE_KIND_LABEL: Record<PlaceKind, string> = { sector: "Sector", cell: "Cell", village: "Village" };

let placeIndexRequest: Promise<PlaceIndex> | undefined;

/** The place index, fetched once and shared by every search on the page. A failed request can be tried again. */
export function loadPlaceIndex(): Promise<PlaceIndex> {
  placeIndexRequest ??= fetch("/api/search-index")
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
    .catch((error: unknown) => {
      placeIndexRequest = undefined;
      throw error;
    });
  return placeIndexRequest;
}

/** Every sector, cell and village as a searchable place. */
export function listPlaces(index: PlaceIndex, districtNameBySlug: Record<string, string>): Place[] {
  const districtName = (slug: string) => districtNameBySlug[slug] ?? slug;
  const sectors = index.sectors.map(([name, districtSlug], sectorIndex): Place => ({
    key: `sector:${sectorIndex}`,
    kind: "sector",
    name,
    districtSlug,
    districtName: districtName(districtSlug),
    sector: name,
    folded: foldText(name),
    terms: foldText(`${districtName(districtSlug)} sector umurenge`),
  }));
  const cells = index.cells.map(([name, sectorIndex], cellIndex): Place => {
    const [sectorName, districtSlug] = index.sectors[sectorIndex];
    return {
      key: `cell:${cellIndex}`,
      kind: "cell",
      name,
      districtSlug,
      districtName: districtName(districtSlug),
      sector: sectorName,
      folded: foldText(name),
      terms: foldText(`${sectorName} ${districtName(districtSlug)} cell akagari`),
    };
  });
  const villages = index.villages.map(([name, cellIndex], villageIndex): Place => {
    const [cellName, sectorIndex] = index.cells[cellIndex];
    const [sectorName, districtSlug] = index.sectors[sectorIndex];
    return {
      key: `village:${villageIndex}`,
      kind: "village",
      name,
      districtSlug,
      districtName: districtName(districtSlug),
      sector: sectorName,
      cell: cellName,
      folded: foldText(name),
      terms: foldText(`${cellName} ${sectorName} ${districtName(districtSlug)} village umudugudu`),
    };
  });
  return [...sectors, ...cells, ...villages];
}

/**
 * How well a place matches: lower is better, undefined is no match. Every word must appear in the name or in the units
 * it lies in, and at least one in the name itself, so "Kagarama Kicukiro" finds Kagarama in Kicukiro but "Kicukiro"
 * alone does not list every village there.
 */
export function placeMatchScore(place: Pick<Place, "folded" | "terms">, query: string, words: string[]): number | undefined {
  if (!words.every((word) => place.folded.includes(word) || place.terms.includes(word))) return undefined;
  if (!words.some((word) => place.folded.includes(word))) return undefined;
  if (place.folded.startsWith(query)) return 0;
  if (place.folded.split(/[\s(/-]+/).some((part) => part.startsWith(words[0]))) return 1;
  return place.folded.includes(words[0]) ? 2 : 3;
}

/** A one line address: "Kanserege cell, Kicukiro sector, Kicukiro district" for a village. */
export function placeAddress(place: Place): string {
  if (place.kind === "sector") return `${place.districtName} district`;
  if (place.kind === "cell") return `${place.sector} sector, ${place.districtName} district`;
  return `${place.cell} cell, ${place.sector} sector, ${place.districtName} district`;
}

/** The district page, scrolled to its sectors with this place's sector selected. */
export function placeHref(place: Place): string {
  const params = new URLSearchParams({ sector: place.sector });
  if (place.kind === "cell") params.set("cell", place.name);
  if (place.kind === "village") {
    params.set("cell", place.cell ?? "");
    params.set("village", place.name);
  }
  return `/districts/${place.districtSlug}?${params.toString()}#sectors`;
}
