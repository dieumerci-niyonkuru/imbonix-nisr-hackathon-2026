import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { HowToRead } from "@/components/ui/chart-card";

/**
 * One large data insight: the finding as the heading, a short explanation and a line on how to read the chart on
 * the left, the chart itself on the right, and a link to the full evidence.
 */
export function FeaturedInsight({
  title,
  body,
  howToRead,
  href,
  linkLabel,
  chart,
}: {
  title: string;
  body: string;
  howToRead: string;
  href: string;
  linkLabel: string;
  chart: ReactNode;
}) {
  return (
    <section className="bg-paper py-16 sm:py-24" aria-labelledby="featured-heading">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <p className="eyebrow text-cyan-ink">Featured insight</p>
          <h2
            id="featured-heading"
            className="mt-3 text-balance font-display text-3xl font-bold leading-[1.12] tracking-[-0.03em] text-ink sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-5 text-pretty text-[16px] leading-8 text-ink/80 sm:text-[17px]">{body}</p>
          <HowToRead className="mt-4 text-[14px] leading-6">{howToRead}</HowToRead>
          <Link
            href={href}
            className="group mt-7 inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
          >
            {linkLabel}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        {chart}
      </div>
    </section>
  );
}
