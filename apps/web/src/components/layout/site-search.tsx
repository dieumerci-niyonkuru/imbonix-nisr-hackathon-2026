"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { ArrowDownIcon, ArrowTurnDownLeftIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FOCUS_AREAS, NAV, NAV_GROUPS, NAV_LINKS } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

export type SearchDistrict = { name: string; slug: string; province: string };
export type SearchMeasure = { id: string; label: string; hint: string; terms: string };

type ResultKind = "page" | "district" | "measure" | "sector";
type SearchEntry = {
  key: string;
  kind: ResultKind;
  label: string;
  hint: string;
  href: string;
  terms: string;
};
type ResultGroup = { title: string; items: SearchEntry[] };

const RESULT_GROUPS: { kind: ResultKind; title: string; limit: number }[] = [
  { kind: "page", title: "Pages", limit: 6 },
  { kind: "district", title: "Districts", limit: 6 },
  { kind: "measure", title: "Measures on the map", limit: 6 },
  { kind: "sector", title: "Sectors", limit: 8 },
];

/** Lower case without accents, so a query matches however it is typed. */
const foldText = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Lower is better; undefined means no match. Every word of the query must appear in the label or its terms. */
function matchScore(entry: SearchEntry, query: string, words: string[]): number | undefined {
  const label = foldText(entry.label);
  if (!words.every((word) => label.includes(word) || entry.terms.includes(word))) return undefined;
  if (label.startsWith(query)) return 0;
  if (label.split(/[\s(/]+/).some((part) => part.startsWith(words[0]))) return 1;
  return label.includes(words[0]) ? 2 : 3;
}

/**
 * What the search shows before anything is typed: every page, grouped like the header menus (each focus area opens
 * with its homepage overview), then the project pages.
 */
const JUMP_GROUPS: ResultGroup[] = [
  ...NAV_GROUPS.map((group) => ({
    title: group.label,
    items: [
      {
        key: `jump:/#${group.focusId}`,
        kind: "page" as const,
        label: "At a glance",
        hint: FOCUS_AREAS.find((area) => area.id === group.focusId)?.hint ?? "",
        href: `/#${group.focusId}`,
        terms: "",
      },
      ...group.items.map((item) => ({
        key: `jump:${item.href}`,
        kind: "page" as const,
        label: item.label,
        hint: item.description,
        href: item.href,
        terms: "",
      })),
    ],
  })),
  {
    title: "Project",
    items: [
      {
        key: "jump:/",
        kind: "page" as const,
        label: "Homepage",
        hint: NAV.find((item) => item.href === "/")?.description ?? "",
        href: "/",
        terms: "",
      },
      ...NAV_LINKS.map((item) => ({
        key: `jump:${item.href}`,
        kind: "page" as const,
        label: item.label,
        hint: item.description,
        href: item.href,
        terms: "",
      })),
    ],
  },
];

function isTypingIn(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

/**
 * Site search as a command palette: pages, focus areas, districts, map measures and sectors. It opens with Ctrl K
 * (Cmd K on a Mac) or "/". The 416 sector names are fetched from /api/search-index the first time it opens, so they
 * are not part of every page.
 */
export function SiteSearch({
  open,
  onOpenChange,
  districts,
  measures,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  districts: SearchDistrict[];
  measures: SearchMeasure[];
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const listId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [sectors, setSectors] = useState<SearchEntry[]>();

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      } else if (event.key === "/" && !open && !isTypingIn(event.target)) {
        event.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
  }, [open]);

  const districtNameBySlug = useMemo(
    () => Object.fromEntries(districts.map((district) => [district.slug, district.name])),
    [districts],
  );

  useEffect(() => {
    if (!open || sectors) return;
    let cancelled = false;
    fetch("/api/search-index")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((index: { sectors: [string, string][] }) => {
        if (cancelled) return;
        setSectors(
          index.sectors.map(([sectorName, districtSlug]) => ({
            key: `sector:${districtSlug}:${sectorName}`,
            kind: "sector",
            label: sectorName,
            hint: `Sector in ${districtNameBySlug[districtSlug] ?? districtSlug}`,
            href: `/districts/${districtSlug}`,
            terms: foldText(`${districtNameBySlug[districtSlug] ?? ""} sector umurenge`),
          })),
        );
      })
      // Pages, districts and measures still work without the sector list.
      .catch(() => !cancelled && setSectors([]));
    return () => {
      cancelled = true;
    };
  }, [open, sectors, districtNameBySlug]);

  const entries = useMemo<SearchEntry[]>(() => {
    const groupLabelByHref = Object.fromEntries(
      NAV_GROUPS.flatMap((group) => group.items.map((item) => [item.href, group.label])),
    );
    return [
      ...NAV.map((item) => ({
        key: `page:${item.href}`,
        kind: "page" as const,
        label: item.label,
        hint: item.description,
        href: item.href,
        terms: foldText(`${item.description} ${groupLabelByHref[item.href] ?? ""}`),
      })),
      ...FOCUS_AREAS.map((area) => ({
        key: `page:/#${area.id}`,
        kind: "page" as const,
        label: area.label,
        hint: `Homepage focus area · ${area.hint}`,
        href: `/#${area.id}`,
        terms: foldText(`${area.hint} focus area homepage`),
      })),
      ...districts.map((district) => ({
        key: `district:${district.slug}`,
        kind: "district" as const,
        label: district.name,
        hint: `${district.province} · district profile`,
        href: `/districts/${district.slug}`,
        terms: foldText(`${district.province} district akarere`),
      })),
      ...measures.map((measure) => ({
        key: `measure:${measure.id}`,
        kind: "measure" as const,
        label: measure.label,
        hint: measure.hint,
        href: `/map?layer=${measure.id}`,
        terms: foldText(measure.terms),
      })),
      ...(sectors ?? []),
    ];
  }, [districts, measures, sectors]);

  const trimmedQuery = foldText(query.trim());
  const resultGroups = useMemo<ResultGroup[]>(() => {
    if (!trimmedQuery) return JUMP_GROUPS;
    const words = trimmedQuery.split(/\s+/);
    return RESULT_GROUPS.map(({ kind, title, limit }) => ({
      title,
      items: entries
        .filter((entry) => entry.kind === kind)
        .map((entry) => ({ entry, score: matchScore(entry, trimmedQuery, words) }))
        .filter((result): result is { entry: SearchEntry; score: number } => result.score !== undefined)
        .sort((first, second) => first.score - second.score || first.entry.label.localeCompare(second.entry.label))
        .slice(0, limit)
        .map((result) => result.entry),
    })).filter((group) => group.items.length);
  }, [entries, trimmedQuery]);

  const flatResults = useMemo(() => resultGroups.flatMap((group) => group.items), [resultGroups]);
  const optionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => setActiveIndex(0), [trimmedQuery]);
  useEffect(() => {
    if (open) document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, listId]);

  const openResult = (entry: SearchEntry | undefined) => {
    if (!entry) return;
    onOpenChange(false);
    // On the homepage a focus area link switches the tab in place, since the tabs follow the URL hash.
    if (entry.href.startsWith("/#") && pathname === "/") {
      window.location.hash = entry.href.slice(2);
      return;
    }
    router.push(entry.href);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!flatResults.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % flatResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + flatResults.length) % flatResults.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      openResult(flatResults[activeIndex]);
    }
  };

  let runningIndex = -1;
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-navy-950/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 top-[7vh] z-[60] mx-auto flex max-h-[min(720px,86vh)] w-[calc(100%-2rem)] max-w-[680px] flex-col overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-line duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2"
        >
          <DialogPrimitive.Title className="sr-only">Search IMBONIX</DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-line px-5">
            <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-royal" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={flatResults.length ? optionId(activeIndex) : undefined}
              aria-label="Search pages, districts, sectors and measures"
              placeholder="Search a district, sector, measure or page…"
              autoComplete="off"
              spellCheck={false}
              className="h-16 min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-ink placeholder:font-medium placeholder:text-muted focus:outline-none focus-visible:outline-none"
            />
            <DialogPrimitive.Close className="group inline-flex shrink-0 items-center gap-2 rounded-full py-1 pl-2 pr-1 text-[13.5px] font-semibold text-ink transition-colors hover:text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal">
              Close
              <span className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-line transition-colors group-hover:bg-cyan group-hover:text-navy-900 group-hover:ring-cyan">
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </DialogPrimitive.Close>
          </div>

          {/* Focusable, so the list can be scrolled from the keyboard when it is taller than the dialog. */}
          <div
            role="region"
            aria-label="Search results"
            tabIndex={0}
            className="min-h-0 flex-1 overflow-y-auto p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-royal"
          >
            {!trimmedQuery && (
              <p className="px-3 pb-1 pt-3 text-[13px] font-semibold text-muted">
                Jump to a page, or type to search districts, sectors and measures.
              </p>
            )}
            {flatResults.length ? (
              <div
                role="listbox"
                id={listId}
                aria-label={trimmedQuery ? "Results" : "Jump to a page"}
                className={cn(!trimmedQuery && "grid gap-x-2 sm:grid-cols-2")}
              >
                {resultGroups.map((group, groupIndex) => (
                  <div key={group.title} role="group" aria-labelledby={`${listId}-group-${groupIndex}`} className="pb-2">
                    <p
                      id={`${listId}-group-${groupIndex}`}
                      className="eyebrow mx-3 mb-1 mt-3 border-b border-line pb-2 text-royal"
                    >
                      {group.title}
                    </p>
                    {group.items.map((entry) => {
                      runningIndex += 1;
                      const entryIndex = runningIndex;
                      const selected = entryIndex === activeIndex;
                      return (
                        <div
                          key={entry.key}
                          id={optionId(entryIndex)}
                          role="option"
                          aria-selected={selected}
                          onMouseMove={() => setActiveIndex(entryIndex)}
                          onClick={() => openResult(entry)}
                          className={cn(
                            "cursor-pointer rounded-r-lg border-l-[3px] px-3 py-2.5 transition-colors",
                            selected ? "border-cyan bg-cyan-soft" : "border-transparent",
                          )}
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="truncate text-[14.5px] font-bold text-ink">
                              <HighlightedLabel text={entry.label} query={trimmedQuery} />
                            </span>
                            <span
                              className={cn(
                                "shrink-0 text-[11px] font-bold uppercase tracking-[0.1em]",
                                selected ? "text-royal" : "text-transparent",
                              )}
                              aria-hidden="true"
                            >
                              Open
                            </span>
                          </span>
                          {/* The jump list shows page names only; search results add a short line on what each one is. */}
                          {trimmedQuery && (
                            <span className="block truncate text-[12.5px] leading-5 text-muted">{entry.hint}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="font-display text-lg font-semibold text-ink">No matches for &ldquo;{query.trim()}&rdquo;</p>
                <p className="mx-auto mt-2 max-w-sm text-[14px] leading-6 text-muted">
                  Try a district such as Nyamagabe, a sector, or a measure such as stunting or mobile money.
                </p>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-5 border-t border-line bg-paper px-5 py-3 text-[12px] font-medium text-muted sm:flex">
            <span className="flex items-center gap-1.5">
              <KeyHint>
                <ArrowUpIcon className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">Up arrow</span>
              </KeyHint>
              <KeyHint>
                <ArrowDownIcon className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">Down arrow</span>
              </KeyHint>
              to move
            </span>
            <span className="flex items-center gap-1.5">
              <KeyHint>
                <ArrowTurnDownLeftIcon className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">Enter</span>
              </KeyHint>
              to open
            </span>
            <span className="flex items-center gap-1.5">
              <KeyHint>Esc</KeyHint> to close
            </span>
            <span className="ml-auto">
              {sectors ? (sectors.length ? `${sectors.length} sectors included` : "") : "Loading sectors…"}
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Marks the first place the query appears in the label (when folding accents keeps the text the same length). */
function HighlightedLabel({ text, query }: { text: string; query: string }) {
  const folded = foldText(text);
  const matchStart = query && folded.length === text.length ? folded.indexOf(query) : -1;
  if (matchStart < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, matchStart)}
      <mark className="rounded-sm bg-cyan-soft text-ink">{text.slice(matchStart, matchStart + query.length)}</mark>
      {text.slice(matchStart + query.length)}
    </>
  );
}

function KeyHint({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-white px-1 font-body text-[11px] font-bold text-ink ring-1 ring-line">
      {children}
    </kbd>
  );
}
