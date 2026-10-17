"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownIcon,
  ArrowTrendingDownIcon,
  ArrowTurnDownLeftIcon,
  ArrowUpIcon,
  BanknotesIcon,
  BeakerIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  ChartPieIcon,
  CircleStackIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentTextIcon,
  FlagIcon,
  HomeIcon,
  IdentificationIcon,
  InformationCircleIcon,
  LifebuoyIcon,
  MapIcon,
  MapPinIcon,
  PresentationChartLineIcon,
  SparklesIcon,
  Square3Stack3DIcon,
  WalletIcon,
} from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { MENU_SECTIONS, NAV, NAV_LINKS } from "@/components/layout/nav";
import { foldText, listPlaces, loadPlaceIndex, PLACE_KIND_LABEL, placeAddress, placeHref, placeMatchScore } from "@/lib/places";
import { cn } from "@/lib/utils";

export type SearchDistrict = { name: string; slug: string; province: string };
export type SearchMeasure = { id: string; label: string; hint: string; terms: string; href: string };
export type SearchChart = { id: string; title: string; about: string; page: string };
export type SearchLever = { title: string; question: string };

type ResultKind = "page" | "district" | "sector" | "cell" | "village" | "measure" | "chart" | "lever";
type SearchEntry = {
  key: string;
  kind: ResultKind;
  label: string;
  hint: string;
  href: string;
  /** The label folded once, so matching thousands of places stays quick. */
  folded: string;
  terms: string;
};
/** `total` is how many matched, when more matched than are shown. */
type ResultGroup = { title: string; items: SearchEntry[]; total?: number };

/** A small icon for each kind of result, so the list is scannable by type at a glance. */
const KIND_ICON: Record<ResultKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  page: DocumentTextIcon,
  district: MapIcon,
  sector: MapPinIcon,
  cell: MapPinIcon,
  village: MapPinIcon,
  measure: ChartBarIcon,
  chart: PresentationChartLineIcon,
  lever: AdjustmentsHorizontalIcon,
};

/**
 * A fitting icon for each page by its route, so the jump list reads by what each page is — money, a map, a safety net,
 * a plan — rather than one generic sheet. Overviews take their focus area's icon; anything unlisted falls back to the
 * document icon.
 */
const PAGE_ICON: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "/": HomeIcon,
  "/financial-exclusion": WalletIcon,
  "/financial-exclusion/access-and-use": CreditCardIcon,
  "/financial-exclusion/risk-model": SparklesIcon,
  "/poverty-dynamics": ArrowTrendingDownIcon,
  "/poverty-dynamics/trends": PresentationChartLineIcon,
  "/poverty-dynamics/district-map": MapIcon,
  "/districts": IdentificationIcon,
  "/poverty-dynamics/overlapping-needs": Square3Stack3DIcon,
  "/social-protection": LifebuoyIcon,
  "/social-protection/vup-payments": BanknotesIcon,
  "/social-protection/priority-districts": FlagIcon,
  "/social-protection/policy-scenarios": BeakerIcon,
  "/social-protection/intervention-planner": ClipboardDocumentListIcon,
  "/data": BookOpenIcon,
  "/data/key-figures": ChartBarSquareIcon,
  "/data/catalog": CircleStackIcon,
  "/data/chart-library": ChartPieIcon,
  "/about": InformationCircleIcon,
};

/** The icon for a result: a page's own icon by its route, otherwise the icon for its kind. */
function iconFor(entry: Pick<SearchEntry, "kind" | "href">): ComponentType<SVGProps<SVGSVGElement>> {
  if (entry.kind === "page") return PAGE_ICON[entry.href] ?? DocumentTextIcon;
  return KIND_ICON[entry.kind];
}

const RESULT_GROUPS: { kind: ResultKind; title: string; limit: number }[] = [
  { kind: "page", title: "Pages", limit: 6 },
  { kind: "district", title: "Districts", limit: 6 },
  { kind: "sector", title: "Sectors", limit: 6 },
  { kind: "cell", title: "Cells", limit: 6 },
  { kind: "village", title: "Villages", limit: 8 },
  { kind: "measure", title: "Indicators", limit: 6 },
  { kind: "chart", title: "Charts", limit: 6 },
  { kind: "lever", title: "Policy levers", limit: 4 },
];

