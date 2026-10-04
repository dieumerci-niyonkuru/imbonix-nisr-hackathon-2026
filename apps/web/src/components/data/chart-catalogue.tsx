"use client";

import Link from "next/link";
import { useId, useMemo, useState, type ComponentType, type SVGProps } from "react";
import {
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  MagnifyingGlassIcon,
  MapIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import type { ChartEntry } from "@/lib/chart-index";
import { kindOf, KIND_ORDER, type ChartKind } from "@/lib/chart-kinds";
import { cn } from "@/lib/utils";

/** The charts of one page, under the page's name. */
export type CataloguePage = { href: string; label: string; charts: ChartEntry[] };
/** One menu of the site (a focus area, or the data) with its pages that have charts. */
export type CatalogueSection = { id: string; label: string; intro: string; pages: CataloguePage[] };

type KindInfo = { label: string; chip: string; icon: ComponentType<SVGProps<SVGSVGElement>> };
const KINDS: Record<ChartKind, KindInfo> = {
  trend: { label: "Over time", chip: "Trends", icon: ArrowTrendingUpIcon },
  ranking: { label: "Ranking or share", chip: "Rankings", icon: ChartBarIcon },
  comparison: { label: "Comparison", chip: "Comparisons", icon: ArrowsRightLeftIcon },
  relationship: { label: "Relationship", chip: "Relationships", icon: Squares2X2Icon },
  map: { label: "Map", chip: "Maps", icon: MapIcon },
};

const matchText = (chart: ChartEntry, page: CataloguePage) => `${chart.title} ${chart.about} ${page.label}`.toLowerCase();

/** A rounded chip, filled when it is the active filter. */
function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      disabled={count === 0 && !active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-40",
        active ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/15 hover:ring-ink/40",
      )}
    >
      {children}
      <span className={cn("tabular text-[12px] font-bold", active ? "text-white/80" : "text-muted")}>{count}</span>
    </button>
  );
}

/** One chart as a row of a page's card: a type icon, its name, an interactive tag and what it shows. */
function ChartRow({ chart, page }: { chart: ChartEntry; page: CataloguePage }) {
  const kind = KINDS[kindOf(chart)];
  const Icon = kind.icon;
  return (
    <li>
      <Link
        href={`${page.href}#${chart.id}`}
        className="group flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
      >
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cyan-soft text-cyan-ink ring-1 ring-cyan/30"
          title={kind.label}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[14.5px] font-bold leading-5 text-ink group-hover:text-cyan-ink">{chart.title}</span>
            {chart.interactive && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.07em] text-cyan-ink">
                <CursorArrowRaysIcon className="h-3 w-3" aria-hidden="true" />
                Interactive
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-[13px] leading-5 text-muted">{chart.about}</span>
        </span>
        <ArrowRightIcon
          className="mt-2 h-4 w-4 shrink-0 text-line transition-all group-hover:translate-x-0.5 group-hover:text-cyan-ink"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

/**
 * Every chart on the site, as a directory like a government service portal: a filter by words and by the shape of
 * the chart, then one block per focus area, and within it a card per page holding its charts, each with a type icon.
 * Choosing a chart opens it at its place on its page.
 */
export function ChartCatalogue({ sections, total }: { sections: CatalogueSection[]; total: number }) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ChartKind | "interactive" | null>(null);

  // Count every chart by kind and the interactive ones, for the chips, before any filter.
  const counts = useMemo(() => {
    const all = sections.flatMap((section) => section.pages.flatMap((page) => page.charts));
    const byKind = Object.fromEntries(KIND_ORDER.map((key) => [key, 0])) as Record<ChartKind, number>;
    let interactive = 0;
    for (const chart of all) {
      byKind[kindOf(chart)] += 1;
      if (chart.interactive) interactive += 1;
    }
    return { byKind, interactive };
  }, [sections]);

  const filtered = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const keep = (chart: ChartEntry, page: CataloguePage) =>
      words.every((word) => matchText(chart, page).includes(word)) &&
      (kind === null || (kind === "interactive" ? chart.interactive : kindOf(chart) === kind));
    return sections
      .map((section) => ({
        ...section,
        pages: section.pages
          .map((page) => ({ ...page, charts: page.charts.filter((chart) => keep(chart, page)) }))
          .filter((page) => page.charts.length > 0),
      }))
      .filter((section) => section.pages.length > 0);
  }, [sections, query, kind]);

  const sectionCount = (section: CatalogueSection) => section.pages.reduce((sum, page) => sum + page.charts.length, 0);
  const shown = filtered.reduce((sum, section) => sum + sectionCount(section), 0);
  const active = Boolean(query) || kind !== null;

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
                aria-label="Clear the search"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Filter by the shape of the chart. "All" clears the kind filter. */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FilterChip active={kind === null} onClick={() => setKind(null)} count={total}>
              All
            </FilterChip>
            {KIND_ORDER.map((key) => (
              <FilterChip key={key} active={kind === key} onClick={() => setKind(key)} count={counts.byKind[key]}>
                {KINDS[key].chip}
              </FilterChip>
            ))}
            <FilterChip active={kind === "interactive"} onClick={() => setKind("interactive")} count={counts.interactive}>
              Interactive
            </FilterChip>
          </div>

          <p className="mt-4 text-[14px] font-semibold text-ink" aria-live="polite">
            {active ? `${shown} of ${total} charts shown` : `${total} charts and interactive tools`}
          </p>
        </div>
      </div>

      <div className="container-page py-12 sm:py-16">
        {filtered.length === 0 ? (
          <div className="max-w-2xl rounded-xl border border-line bg-white px-6 py-8">
            <p className="text-[16px] font-bold text-ink">No chart matches.</p>
            <p className="mt-1 text-[14.5px] leading-7 text-muted">
              Try a shorter word or a different shape, or search places and indicators from the bar at the top of the page.
            </p>
            {active && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setKind(null);
                }}
                className="mt-4 inline-flex h-10 items-center rounded-md bg-ink px-4 text-[14px] font-semibold text-white hover:bg-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-14">
            {filtered.map((section) => (
              <section key={section.id} aria-labelledby={`catalogue-${section.id}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-4">
                  <h2
                    id={`catalogue-${section.id}`}
                    className="font-display text-[24px] font-bold tracking-[-0.02em] text-ink sm:text-[28px]"
                  >
                    {section.label}
                  </h2>
                  <p className="text-[13px] font-semibold text-muted">
                    {sectionCount(section)} {sectionCount(section) === 1 ? "chart" : "charts"}
                  </p>
                </div>
                <p className="mt-2 max-w-3xl text-[15px] leading-7 text-muted">{section.intro}</p>
                <div className="mt-6 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {section.pages.map((page) => (
                    <div key={page.href} className="rounded-xl border border-line bg-white p-4 sm:p-5">
                      <Link
                        href={page.href}
                        className="group flex items-start justify-between gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                      >
                        <span className="min-w-0">
                          <span className="block text-[15.5px] font-bold text-ink group-hover:text-cyan-ink">{page.label}</span>
                          <span className="mt-0.5 block truncate font-mono text-[11.5px] text-muted">{page.href}</span>
                        </span>
                        <ArrowRightIcon
                          className="mt-1 h-4 w-4 shrink-0 text-cyan-ink transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                      <ul className="mt-3 space-y-1 border-t border-line pt-2">
                        {page.charts.map((chart) => (
                          <ChartRow key={chart.id} chart={chart} page={page} />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
