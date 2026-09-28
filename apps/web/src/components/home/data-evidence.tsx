import Link from "next/link";
import { ArrowRightIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { NISR_CATALOG_URL, SOURCE_STUDIES } from "@/components/layout/nav";
import { StatTile } from "@/components/ui/stat-tile";
import { SectionHeader } from "@/components/ui/section";
import { SOURCES } from "@/lib/data";
import { meta, type Dimension } from "@/lib/indicators";

export type KeyFigure = { value: string; label: string; source: string; accent: string };

type EvidenceTheme = {
  name: string;
  description: string;
  /** The indicator dimensions the theme counts. None means national tables only. */
  dimensions: Dimension[];
  /** Studies that are not district indicators, such as national tables or open maps. */
  otherSources?: string[];
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
  },
  {
    name: "Population and open maps",
    description: "Population by district and its projections, with open boundary and street maps.",
    dimensions: ["people"],
    otherSources: ["geoBoundaries", "OpenStreetMap"],
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
  return { count: ids.length, studies: [...studies] };
}

/**
 * Data and evidence: four headline figures across the three focus areas, the themes the indicators cover with the
 * studies behind each, and the NISR studies themselves, linked to the microdata catalog.
 */
export function DataEvidence({
  figures,
  indicatorCount,
  districtCount,
  sectorCount,
}: {
  figures: KeyFigure[];
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
          intro={`${indicatorCount} indicators for all ${districtCount} districts and ${sectorCount} sectors, each transcribed from a named table and labelled with how far to trust it. Four of them, across the three focus areas:`}
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {figures.map((figure) => (
            <li key={figure.label}>
              <StatTile value={figure.value} label={figure.label} source={figure.source} accent={figure.accent} />
            </li>
          ))}
        </ul>

        <h3 className="mt-16 font-display text-xl font-bold tracking-[-0.01em] text-ink">What the evidence covers</h3>
        <ul className="mt-5 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {THEMES.map((theme) => {
            const { count, studies } = themeEvidence(theme);
            return (
              <li key={theme.name} className="flex flex-col bg-white p-6">
                <p className="font-display text-[18px] font-bold text-ink">{theme.name}</p>
                <p className="mt-1 text-[13px] font-bold uppercase tracking-[0.08em] text-royal">
                  {count ? `${count} district indicators` : "National tables"}
                </p>
                <p className="mt-3 text-pretty text-[14.5px] leading-6 text-muted">{theme.description}</p>
                <p className="mt-auto pt-4 text-[12.5px] leading-5 text-ink/70">
                  <span className="font-semibold text-ink">Sources: </span>
                  {studies.join(", ")}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
            <p className="shrink-0 text-[12px] font-bold uppercase tracking-[0.14em] text-muted">NISR studies</p>
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
          <Link
            href="/data"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded text-[15px] font-bold text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
          >
            See every source and method
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