/** A few example searches, shown in the empty state, so a first-time reader sees the depth: a subject, a place, a page. */
const SUGGESTIONS = ["Stunting", "Mobile money", "Extreme poverty", "VUP payments", "Nyamagabe", "Bank account"];

/** Recently opened results, remembered per browser so the palette reopens on what the reader last used. */
type RecentEntry = { key: string; kind: ResultKind; label: string; hint: string; href: string };
const RECENTS_KEY = "imbonix:recent-searches";
const RECENTS_MAX = 6;

/** Read the saved recents, tolerating a missing, blocked or corrupt store (private windows, cleared data). */
function readRecents(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is RecentEntry =>
          Boolean(item) &&
          typeof (item as RecentEntry).href === "string" &&
          typeof (item as RecentEntry).label === "string" &&
          (item as RecentEntry).kind in KIND_ICON,
      )
      .slice(0, RECENTS_MAX);
  } catch {
    return [];
  }
}

/** A search entry, with its label folded for matching. */
function entry(fields: Omit<SearchEntry, "folded">): SearchEntry {
  return { ...fields, folded: foldText(fields.label) };
}

/** Places are found by their own name; the names of the units they lie in only narrow the results down. */
const PLACE_KINDS = new Set<ResultKind>(["sector", "cell", "village"]);

