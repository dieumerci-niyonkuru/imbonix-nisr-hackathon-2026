import type { Metadata } from "next";
import { DataCatalog } from "@/components/data/data-catalog";
import { PageHero } from "@/components/ui/section";
import { CATALOG_STUDIES, CATALOG_USED } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Data catalog",
  description:
    "Every NISR survey and census in the microdata catalogue, from the 1978 census to today, searchable by theme, with the ones IMBONIX uses marked.",
};

/** The full NISR microdata catalogue, browsable by decade and theme, with the studies IMBONIX draws on highlighted. */
export default function DataCatalogPage() {
  return (
    <>
      <PageHero
        eyebrow="Data"
        title="The NISR data catalogue, 1978 to today"
        intro={`All ${CATALOG_STUDIES.length} studies in Rwanda's microdata catalogue, from the 1978 census to the latest surveys. IMBONIX draws on ${CATALOG_USED} of them for its figures; the rest show the depth of the record behind the platform. Each study links to its page in the catalogue. The microdata files themselves need a free NADA account; IMBONIX works from the published tables and the public variable dictionaries.`}
      />
      <DataCatalog />
    </>
  );
}
