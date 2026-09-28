import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { NISR_CATALOG_URL, SOURCE_STUDIES } from "@/components/layout/nav";
import { HeroRings } from "@/components/ui/section";
import { StatTile } from "@/components/ui/stat-tile";

export type HeroFigure = { value: string; label: string; source: string; status?: string; accent: string };
/** One of the three things a solution to financial exclusion and poverty needs, and how IMBONIX meets it. */
export type ProofPoint = { criterion: string; evidence: ReactNode };

const PRIMARY_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-xl bg-cyan px-5 text-[15px] font-bold text-navy-900 transition-colors hover:bg-cyan-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900";
const SECONDARY_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-xl px-5 text-[15px] font-bold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/**
 * The opening of the homepage, written for a first visit. On the left, the headline, what IMBONIX does, and the three
 * things it stands on: a real gap, NISR data and practical impact. On the right, the gap in one chart. Below, the
 * NISR studies behind the figures and four key figures across the three focus areas, each with its source.
 */
export function HomeHero({
  figures,
  chart,
  proofPoints,
  districtCount,
  sectorCount,
}: {
  figures: HeroFigure[];
  chart: ReactNode;
  proofPoints: ProofPoint[];
  districtCount: number;
  sectorCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <HeroRings className="-right-40 -top-48 text-white/10" />
      <div className="container-page relative grid items-center gap-12 pt-12 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pt-14">
        <div>
          <p className="eyebrow text-balance text-cyan">Financial inclusion and poverty reduction in Rwanda</p>
          <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-5xl xl:text-[3.4rem]">
            Almost every adult is included. Few are financially healthy.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            IMBONIX brings NISR&apos;s published statistics together for all {districtCount} districts and {sectorCount} sectors,
            to show where financial exclusion, poverty and gaps in social protection overlap, and which policy levers the evidence
            points to.
          </p>

          <ul className="mt-8 grid gap-5 sm:grid-cols-3 sm:gap-4">
            {proofPoints.map((point) => (
              <li key={point.criterion} className="border-l-2 border-cyan pl-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cyan">{point.criterion}</p>
                <p className="mt-1.5 text-[13.5px] leading-5 text-white/85">{point.evidence}</p>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            {/* A plain anchor: the homepage tabs follow the hash, so this opens the first focus area below. */}
            <a href="#exclusion" className={PRIMARY_BUTTON}>
              Explore the evidence
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link href="/map" className={SECONDARY_BUTTON}>
              Open the district map
            </Link>
          </div>
          <p className="mt-5 text-[12.5px] text-white/60">
            An independent project, not an official NISR product. Every figure names its source and table.
          </p>
        </div>

        {chart}
      </div>

      <div className="container-page relative pt-12">
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:gap-5">
          <p className="shrink-0 text-[12px] font-bold uppercase tracking-[0.14em] text-white/70">The NISR studies behind it</p>
          <ul className="flex flex-wrap gap-2">
            {SOURCE_STUDIES.map((study) => (
              <li key={study.studyId}>
                <a
                  href={`${NISR_CATALOG_URL}/${study.studyId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1 text-[12.5px] font-semibold text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                >
                  {study.label}
                  <ArrowTopRightOnSquareIcon className="h-3 w-3 text-white/50" aria-hidden="true" />
                  <span className="sr-only">(study page in the NISR microdata catalog, opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-page relative pb-14 pt-8 sm:pb-16">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {figures.map((figure) => (
            <li key={figure.label}>
              <StatTile
                value={figure.value}
                label={figure.label}
                source={figure.source}
                status={figure.status}
                accent={figure.accent}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
