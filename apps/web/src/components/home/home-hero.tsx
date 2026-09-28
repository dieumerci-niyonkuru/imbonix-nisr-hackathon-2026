import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { DistrictBackdrop } from "@/components/home/story-cards";

/** One headline figure in the opening strip. */
export type HeroFigure = { value: string; label: string };

const PRIMARY_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-xl bg-cyan px-6 text-[15px] font-bold text-navy-900 transition-colors hover:bg-cyan-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";
const SECONDARY_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-xl px-6 text-[15px] font-bold text-white ring-1 ring-white/35 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/**
 * The opening of the homepage, set like a photo banner: a deep navy band with the outline of Rwanda's districts
 * behind a large centred headline, one sentence on what IMBONIX does, a way into the data and a way into the
 * evidence, then four headline figures with their sources.
 */
export function HomeHero({
  figures,
  sources,
  districtCount,
  sectorCount,
}: {
  figures: HeroFigure[];
  sources: string;
  districtCount: number;
  sectorCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <DistrictBackdrop />
      <div className="container-page relative pb-12 pt-20 text-center sm:pb-14 sm:pt-28">
        <p className="eyebrow text-balance text-cyan">Financial inclusion and poverty reduction in Rwanda</p>
        <h1 className="mx-auto mt-5 max-w-4xl text-balance font-display text-[2.6rem] font-bold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
          Almost every adult is included. Few are financially healthy.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-[17px] leading-8 text-white/85 sm:text-[19px] sm:leading-9">
          IMBONIX brings NISR&apos;s published statistics together for all {districtCount} districts and {sectorCount} sectors, to
          show where financial exclusion, poverty and gaps in social protection meet, and where to act first.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/map" className={PRIMARY_BUTTON}>
            Explore the data
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href="#research" className={SECONDARY_BUTTON}>
            Read the evidence
          </a>
        </div>
        <p className="mt-5 text-[12.5px] text-white/65">
          An independent project, not an official NISR product. Every figure names its source and table.
        </p>
      </div>

      <div className="container-page relative pb-14 sm:pb-16">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/15 lg:grid-cols-4">
          {figures.map((figure) => (
            <div key={figure.label} className="flex flex-col bg-navy-950/90 px-4 py-6 text-center sm:px-6 sm:py-7">
              <dt className="order-2 mt-2 text-pretty text-[13.5px] leading-5 text-white/80">{figure.label}</dt>
              <dd className="order-1 font-display text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
                {figure.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-center text-[12px] leading-5 text-white/65">Sources: {sources}</p>
      </div>
    </section>
  );
}
