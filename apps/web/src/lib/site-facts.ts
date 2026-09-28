import { DISTRICTS, SOURCES } from "@/lib/data";
import { LEVERS } from "@/lib/priorities";
import { sectorsOf } from "@/lib/sectors";

/** Counts that describe the whole site, worked out from the data so they stay true when the data changes. */
export const SITE_FACTS = {
  districts: DISTRICTS.length,
  sectors: DISTRICTS.reduce((count, district) => count + sectorsOf(district.name).length, 0),
  indicators: Object.keys(SOURCES).length,
  publications: new Set(Object.values(SOURCES).map((source) => source.source)).size,
  levers: LEVERS.length,
};
