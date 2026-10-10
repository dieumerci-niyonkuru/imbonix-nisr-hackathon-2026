import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { RwandaMap } from "@/components/map/rwanda-map";
import { DISTRICTS, valueOf } from "@/lib/data";
import { RAMPS, WHITE } from "@/lib/palette";

export type ChallengePart = {
  area: string;
  /** The finding, with its figure, as the card title. */
  title: string;
  /** One or two sentences on what the focus area page shows. */
  summary: string;
  source: string;
  /** The district measure drawn as the card's picture, with its caption. */
  indicatorId: string;
  caption: string;
  ramp: keyof typeof RAMPS;
  href: string;
};

/**
 * District fills for a map on a pale background: five classes by rank, from the ramp's lightest step to its darkest,
 * so the districts with the highest values are darkest. Districts without a value take the lightest step.
 */
function fillsByRank(indicatorId: string, ramp: readonly string[]): Record<string, string> {
  const ranked = DISTRICTS.map((district) => ({ slug: district.slug, value: valueOf(district, indicatorId) }))
    .filter((row): row is { slug: string; value: number } => row.value !== undefined)
    .sort((first, second) => first.value - second.value);
  const fills: Record<string, string> = Object.fromEntries(DISTRICTS.map((district) => [district.slug, ramp[0]]));
  ranked.forEach((row, index) => {
    fills[row.slug] = ramp[Math.min(ramp.length - 1, Math.floor((index * ramp.length) / ranked.length))];
  });
  return fills;
}

/**
 * The three focus areas as article cards, in the manner of a news listing: a district map as the picture, the focus
 * area, the finding as the title, its source and a short summary, and a link to the page with the full evidence.
 */
export function ChallengeSection({ parts }: { parts: ChallengePart[] }) {
  return (
    <section id="research" className="scroll-mt-24 bg-white py-12 sm:py-20" aria-labelledby="challenge-heading">
      <div className="container-page">
        <p className="eyebrow text-cyan-ink">Research and insights</p>
        <h2
          id="challenge-heading"
          className="mt-3 max-w-3xl text-balance font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl"
        >
          Three questions, answered with NISR data
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px] sm:leading-8">
          Each focus area has its own page with the full evidence: the charts, what each one shows, where the figures come from
          and how far to trust them.
        </p>

        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {parts.map((part) => (
            <li key={part.area}>
              <article className="group relative flex h-full flex-col">
                <div className="bg-mist px-10 py-7 transition-colors group-hover:bg-mist-strong">
                  <RwandaMap fills={fillsByRank(part.indicatorId, RAMPS[part.ramp])} title={part.caption} stroke={WHITE} />
                </div>
                <p className="mt-5 text-[13px] font-semibold text-muted">{part.area}</p>
                <h3 className="mt-2 text-balance text-[17px] font-bold uppercase leading-snug tracking-[0.01em] text-ink">
                  {part.title}
                </h3>
                <p className="mt-2 text-[13px] text-muted">{part.source}</p>
                <p className="mt-4 text-pretty text-[15.5px] leading-7 text-ink/80">{part.summary}</p>
                <Link
                  href={part.href}
                  className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[15px] font-bold text-ink after:absolute after:inset-0 hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                >
                  Read more
                  <span className="sr-only">: {part.area}</span>
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <Link
            href="/data/key-figures"
            className="inline-flex min-h-12 items-center justify-center rounded bg-cyan px-10 text-[15px] font-bold text-ink transition-colors hover:bg-cyan-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink focus-visible:ring-offset-2"
          >
            See the key figures
          </Link>
        </div>
      </div>
    </section>
  );
}
