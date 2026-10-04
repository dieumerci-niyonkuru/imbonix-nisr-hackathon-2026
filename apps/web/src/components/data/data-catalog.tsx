"use client";

import { useId, useMemo, useState } from "react";
import { ArrowTopRightOnSquareIcon, CheckBadgeIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { CATALOG_STUDIES, CATALOG_THEMES, type CatalogStudy } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const DECADE_LABEL = (decade: number) => `${decade}s`;
const text = (study: CatalogStudy) => `${study.title} ${study.producer} ${study.theme} ${study.year}`.toLowerCase();

function Chip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
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

/** One study: its year, title, producer, theme, access and size, and how IMBONIX uses it if it does. */
function StudyCard({ study }: { study: CatalogStudy }) {
  return (
    <li
      className={cn(
        "grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 rounded-xl border bg-white p-4 sm:grid-cols-[4rem_minmax(0,1fr)] sm:p-5",
        study.used ? "border-cyan/40 ring-1 ring-cyan/20" : "border-line",
      )}
    >
      <span className="pt-0.5 text-right font-display text-[22px] font-bold leading-none tracking-[-0.02em] text-cyan-ink sm:text-[26px]">
        {study.year}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <h3 className="text-pretty text-[15.5px] font-bold leading-5 text-ink">{study.title}</h3>
          {study.used && (
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.06em] text-cyan-ink">
              <CheckBadgeIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Used by IMBONIX
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[13px] leading-5 text-muted">{study.producer}</p>
        <ul className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
          <li className="rounded bg-paper px-2 py-0.5 font-semibold text-ink/80">{study.theme}</li>
          <li aria-hidden="true">·</li>
          <li>{study.access}</li>
          {study.variables !== null && (
            <>
              <li aria-hidden="true">·</li>
              <li className="tabular">{study.variables.toLocaleString("en-US")} variables</li>
            </>
          )}
        </ul>
        {study.used && study.note && <p className="mt-2 text-[12.5px] leading-5 text-ink/75">{study.note}</p>}
        <a
          href={study.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 inline-flex items-center gap-1 rounded text-[13px] font-bold text-cyan-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
        >
          Open in the NISR catalogue
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </li>
  );
}

/**
 * The NISR microdata catalogue as a browsable directory: every study from 1978 to today, searchable and filtered by
 * theme or to the ones IMBONIX uses, grouped by decade so the depth of the record is clear. Each study links to its
 * page in the catalogue; the microdata itself needs a NADA account, which the note on the page explains.
 */
export function DataCatalog() {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const [usedOnly, setUsedOnly] = useState(false);

  const themeCounts = useMemo(() => {
    const counts = Object.fromEntries(CATALOG_THEMES.map((name) => [name, 0])) as Record<string, number>;
    for (const study of CATALOG_STUDIES) counts[study.theme] += 1;
    return counts;
  }, []);
  const usedTotal = useMemo(() => CATALOG_STUDIES.filter((study) => study.used).length, []);

  const filtered = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return CATALOG_STUDIES.filter(
      (study) =>
        (theme === null || study.theme === theme) &&
        (!usedOnly || study.used) &&
        words.every((word) => text(study).includes(word)),
    );
  }, [query, theme, usedOnly]);

  const byDecade = useMemo(() => {
    const groups = new Map<number, CatalogStudy[]>();
    for (const study of filtered) {
      const decade = Math.floor(study.year / 10) * 10;
      groups.set(decade, [...(groups.get(decade) ?? []), study]);
    }
    return [...groups.entries()].sort(([first], [second]) => second - first);
  }, [filtered]);

  const active = Boolean(query) || theme !== null || usedOnly;

  return (
    <div>
      <div className="border-b border-line bg-cyan">
        <div className="container-page py-8 sm:py-10">
          <label htmlFor={inputId} className="block text-[15px] font-bold text-ink">
            Find a survey
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
              placeholder="Try FinScope, census, 2022, agriculture or a producer"
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

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Chip
              active={theme === null && !usedOnly}
              onClick={() => {
                setTheme(null);
                setUsedOnly(false);
              }}
              count={CATALOG_STUDIES.length}
            >
              All
            </Chip>
            <Chip
              active={usedOnly}
              onClick={() => {
                setUsedOnly((value) => !value);
              }}
              count={usedTotal}
            >
              Used by IMBONIX
            </Chip>
            <span className="mx-1 h-6 w-px bg-ink/15" aria-hidden="true" />
            {CATALOG_THEMES.map((name) => (
              <Chip
                key={name}
                active={theme === name}
                onClick={() => setTheme((value) => (value === name ? null : name))}
                count={themeCounts[name]}
              >
                {name}
              </Chip>
            ))}
          </div>

          <p className="mt-4 text-[14px] font-semibold text-ink" aria-live="polite">
            {active
              ? `${filtered.length} of ${CATALOG_STUDIES.length} studies shown`
              : `${CATALOG_STUDIES.length} studies, 1978 to today`}
          </p>
        </div>
      </div>

      <div className="container-page py-12 sm:py-16">
        {byDecade.length === 0 ? (
          <div className="max-w-2xl rounded-xl border border-line bg-white px-6 py-8">
            <p className="text-[16px] font-bold text-ink">No survey matches.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setTheme(null);
                setUsedOnly(false);
              }}
              className="mt-4 inline-flex h-10 items-center rounded-md bg-ink px-4 text-[14px] font-semibold text-white hover:bg-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-12">
            {byDecade.map(([decade, studies]) => (
              <section key={decade} aria-labelledby={`decade-${decade}`}>
                <div className="flex items-baseline justify-between border-b border-line pb-3">
                  <h2
                    id={`decade-${decade}`}
                    className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink sm:text-[26px]"
                  >
                    {DECADE_LABEL(decade)}
                  </h2>
                  <p className="text-[13px] font-semibold text-muted">
                    {studies.length} {studies.length === 1 ? "study" : "studies"}
                  </p>
                </div>
                <ul className="mt-5 grid gap-4 lg:grid-cols-2">
                  {studies.map((study) => (
                    <StudyCard key={study.id} study={study} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
