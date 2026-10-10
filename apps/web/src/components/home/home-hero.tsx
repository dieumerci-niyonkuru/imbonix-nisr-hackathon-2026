import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { HeroBackdrop } from "@/components/home/hero-backdrop";
import { DistrictBackdrop } from "@/components/home/story-cards";
import { RwandaEmblem } from "@/components/layout/rwanda-emblem";

/** One of the doors under the banner: a focus area or a tool, in a sentence. */
export type HeroCard = { title: string; body: string; href: string };

/** The hero background photo (in public/hero/), or null to use the cyan data-network backdrop instead. */
const HERO_PHOTO: string | null = "/hero/hero-team.png";

/**
 * The opening of the homepage, laid out like Rwanda's national sites in the site's two colours: a cyan banner with the
 * outline of the districts behind a left aligned headline, four white cards that overlap its lower edge and open the
 * focus areas and the planning tool, and under them, on white, the challenge IMBONIX answers and a way to learn more.
 */
export function HomeHero({
  cards,
  districtCount,
  sectorCount,
}: {
  cards: HeroCard[];
  districtCount: number;
  sectorCount: number;
}) {
  return (
    <section aria-labelledby="home-heading">
      {/* The banner slides up behind the header (which is transparent over it at the top), so the photo is one image
          across the whole top; the content keeps clear of the header with the extra top padding below. */}
      <div className={`relative -mt-[141px] overflow-hidden bg-cyan ${HERO_PHOTO ? "text-white" : "text-ink"}`}>
        {HERO_PHOTO ? (
          <>
            {/* The team photo in its own colours, filling the banner. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-cover bg-[position:60%_center]"
              style={{ backgroundImage: `url(${HERO_PHOTO})` }}
            />
            {/* A flat, even dark overlay (no gradient, no colour cast) so the white headline and tagline stay readable
                while the team photo shows through behind them. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink/55" />
          </>
        ) : (
          <>
            {/* A data-network over the flat brand-cyan banner; the map shows on narrow screens. */}
            <HeroBackdrop />
            <div className="xl:hidden">
              <DistrictBackdrop />
            </div>
          </>
        )}
        <div className="container-page relative pb-40 pt-[205px] sm:pb-44 sm:pt-[237px]">
          {!HERO_PHOTO && <RwandaEmblem tone="cyan" className="absolute right-10 top-14 hidden w-[25rem] xl:block" />}
          <p className="font-display text-[18px] font-bold sm:text-[22px]">Financial inclusion &amp; poverty reduction in Rwanda</p>
          <h1
            id="home-heading"
            className="mt-3 max-w-4xl text-balance font-display text-[2.5rem] font-bold leading-[1.05] tracking-[-0.035em] sm:text-6xl lg:text-7xl xl:max-w-[46rem]"
          >
            Almost every adult is included. Few are financially healthy.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-[17px] leading-8 sm:text-[19px] sm:leading-9">
            IMBONIX brings NISR&apos;s published statistics together for all {districtCount} districts and {sectorCount} sectors,
            to show where financial exclusion, poverty and gaps in social protection meet, and where to act first.
          </p>
          <p className="mt-5 text-[13px] font-medium">
            An independent project built on NISR data, not an official NISR product. Every figure names its source.
          </p>
        </div>
      </div>

      <div className="bg-white pb-16 sm:pb-20">
        <div className="container-page relative -mt-28">
          <ul className="grid gap-px bg-line shadow-lift ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <li key={card.href} className="bg-white">
                <Link
                  href={card.href}
                  className="group flex h-full flex-col p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-ink sm:p-8"
                >
                  <h2 className="font-display text-[24px] font-bold leading-tight tracking-[-0.015em] text-cyan-ink sm:text-[26px]">
                    {card.title}
                  </h2>
                  <p className="mt-4 text-pretty text-[16px] leading-7 text-ink/85">{card.body}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-bold text-ink group-hover:text-cyan-ink">
                    Open
                    <span className="sr-only"> {card.title}</span>
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="container-page mt-14 text-center text-ink sm:mt-16">
          <p className="font-display text-[26px] font-bold tracking-[-0.02em] sm:text-[32px]">The challenge</p>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-[17px] leading-8 sm:text-[19px] sm:leading-9">
            Use data to understand financial exclusion, poverty dynamics and the impact of social protection programmes in Rwanda,
            so that support reaches vulnerable households and decisions rest on evidence.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded bg-cyan px-10 text-[15px] font-bold text-ink transition-colors hover:bg-cyan-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink focus-visible:ring-offset-2"
          >
            Learn more about IMBONIX
          </Link>
        </div>
      </div>
    </section>
  );
}
