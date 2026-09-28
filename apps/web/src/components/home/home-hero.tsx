import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { HeroRings } from "@/components/ui/section";

const PRIMARY_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-xl bg-cyan px-5 text-[15px] font-bold text-navy-900 transition-colors hover:bg-cyan-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900";
const SECONDARY_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-xl px-5 text-[15px] font-bold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/**
 * The opening of the homepage, kept short: a confident headline, one sentence on what IMBONIX does, a way into the
 * data and a way into the evidence. On the right, the gap in one chart.
 */
export function HomeHero({
  chart,
  districtCount,
  sectorCount,
}: {
  chart: ReactNode;
  districtCount: number;
  sectorCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <HeroRings className="-right-40 -top-48 text-white/10" />
      <div className="container-page relative grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-20">
        <div>
          <p className="eyebrow text-balance text-cyan">Financial inclusion and poverty reduction in Rwanda</p>
          <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-5xl xl:text-[3.4rem]">
            Almost every adult is included. Few are financially healthy.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            IMBONIX brings NISR&apos;s published statistics together for all {districtCount} districts and {sectorCount} sectors,
            to show where financial exclusion, poverty and gaps in social protection meet, and where to act first.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/map" className={PRIMARY_BUTTON}>
              Explore the data
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#research" className={SECONDARY_BUTTON}>
              Read the evidence
            </a>
          </div>
          <p className="mt-5 text-[12.5px] text-white/60">
            An independent project, not an official NISR product. Every figure names its source and table.
          </p>
        </div>

        {chart}
      </div>
    </section>
  );
}