/** Lower is better; undefined means no match. Every word of the query must appear in the label or its terms. */
function matchScore(entry: SearchEntry, query: string, words: string[]): number | undefined {
  if (PLACE_KINDS.has(entry.kind)) return placeMatchScore(entry, query, words);
  const label = entry.folded;
  if (!words.every((word) => label.includes(word) || entry.terms.includes(word))) return undefined;
  if (label.startsWith(query)) return 0;
  if (label.split(/[\s(/]+/).some((part) => part.startsWith(words[0]))) return 1;
  return label.includes(words[0]) ? 2 : 3;
}

/**
 * What the search shows before anything is typed: every page, grouped like the header menus (each focus area opens
 * with its overview, the data with Sources and methods), then the project pages.
 */
const JUMP_GROUPS: ResultGroup[] = [
  ...MENU_SECTIONS.map((section) => ({
    title: section.label,
    items: [
      entry({
        key: `jump:${section.href}`,
        kind: "page",
        label: section.landingLabel,
        hint: section.landingDescription,
        href: section.href,
        terms: "",
      }),
      ...section.items.map((item) =>
        entry({ key: `jump:${item.href}`, kind: "page", label: item.label, hint: item.description, href: item.href, terms: "" }),
      ),
    ],
  })),
  {
    title: "Project",
    items: [
      entry({
        key: "jump:/",
        kind: "page",
        label: "Homepage",
        hint: NAV.find((item) => item.href === "/")?.description ?? "",
        href: "/",
        terms: "",
      }),
      ...NAV_LINKS.map((item) =>
        entry({ key: `jump:${item.href}`, kind: "page", label: item.label, hint: item.description, href: item.href, terms: "" }),
      ),
    ],
  },
];

/** Every sector, cell and village as a search entry. Each opens its district's page with that sector selected. */
function placeEntries(places: ReturnType<typeof listPlaces>): SearchEntry[] {
  return places.map((place) => ({
    key: place.key,
    kind: place.kind,
    label: place.name,
    hint: `${PLACE_KIND_LABEL[place.kind]} in ${placeAddress(place)}`,
    href: placeHref(place),
    folded: place.folded,
    terms: place.terms,
  }));
}

function isTypingIn(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

/**
 * Site search as a command palette: pages, focus areas, districts, sectors, cells, villages, every indicator, every
 * chart and the policy levers. It opens with Ctrl K (Cmd K on a Mac) or "/". The places are fetched from
 * /api/search-index the first time it opens, so the 14,815 villages are not part of every page. It remembers the last
 * few results opened (in this browser) and shows them, with a row of example searches, before anything is typed.
 */
export function SiteSearch({
  open,
  onOpenChange,
  districts,
  measures,
  charts,
  levers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  districts: SearchDistrict[];
  measures: SearchMeasure[];
  charts: SearchChart[];
  levers: SearchLever[];
}) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [places, setPlaces] = useState<SearchEntry[]>();
  const [placeCounts, setPlaceCounts] = useState<{ sectors: number; cells: number; villages: number }>();
  const [recents, setRecents] = useState<RecentEntry[]>([]);

  // Load the saved recents once, on the client only, so there is no server/client mismatch.
  useEffect(() => setRecents(readRecents()), []);

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
    if (!open || places) return;
    let cancelled = false;
    loadPlaceIndex()
      .then((index) => {
        if (cancelled) return;
        setPlaces(placeEntries(listPlaces(index, districtNameBySlug)));
        setPlaceCounts({ sectors: index.sectors.length, cells: index.cells.length, villages: index.villages.length });
      })
      // Pages, districts, indicators and charts still work without the place list.
      .catch(() => !cancelled && setPlaces([]));
    return () => {
      cancelled = true;
    };
  }, [open, places, districtNameBySlug]);

  const entries = useMemo<SearchEntry[]>(() => {
    const groupLabelByHref = Object.fromEntries(
      MENU_SECTIONS.flatMap((section) =>
        [section.href, ...section.items.map((item) => item.href)].map((href) => [href, section.label]),
      ),
    );
    return [
      ...NAV.map((item) =>
        entry({
          key: `page:${item.href}`,
          kind: "page",
          label: item.label,
          hint: item.description,
          href: item.href,
          terms: foldText(`${item.description} ${groupLabelByHref[item.href] ?? ""}`),
        }),
      ),
      ...districts.map((district) =>
        entry({
          key: `district:${district.slug}`,
          kind: "district",
          label: district.name,
          hint: `${district.province} · district profile`,
          href: `/districts/${district.slug}`,
          terms: foldText(`${district.province} district akarere`),
        }),
      ),
      ...(places ?? []),
      ...measures.map((measure) =>
        entry({
          key: `measure:${measure.id}`,
          kind: "measure",
          label: measure.label,
          hint: measure.hint,
          href: measure.href,
          terms: foldText(measure.terms),
        }),
      ),
      ...charts.map((chart) =>
        entry({
          key: `chart:${chart.id}`,
          kind: "chart",
          label: chart.title,
          hint: chart.about,
          href: `${chart.page}#${chart.id}`,
          terms: foldText(`${chart.about} chart graph`),
        }),
      ),
      ...levers.map((lever) =>
        entry({
          key: `lever:${lever.title}`,
          kind: "lever",
          label: lever.title,
          hint: lever.question,
          href: "/social-protection/priority-districts",
          terms: foldText(`${lever.question} policy lever priority`),
        }),
      ),
    ];
  }, [districts, measures, charts, levers, places]);

  const trimmedQuery = foldText(query.trim());
  const resultGroups = useMemo<ResultGroup[]>(() => {
    if (!trimmedQuery) return JUMP_GROUPS;
    const words = trimmedQuery.split(/\s+/);
    return RESULT_GROUPS.map(({ kind, title, limit }) => {
      const matches = entries
        .filter((candidate) => candidate.kind === kind)
        .map((candidate) => ({ entry: candidate, score: matchScore(candidate, trimmedQuery, words) }))
        .filter((result): result is { entry: SearchEntry; score: number } => result.score !== undefined)
        .sort((first, second) => first.score - second.score || first.entry.label.localeCompare(second.entry.label));
      return { title, items: matches.slice(0, limit).map((result) => result.entry), total: matches.length };
    }).filter((group) => group.items.length);
  }, [entries, trimmedQuery]);

  // Before anything is typed, the recents sit at the top of the list and share its keyboard navigation.
  const recentOptions = useMemo<SearchEntry[]>(
    () => (trimmedQuery ? [] : recents.map((item) => ({ ...item, folded: "", terms: "" }))),
    [recents, trimmedQuery],
  );

  const flatResults = useMemo(
    () => [...recentOptions, ...resultGroups.flatMap((group) => group.items)],
    [recentOptions, resultGroups],
  );
  const optionId = (index: number) => `${listId}-option-${index}`;
  const placesLoading = open && places === undefined;

  useEffect(() => setActiveIndex(0), [trimmedQuery]);
  useEffect(() => {
    if (open) document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, listId]);

  const rememberRecent = (entry: SearchEntry) => {
    const item: RecentEntry = {
      key: `recent:${entry.href}`,
      kind: entry.kind,
      label: entry.label,
      hint: entry.hint,
      href: entry.href,
    };
    setRecents((prev) => {
      const next = [item, ...prev.filter((candidate) => candidate.href !== item.href)].slice(0, RECENTS_MAX);
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        // A browser that blocks storage simply will not remember across visits; the palette still works this session.
      }
      return next;
    });
  };

  const clearRecents = () => {
    setRecents([]);
    try {
      localStorage.removeItem(RECENTS_KEY);
    } catch {
      // Nothing to do if the store is unavailable.
    }
  };

  const openResult = (entry: SearchEntry | undefined) => {
    if (!entry) return;
    rememberRecent(entry);
    onOpenChange(false);
    router.push(entry.href);
  };

  const pickSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
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
  const renderOption = (entry: SearchEntry, showHint: boolean) => {
    runningIndex += 1;
    const entryIndex = runningIndex;
    const selected = entryIndex === activeIndex;
    const Icon = iconFor(entry);
    return (
      <div
        key={entry.key}
        id={optionId(entryIndex)}
        role="option"
        aria-selected={selected}
        onMouseMove={() => setActiveIndex(entryIndex)}
        onClick={() => openResult(entry)}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-r-lg border-l-[3px] px-3 py-2 transition-colors",
          selected ? "border-cyan bg-cyan-soft" : "border-transparent",
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors",
            selected ? "bg-white text-cyan-ink ring-cyan" : "bg-cyan-soft text-cyan-ink ring-cyan/25",
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[14.5px] font-bold text-ink">
              <HighlightedLabel text={entry.label} query={trimmedQuery} />
            </span>
            <span
              className={cn(
                "shrink-0 text-[12px] font-bold uppercase tracking-[0.06em]",
                selected ? "text-cyan-ink" : "text-transparent",
              )}
              aria-hidden="true"
            >
              Open
            </span>
          </span>
          {/* The jump list shows page names only; recents and results add a short line on what each one is. */}
          {showHint && (
            <span className="block truncate text-[12.5px] leading-5 text-muted">
              <HighlightedLabel text={entry.hint} query={trimmedQuery} />
            </span>
          )}
        </span>
      </div>
    );
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-lenis-prevent
          className="fixed inset-0 z-[60] bg-ink/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          data-lenis-prevent
          className="fixed inset-x-0 top-[7vh] z-[60] mx-auto flex max-h-[min(720px,86vh)] w-[calc(100%-2rem)] max-w-[680px] flex-col overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-line duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2"
        >
          <DialogPrimitive.Title className="sr-only">Search IMBONIX</DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-line px-5">
            <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-cyan-ink" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={flatResults.length ? optionId(activeIndex) : undefined}
              aria-label="Search pages, places down to villages, indicators and charts"
              placeholder="Search a place, indicator, chart or page…"
              autoComplete="off"
              spellCheck={false}
              className="h-16 min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-ink placeholder:font-medium placeholder:text-muted focus:outline-none focus-visible:outline-none"
            />
            <DialogPrimitive.Close className="group inline-flex shrink-0 items-center gap-2 rounded-full py-1 pl-2 pr-1 text-[13.5px] font-semibold text-ink transition-colors hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink">
              Close
              <span className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-line transition-colors group-hover:bg-cyan group-hover:text-ink group-hover:ring-cyan">
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </DialogPrimitive.Close>
          </div>

          {/* Focusable, so the list can be scrolled from the keyboard when it is taller than the dialog. */}
          <div
            role="region"
            aria-label="Search results"
            tabIndex={0}
            className="min-h-0 flex-1 overflow-y-auto p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-ink"
          >
            {!trimmedQuery && (
              <>
                <p className="px-3 pb-2 pt-3 text-[13px] font-semibold text-muted">
                  Jump to a page, or type a district, sector, cell or village, an indicator or a chart.
                </p>
                {/* Example searches, so the depth of the index is obvious from the start. */}
                <div className="flex flex-wrap items-center gap-2 px-3 pb-1">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => pickSuggestion(suggestion)}
                      className="rounded-full bg-paper px-3 py-1 text-[12.5px] font-semibold text-ink ring-1 ring-line transition-colors hover:bg-cyan-soft hover:text-cyan-ink hover:ring-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </>
            )}

            {flatResults.length ? (
              <div role="listbox" id={listId} aria-label={trimmedQuery ? "Results" : "Jump to a page"}>
                {/* Place results come in once the index loads; say so rather than look like there are none. */}
                {trimmedQuery && placesLoading && (
                  <p className="mx-3 mb-1 mt-3 flex items-center gap-2 text-[12.5px] font-medium text-muted">
                    <Spinner />
                    Still loading sectors, cells and villages…
                  </p>
                )}

                {!trimmedQuery && recentOptions.length > 0 && (
                  <div role="group" aria-labelledby={`${listId}-recent`} className="pb-2">
                    <p
                      id={`${listId}-recent`}
                      className="mx-3 mb-1 mt-3 flex items-center justify-between gap-3 border-b border-line pb-2"
                    >
                      <span className="eyebrow flex items-center gap-1.5 text-cyan-ink">
                        <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Recent
                      </span>
                      <button
                        type="button"
                        onClick={clearRecents}
                        className="rounded text-[12px] font-semibold text-muted transition-colors hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                      >
                        Clear
                      </button>
                    </p>
                    {recentOptions.map((entry) => renderOption(entry, true))}
                  </div>
                )}

                <div className={cn(!trimmedQuery && "gap-x-8 sm:columns-2")}>
                  {resultGroups.map((group, groupIndex) => (
                    <div
                      key={group.title}
                      role="group"
                      aria-labelledby={`${listId}-group-${groupIndex}`}
                      className="break-inside-avoid pb-2"
                    >
                      <p
                        id={`${listId}-group-${groupIndex}`}
                        className="mx-3 mb-1 mt-3 flex flex-wrap items-baseline justify-between gap-x-3 border-b border-line pb-2"
                      >
                        <span className="eyebrow text-cyan-ink">{group.title}</span>
                        {/* When more matched than are shown, say so, and how to narrow it down. */}
                        {group.total !== undefined && group.total > group.items.length && (
                          <span className="text-[12px] font-semibold text-muted">
                            {group.items.length} of {group.total} shown. Add a sector or district to narrow it.
                          </span>
                        )}
                      </p>
                      {group.items.map((entry) => renderOption(entry, Boolean(trimmedQuery)))}
                    </div>
                  ))}
                </div>
              </div>
            ) : placesLoading ? (
              <div className="px-6 py-12 text-center">
                <p className="flex items-center justify-center gap-2 font-display text-lg font-semibold text-ink">
                  <Spinner />
                  Loading places…
                </p>
                <p className="mx-auto mt-2 max-w-sm text-[14px] leading-6 text-muted">
                  Sectors, cells and villages are being indexed. Pages, districts, indicators and charts already match.
                </p>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="font-display text-lg font-semibold text-ink">No matches for &ldquo;{query.trim()}&rdquo;</p>
                <p className="mx-auto mt-2 max-w-sm text-[14px] leading-6 text-muted">
                  Try a district such as Nyamagabe, a sector, cell or village, or a subject such as stunting or mobile money.
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
              {placeCounts
                ? `${placeCounts.sectors} sectors, ${placeCounts.cells.toLocaleString("en-US")} cells and ${placeCounts.villages.toLocaleString("en-US")} villages included`
                : places
                  ? ""
                  : "Loading places…"}
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Marks the first place the query appears in the text (when folding accents keeps the text the same length). */
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

/** A small spinning ring, for the moment the place index is still loading. */
function Spinner() {
  return (
    <span
      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-cyan-ink motion-reduce:animate-none"
      aria-hidden="true"
    />
  );
}

function KeyHint({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-white px-1 font-body text-[11px] font-bold text-ink ring-1 ring-line">
      {children}
    </kbd>
  );
}
