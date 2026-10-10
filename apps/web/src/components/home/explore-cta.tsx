import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

/**
 * A closing call to action: a solid cyan band inviting people to explore Rwanda's data, in the style of Rwanda's
 * national sites. A deep cyan is used (not the bright brand cyan) so the white heading, text and link clear 4.5:1.
 */
export function ExploreCta() {
  return (
    <section className="bg-cyan-ink py-16 text-center text-white sm:py-20" aria-labelledby="explore-heading">
      <div className="container-page">
        <h2 id="explore-heading" className="text-balance font-display text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
          Get to know Rwanda&apos;s data
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-[16px] leading-7 sm:text-[17px]">
          Financial inclusion, poverty and social protection for every district and sector — with the source and a trust label on
          every figure, and a clear next step on every page.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/districts"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-7 py-3 text-[15px] font-bold text-cyan-ink shadow-card transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-ink"
          >
            Explore the districts
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/data/key-figures"
            className="inline-flex items-center rounded-full px-5 py-3 text-[15px] font-bold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-ink"
          >
            See the key figures
          </Link>
        </div>
      </div>
    </section>
  );
}
