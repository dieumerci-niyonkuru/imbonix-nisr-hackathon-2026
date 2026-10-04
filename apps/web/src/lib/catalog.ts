import catalogJson from "@/data/generated/catalog.json";

/**
 * The NISR microdata catalogue (NADA), as indexed by scripts/data/index_nada_catalog.py and built into
 * catalog.json by build_web_data.py: one entry per study, from the 1978 census to the latest surveys.
 */
export type CatalogStudy = {
  id: string;
  title: string;
  year: number;
  producer: string;
  /** "Public use", "External repository" or "No microdata". */
  access: string;
  /** Number of variables in the study, when the catalogue reports it. */
  variables: number | null;
  theme: string;
  /** Whether IMBONIX draws on this study for its figures. */
  used: boolean;
  /** How IMBONIX uses it, for the studies it draws on. */
  note: string;
  /** The study's page in the NISR microdata catalogue. */
  url: string;
};

const CATALOG = catalogJson as unknown as { studies: CatalogStudy[]; themes: string[]; used: number };

export const CATALOG_STUDIES: CatalogStudy[] = CATALOG.studies;
export const CATALOG_THEMES: string[] = CATALOG.themes;
/** How many studies IMBONIX draws on. */
export const CATALOG_USED: number = CATALOG.used;

/** The first and last year the catalogue covers. */
export const CATALOG_YEARS: [number, number] = [
  Math.min(...CATALOG_STUDIES.map((study) => study.year)),
  Math.max(...CATALOG_STUDIES.map((study) => study.year)),
];
