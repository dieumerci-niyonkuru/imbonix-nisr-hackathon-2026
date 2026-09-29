import places from "@/data/generated/places.json";
import { DISTRICTS, SOURCES } from "@/lib/data";
import { LEVERS } from "@/lib/priorities";
import { sectorsOf } from "@/lib/sectors";

/** The label used for figures IMBONIX works out itself from several publications, rather than one. */
export const OWN_CALCULATION = "IMBONIX calculation";

/** Counts that describe the whole site, worked out from the data so they stay true when the data changes. */
export const SITE_FACTS = {
  districts: DISTRICTS.length,
  sectors: DISTRICTS.reduce((count, district) => count + sectorsOf(district.name).length, 0),
  /** Cells and villages in the place index that search covers (2012 administrative units). */
  cells: places.counts.cells,
  villages: places.counts.villages,
  indicators: Object.keys(SOURCES).length,
  /** Publications the figures come from, not counting IMBONIX's own calculations. */
  publications: new Set(
    Object.values(SOURCES)
      .map((source) => source.source)
      .filter((source) => source !== OWN_CALCULATION),
  ).size,
  /** Indicators that are IMBONIX arithmetic on published figures (status "calculated"), not a transcribed value. */
  calculated: Object.values(SOURCES).filter((source) => source.status === "calculated").length,
  levers: LEVERS.length,
};
