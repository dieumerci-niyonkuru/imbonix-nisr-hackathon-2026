import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { NISR_CATALOG_URL, SOURCE_STUDIES } from "@/components/layout/nav";
import { ReadMore, ReadMoreSection } from "@/components/ui/read-more";
import { SectionHeader } from "@/components/ui/section";
import { SOURCES } from "@/lib/data";
import { meta, type Dimension } from "@/lib/indicators";

type EvidenceTheme = {
  name: string;
  description: string;
  /** The indicator dimensions the theme counts. None means national tables only. */
  dimensions: Dimension[];
  /** Studies that are not district indicators, such as national tables or open maps. */
  otherSources?: string[];
  /** What else the theme draws on, shown in its Read more dialog. */
  details?: string;
};

const THEMES: EvidenceTheme[] = [
  {
    name: "Financial access",
    description: "Formal and informal services, bank accounts, pensions, phones and internet use.",
    dimensions: ["finance", "digital"],
  },
  {
    name: "Poverty",
    description: "Monetary and multidimensional poverty, housing, water, sanitation and energy.",
    dimensions: ["poverty"],
  },
  {
    name: "Household wellbeing",
    description: "Nutrition and food, natural hazards, work and earnings, and health cover.",
    dimensions: ["nutrition", "shocks", "work", "health"],
  },
  {
    name: "Social protection",
    description: "Who VUP reaches, who benefits, and how late payments arrive.",
    dimensions: [],
    otherSources: ["EICV7 VUP thematic report 2023/24"],
    details:
      "National tables from the EICV7 VUP thematic report: who VUP reaches by sex and poverty status, beneficiaries by programme, how late the last payment was (Tables 4.2, 4.5, 4.8 and 4.11), payment channels and amounts. VUP is not published by district.",
  },
  {
    name: "Population and open maps",
    description: "Population by district and its projections, with open boundary and street maps.",
    dimensions: ["people"],
    otherSources: ["geoBoundaries", "OpenStreetMap"],
    details:
      "District, sector, cell and village boundaries from geoBoundaries (Open Data Rwanda and the World Bank, CC BY 4.0), and the background map from OpenStreetMap contributors through OpenFreeMap.",
  },
];

/** Short study names, read from each indicator's published source. Calculations are left out: they are not studies. */
const STUDY_NAMES: [RegExp, string][] = [
  [/FinScope 2020/, "FinScope 2020"],
  [/FinScope 2024/, "FinScope 2024"],
  [/EICV7/, "EICV7 2023/24"],
  [/RPHC5/, "Census 2022"],
  [/DHS 2025/, "DHS 2025"],
  [/CFSVA 2024/, "CFSVA 2024"],
  [/LFS 2025/, "LFS 2025"],
  [/Establishment Census 2023/, "Establishment Census 2023"],
  [/Statistical Yearbook 2025/, "Statistical Yearbook 2025"],
  [/population projections/, "Population projections"],
];

function themeEvidence(theme: EvidenceTheme) {
  const ids = Object.keys(SOURCES).filter((id) => theme.dimensions.includes(meta(id).dimension));
  const studies = new Set<string>();
  for (const id of ids) {
    const match = STUDY_NAMES.find(([pattern]) => pattern.test(SOURCES[id].source));
    if (match) studies.add(match[1]);
  }
  theme.otherSources?.forEach((study) => studies.add(study));
  return { count: ids.length, studies: [...studies], ids };
}

/**
 * Data and evidence: the themes the indicators cover, with how many district indicators and which studies are behind
 * each, then the NISR studies themselves, linked to the microdata catalog.
 */
export function DataEvidence({
  indicatorCount,
  districtCount,
  sectorCount,
}: {
  indicatorCount: number;
  districtCount: number;
  sectorCount: number;
}) {
  return (
    <section className="bg-white py-16 sm:py-24" aria-labelledby="data-evidence-heading">
      <div className="container-page">
        <SectionHeader
          eyebrow="Data & evidence"
          title={<span id="data-evidence-heading">Built on NISR&apos;s published statistics</span>}
          intro={`${indicatorCount} indicators for all ${districtCount} districts and ${sectorCount} sectors, each transcribed from a named table and labelled with how far to trust it. This is what they cover.`}
        />

        <ul className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {THEMES.map((theme) => {
            const { count, studies, ids } = themeEvidence(theme);
            return (
              <li key={theme.name} className="flex flex-col bg-white p-6">
                <p className="font-display text-[18px] font-bold text-ink">{theme.name}</p>
                <p className="mt-1 text-[13.5px] font-bold text-royal">
                  {count ? `${count} district indicators` : "National tables"}
                </p>
                <p className="mt-3 text-pretty text-[14.5px] leading-6 text-muted">{theme.description}</p>
                <p className="mt-auto pt-4 text-[12.5px] leading-5 text-ink/70">
                  <span className="font-semibold text-ink">Sources: </span>
                  {studies.join(", ")}
                </p>
                <ReadMore
                  title={theme.name}
                  subtitle={count ? `${count} district indicators and where each comes from` : "National tables"}
                  className="mt-3"
                >
                  {ids.length > 0 && (
                    <ReadMoreSection title="The indicators">
                      <ul className="divide-y divide-line rounded-lg border border-line">
                        {ids.map((id) => (
                          <li key={id} className="px-4 py-2.5">
                            <p className="font-semibold text-ink">{meta(id).short}</p>
                            <p className="text-[13.5px] leading-5 text-muted">
                              {SOURCES[id].source}, {SOURCES[id].year}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </ReadMoreSection>
                  )}
                  {theme.details && <ReadMoreSection title="Also used">{theme.details}</ReadMoreSection>}
                </ReadMore>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
          <p className="shrink-0 text-[13px] font-bold text-muted">NISR studies</p>
          <ul className="flex flex-wrap gap-2">
            {SOURCE_STUDIES.map((study) => (
              <li key={study.studyId}>
                <a
                  href={`${NISR_CATALOG_URL}/${study.studyId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-[12.5px] font-semibold text-ink ring-1 ring-line transition-colors hover:bg-cyan-soft hover:text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
                >
                  {study.label}
                  <ArrowTopRightOnSquareIcon className="h-3 w-3 text-muted" aria-hidden="true" />
                  <span className="sr-only">(study page in the NISR microdata catalog, opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
