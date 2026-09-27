import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, CheckBadgeIcon } from "@heroicons/react/20/solid";
import { HeroRings } from "@/components/ui/section";
import { StatTile } from "@/components/ui/stat-tile";

export type HeroFigure = { value: string; label: string; source: string; status?: string; accent: string };

const PRIMARY_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-xl bg-cyan px-5 text-[15px] font-bold text-navy-900 transition-colors hover:bg-cyan-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900";
const SECONDARY_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-xl px-5 text-[15px] font-bold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/**
 * The opening of the homepage: the Track 2 question and IMBONIX's answer beside one chart that shows the gap, then four
 * key figures across the three parts of the challenge, each with its source.
 */
export function HomeHero({
  figures,
  chart,
  districtCount,
  sectorCount,
}: {
  figures: HeroFigure[];
  chart: ReactNode;
  districtCount: number;
  sectorCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <HeroRings className="-right-40 -top-48 text-white/10" />
      <div className="container-page relative grid items-center gap-12 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pt-20">
        <div>
          <p className="eyebrow text-cyan">NISR Big Data Hackathon 2026 · Track 2</p>
          <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-5xl xl:text-[3.5rem]">
            Almost every adult is included. Few are financially healthy.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            IMBONIX brings NISR&apos;s published statistics together for all {districtCount} districts and {sectorCount} sectors,
            to show where financial exclusion, poverty and gaps in social protection overlap, and which policy levers the evidence
            points to.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {/* A plain anchor: the homepage tabs follow the hash, so this opens the first part of the challenge below. */}
            <a href="#exclusion" className={PRIMARY_BUTTON}>
              Explore the evidence
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link href="/map" className={SECONDARY_BUTTON}>
              Open the resilience map
            </Link>
          </div>
          <ul className="mt-8 grid gap-2.5 text-[13.5px] text-white/75 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
              Every figure names its NISR source and table
            </li>
            <li className="flex items-start gap-2">
              <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
              Independent project, not an official NISR product
            </li>
          </ul>
        </div>

        {chart}
      </div>

      <div className="container-page relative pb-14 pt-12 sm:pb-16">
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
