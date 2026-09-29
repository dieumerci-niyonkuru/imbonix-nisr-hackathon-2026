"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowRightIcon, CursorArrowRaysIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import type { ChartEntry } from "@/lib/chart-index";

/** The charts of one page, under the page's name. */
export type CataloguePage = { href: string; label: string; charts: ChartEntry[] };
/** One menu of the site (a focus area, or the data) with its pages that have charts. */
export type CatalogueSection = { id: string; label: string; intro: string; pages: CataloguePage[] };

const matchText = (chart: ChartEntry, page: CataloguePage) => `${chart.title} ${chart.about} ${page.label}`.toLowerCase();

/**
 * Every chart on the site, as a directory: one heading per focus area, then each page's charts in columns with a rule
 * down their side, the way a government service portal lists its services. Typing in the filter keeps only the
 * charts whose name, description or page matches; each chart opens at its place on its page.
 */
export function ChartCatalogue({ sections, total }: { sections: CatalogueSection[]; total: number }) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return sections
      .map((section) => ({
        ...section,
        pages: section.pages
          .map((page) => ({
            ...page,
            charts: page.charts.filter((chart) => words.every((word) => matchText(chart, page).includes(word))),
          }))
          .filter((page) => page.charts.length > 0),
      }))
      .filter((section) => section.pages.length > 0);
  }, [sections, query]);
  const shown = filtered.reduce((sum, section) => sum + section.pages.reduce((count, page) => count + page.charts.length, 0), 0);

  return (
    <div>
      <div className="border-b border-line bg-cyan">
        <div className="container-page py-8 sm:py-10">
          <label htmlFor={inputId} className="block text-[15px] font-bold text-ink">
            Find a chart
          </label>
          <div className="relative mt-2 max-w-3xl">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink"
              aria-hidden="true"
            />
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try poverty, stunting, VUP, mobile money or a page name"
              autoComplete="off"
              className="h-14 w-full rounded-md bg-white pl-12 pr-12 text-[16px] text-ink shadow-card ring-1 ring-ink/10 placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear the filter"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="mt-3 text-[14px] font-semibold text-ink" aria-live="polite">
            {query ? `${shown} of ${total} charts match` : `${total} charts and interactive tools`}
          </p>
        </div>
      </div>

      <div className="container-page py-12 sm:py-16">
        {filtered.length === 0 && (
          <p className="max-w-2xl rounded-lg bg-paper px-5 py-4 text-[15px] leading-7 text-ink">
            No chart matches &ldquo;{query}&rdquo;. Try a shorter word, or search places and indicators from the bar at the top of
            the page.
          </p>
        )}
        <div className="grid gap-16">
          {filtered.map((section) => (
            <section key={section.id} aria-labelledby={`catalogue-${section.id}`}>
              <div className="border-b border-line pb-4">
                <h2
                  id={`catalogue-${section.id}`}
                  className="font-display text-[26px] font-bold tracking-[-0.02em] text-ink sm:text-[30px]"
                >
                  {section.label}
                </h2>
                <p className="mt-1 max-w-3xl text-[15px] leading-7 text-muted">{section.intro}</p>
              </div>
              <div className="mt-8 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                {section.pages.map((page) => (
                  <div key={page.href}>
                    <h3>
                      <Link
                        href={page.href}
                        className="group inline-flex items-center gap-1.5 rounded text-[16px] font-bold text-ink hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                      >
                        {page.label}
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </h3>
                    <p className="mt-0.5 font-mono text-[12px] text-muted">{page.href}</p>
                    <ul className="mt-4 space-y-4 border-l-2 border-line pl-4">
                      {page.charts.map((chart) => (
                        <li key={chart.id}>
                          <Link
                            href={`${page.href}#${chart.id}`}
                            className="group block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                          >
                            <span className="text-[15px] font-semibold leading-6 text-ink group-hover:text-cyan-ink group-hover:underline group-hover:underline-offset-4">
                              {chart.title}
                            </span>
                            {chart.interactive && (
                              <span className="ml-2 inline-flex items-center gap-1 whitespace-nowrap align-middle text-[11px] font-bold uppercase tracking-[0.07em] text-cyan-ink">
                                <CursorArrowRaysIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                Interactive
                              </span>
                            )}
                            <span className="mt-0.5 block text-[13.5px] leading-5 text-muted">{chart.about}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
