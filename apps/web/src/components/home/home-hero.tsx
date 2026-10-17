import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { HeroBackdrop } from "@/components/home/hero-backdrop";
import { DistrictBackdrop } from "@/components/home/story-cards";
import { RwandaEmblem } from "@/components/layout/rwanda-emblem";

/** One of the doors under the banner: a focus area or a tool, in a sentence. */
export type HeroCard = { title: string; body: string; href: string };

/**
 * The hero background photo (in public/hero/): a Rwandan analyst reading a district map of Rwanda on a data dashboard,
 * with Kigali's hills behind — the challenge (where need sits), the solution (evidence into decisions) and the data in
 * one frame. Shown under a brand scrim so the white headline stays readable (the darker left keeps clear of the
 * subject). Alternative in the folder: "/hero/hero-market.jpg" (a market vendor taking a mobile-money payment). Set to
 * null to use the designed brand banner instead (data-network over brand cyan with the Rwanda emblem), no photo.
 */
const HERO_PHOTO: string | null = "/hero/hero-analyst.jpg";

/** What IMBONIX gives you, in three lines, under "Get to know IMBONIX" — the solution, plainly. */
const SOLUTIONS = [
  {
    title: "All the evidence, aligned",
    body: "FinScope, EICV7, DHS and the Census, brought together for every district and sector, each figure named to its source.",
  },
  {
    title: "Down to the village",
    body: "Search any district, sector, cell or village and read what the numbers mean for the people who live there.",
  },
  {
    title: "Ask IMBONIX AI",
    body: "Ask a question in plain language and get a grounded answer, with the follow-ups worth asking next.",
  },
];

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
      <div
        className={`relative -mt-[77px] overflow-hidden ${
          HERO_PHOTO ? "bg-gradient-to-br from-ink via-ink to-cyan-ink text-white" : "bg-cyan text-ink"
        }`}
      >
        {HERO_PHOTO ? (
          <>
            {/* The hero image, framed a little above centre so the people and the dashboards stay in view, on every
                screen (the brand gradient behind only shows if the image fails to load). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-cover bg-[position:50%_32%]"
              style={{ backgroundImage: `url(${HERO_PHOTO})` }}
            />
            {/* A professional scrim in the brand colours, not a flat grey wash: a left-weighted dark gradient keeps the
                white headline crisp while the photo stays visible on the right, and a cyan anchor fading up from the foot
                ties the banner to the cards that overlap its lower edge. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/25"
            />
            {/* On phones the text runs the full width over the photo, so an extra even wash keeps it readable there. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink/45 sm:hidden" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cyan-ink/50 via-transparent to-transparent"
            />
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
        <div className="container-page relative pb-40 pt-[123px] sm:pb-44 sm:pt-[147px]">
          {!HERO_PHOTO && <RwandaEmblem tone="cyan" className="absolute right-10 top-14 hidden w-[25rem] xl:block" />}
          <p
            className="hero-rise font-display text-[18px] font-bold sm:text-[22px]"
            style={{ "--rise-delay": "0ms" } as CSSProperties}
          >
            Financial inclusion &amp; poverty reduction in Rwanda
          </p>
          <h1
            id="home-heading"
            className="hero-rise mt-3 max-w-3xl text-pretty font-display text-[1.15rem] font-bold leading-[1.35] tracking-[-0.01em] sm:text-[1.4rem] sm:leading-[1.3] lg:text-[1.65rem] lg:leading-[1.28]"
            style={{ "--rise-delay": "90ms" } as CSSProperties}
          >
            Use data to understand financial exclusion, poverty dynamics and the impact of social protection programmes in Rwanda,
            so that support reaches vulnerable households and decisions rest on evidence.
          </h1>
          <p
            className="hero-rise mt-6 max-w-2xl text-pretty text-[16.5px] leading-7 sm:text-[18px] sm:leading-8"
            style={{ "--rise-delay": "190ms" } as CSSProperties}
          >
            Built on NISR&apos;s published statistics for all {districtCount} districts and {sectorCount} sectors — FinScope,
            EICV7, DHS and the Census — brought together in one place you can explore.
          </p>
          <p className="hero-rise mt-5 text-[13.5px] font-semibold" style={{ "--rise-delay": "290ms" } as CSSProperties}>
            An independent project built on NISR data, not an official NISR product. Every figure names its source.
          </p>
        </div>
      </div>

      <div className="bg-cyan-ink pb-16 text-white sm:pb-20">
        <div className="container-page relative -mt-28">
          <ul className="grid gap-px bg-line shadow-lift ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
              <li
                key={card.href}
                className="hero-rise bg-white"
                style={{ "--rise-delay": `${380 + index * 90}ms` } as CSSProperties}
              >
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

        <div className="container-page mt-14 text-white sm:mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-display text-[26px] font-bold tracking-[-0.02em] sm:text-[32px]">Get to know IMBONIX</p>
            <p className="mt-4 text-pretty text-[17px] leading-8 text-white/90 sm:text-[19px] sm:leading-9">
              IMBONIX turns Rwanda&apos;s official statistics into one explorable platform — so financial exclusion, poverty and
              gaps in social protection stop hiding in separate reports, and support can reach the households that need it most.
            </p>
          </div>
          <ul className="mx-auto mt-10 grid max-w-5xl gap-x-8 gap-y-7 text-left sm:grid-cols-3">
            {SOLUTIONS.map((item) => (
              <li key={item.title} className="border-t border-white/25 pt-4">
                <p className="font-display text-[17px] font-bold tracking-[-0.01em]">{item.title}</p>
                <p className="mt-1.5 text-[14px] leading-6 text-white">{item.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center justify-center rounded bg-white px-10 text-[15px] font-bold text-cyan-ink shadow-card transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-ink"
            >
              Learn more about IMBONIX
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
