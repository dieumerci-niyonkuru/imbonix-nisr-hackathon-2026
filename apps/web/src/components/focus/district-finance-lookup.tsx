"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, MapIcon, MapPinIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DISTRICTS, districtBySlug, rankOf, reference, valueOf, type District } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { meta } from "@/lib/indicators";
import { foldText, listPlaces, loadPlaceIndex, PLACE_KIND_LABEL, placeAddress, placeMatchScore, type Place } from "@/lib/places";
import { cn } from "@/lib/utils";

/** The four FinScope district measures that frame who is reached and who is left out. */
const MEASURES = [
  { id: "finscope_formally_included", label: "Formally included" },
  { id: "finscope_banked", label: "Banked (own account)" },
  { id: "finscope_not_formally_included", label: "Not formally included" },
  { id: "finscope_excluded", label: "Financially excluded" },
] as const;

/** The headline exclusion measure, used to rank the district and to open it on the map. */
const EXCLUSION_ID = "finscope_not_formally_included";

const districtNameBySlug: Record<string, string> = Object.fromEntries(DISTRICTS.map((d) => [d.slug, d.name]));

/** Open on the most-excluded district, so the card is never empty and starts on the page's own question. */
const DEFAULT_SLUG = [...DISTRICTS]
  .filter((d) => d.values[EXCLUSION_ID])
  .sort((a, b) => b.values[EXCLUSION_ID]!.v - a.values[EXCLUSION_ID]!.v)[0].slug;

type Selection = { slug: string; place?: Place };

/** A searchable entry: a district, or a sector, cell or village that resolves to its district. */
type Entry = {
  key: string;
  kind: "district" | Place["kind"];
  name: string;
  slug: string;
  hint: string;
  folded: string;
  terms: string;
  place?: Place;
};

const DISTRICT_ENTRIES: Entry[] = DISTRICTS.map((d) => ({
  key: `district:${d.slug}`,
  kind: "district",
  name: d.name,
  slug: d.slug,
  hint: `${d.province} · district`,
  folded: foldText(d.name),
  terms: foldText(`${d.province} district akarere`),
}));

const ORDINAL = (n: number) => {
  const rule = new Intl.PluralRules("en-US", { type: "ordinal" }).select(n);
  const suffix = { one: "st", two: "nd", few: "rd", other: "th", zero: "th", many: "th" }[rule];
  return `${n}${suffix}`;
};

/** Every word must appear in the name or the units around it, and at least one in the name itself. */
function scoreOf(entry: Entry, query: string, words: string[]): number | undefined {
  if (entry.kind !== "district") return placeMatchScore(entry, query, words);
  if (!words.every((w) => entry.folded.includes(w) || entry.terms.includes(w))) return undefined;
  if (entry.folded.startsWith(query)) return 0;
  return entry.folded.includes(words[0]) ? 1 : 2;
}

/**
 * A place lookup for the financial inclusion overview: type a district, sector, cell or village and read that
 * district's FinScope strand, against the national figure and its rank among the 30. FinScope is published to district
 * level, so a sector, cell or village is shown with the figures of the district it sits in — the same rule the rest of
 * the site uses for finance. The ~2,100 cells and ~14,800 villages load from /api/search-index on first use.
 */
export function DistrictFinanceLookup() {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<Selection>({ slug: DEFAULT_SLUG });
  const [places, setPlaces] = useState<Entry[]>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Load the places once, the first time the box is used. Districts work on their own if the fetch fails.
  useEffect(() => {
    if (!open || places) return;
    let cancelled = false;
    loadPlaceIndex()
      .then((index) => {
        if (cancelled) return;
        setPlaces(
          listPlaces(index, districtNameBySlug).map((place) => ({
            key: place.key,
            kind: place.kind,
            name: place.name,
            slug: place.districtSlug,
            hint: `${PLACE_KIND_LABEL[place.kind]} in ${placeAddress(place)}`,
            folded: place.folded,
            terms: place.terms,
            place,
          })),
        );
      })
      .catch(() => !cancelled && setPlaces([]));
    return () => {
      cancelled = true;
    };
  }, [open, places]);

  // Close the list when the focus or a click leaves the component.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const trimmed = foldText(query.trim());
  const results = useMemo(() => {
    if (!trimmed) return [] as Entry[];
    const words = trimmed.split(/\s+/);
    const all = [...DISTRICT_ENTRIES, ...(places ?? [])];
    return (
      all
        .map((entry) => ({ entry, score: scoreOf(entry, trimmed, words) }))
        .filter((hit): hit is { entry: Entry; score: number } => hit.score !== undefined)
        // Districts first, then the finer places, then alphabetically.
        .sort(
          (a, b) =>
            a.score - b.score ||
            (a.entry.kind === "district" ? 0 : 1) - (b.entry.kind === "district" ? 0 : 1) ||
            a.entry.name.localeCompare(b.entry.name),
        )
        .slice(0, 8)
        .map((hit) => hit.entry)
    );
  }, [trimmed, places]);

  useEffect(() => setActiveIndex(0), [trimmed]);

  const choose = (entry: Entry | undefined) => {
    if (!entry) return;
    setSelection({ slug: entry.slug, place: entry.place });
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const district = districtBySlug(selection.slug);

  return (
    <div className="rounded-2xl border border-line bg-white p-6 sm:p-7">
      <p className="eyebrow text-cyan-ink">Find a place</p>
      <h3 className="mt-2 font-display text-xl font-bold tracking-[-0.02em] text-ink sm:text-2xl">
        Financial inclusion where you are
      </h3>
      <p className="mt-2 text-[14px] leading-6 text-muted">
        Type a district, sector, cell or village. FinScope is published to district level, so a sector, cell or village is shown
        with the figures of the district it sits in.
      </p>

      <div ref={rootRef} className="relative mt-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-3.5 focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/40">
          <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-cyan-ink" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={open && results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label="Search a district, sector, cell or village"
            placeholder="e.g. Nyamagabe, Kimironko, your village…"
            autoComplete="off"
            spellCheck={false}
            className="h-12 min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-ink placeholder:font-medium placeholder:text-muted focus:outline-none"
          />
        </div>

        {open && trimmed && (
          <ul
            role="listbox"
            id={listId}
            className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-lift"
          >
            {results.length ? (
              results.map((entry, index) => {
                const selected = index === activeIndex;
                const label = entry.kind === "district" ? "District" : PLACE_KIND_LABEL[entry.kind];
                return (
                  <li key={entry.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onMouseMove={() => setActiveIndex(index)}
                      onClick={() => choose(entry)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                        selected ? "bg-cyan-soft" : "hover:bg-paper",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
                          selected ? "bg-white text-cyan-ink ring-cyan/40" : "bg-paper text-muted ring-line",
                        )}
                        aria-hidden="true"
                      >
                        {entry.kind === "district" ? <MapIcon className="h-4 w-4" /> : <MapPinIcon className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold text-ink">{entry.name}</span>
                        <span className="block truncate text-[12px] leading-4 text-muted">
                          {entry.kind === "district" ? entry.hint : `${label} · ${entry.hint.replace(/^[^·]*· /, "")}`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-3 text-[13px] text-muted">
                {places ? "No place by that name. Try a district such as Nyamagabe." : "Loading places…"}
              </li>
            )}
          </ul>
        )}
      </div>

      {district && <DistrictFinanceCard district={district} place={selection.place} />}
    </div>
  );
}

/** The selected district's FinScope strand, with a note when the chosen place is a sector, cell or village. */
function DistrictFinanceCard({ district, place }: { district: District; place?: Place }) {
  const exclusionRank = rankOf(district, meta(EXCLUSION_ID));
  const excludedAdults = valueOf(district, "calc_excluded_adults_2024");
  const subDistrict = Boolean(place);

  return (
    <div className="mt-6 border-t border-line pt-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h4 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">{district.name}</h4>
        <span className="rounded-full bg-cyan-soft px-2.5 py-0.5 text-[12px] font-bold text-cyan-ink">{district.province}</span>
        {exclusionRank && (
          <span className="text-[12.5px] font-semibold text-muted">
            {ORDINAL(exclusionRank.rank)} most excluded of {exclusionRank.of} districts
          </span>
        )}
      </div>

      {subDistrict && place && (
        <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-5 text-muted">
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-ink" aria-hidden="true" />
          <span>
            {PLACE_KIND_LABEL[place.kind]} <strong className="text-ink">{place.name}</strong> is in {placeAddress(place)}.
            FinScope reports financial inclusion by district, so these are {district.name}&rsquo;s figures.
          </span>
        </p>
      )}

      <dl className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
        {MEASURES.map((measure) => (
          <MeasureCell key={measure.id} district={district} id={measure.id} label={measure.label} />
        ))}
      </dl>

      {excludedAdults !== undefined && (
        <p className="mt-4 text-[13.5px] leading-6 text-ink/80">
          That is about <strong className="font-bold">{formatValue({ format: "count" }, excludedAdults)}</strong> adults in{" "}
          {district.name} using no financial service at all.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        <Link
          href={`/districts/${district.slug}`}
          className="group inline-flex items-center gap-1.5 rounded text-[13.5px] font-bold text-ink hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
        >
          Full {district.name} profile
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
        <Link
          href={`/poverty-dynamics/district-map?layer=${EXCLUSION_ID}`}
          className="group inline-flex items-center gap-1.5 rounded text-[13.5px] font-bold text-cyan-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
        >
          Compare on the map
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-4 text-[12px] leading-5 text-muted">
        FinScope 2024 district access strand. District samples are about 400 adults, so values carry roughly ±3 points.
      </p>
    </div>
  );
}

/** One measure for the district: its value, the national figure, and how far it sits above or below it. */
function MeasureCell({ district, id, label }: { district: District; id: string; label: string }) {
  const indicator = meta(id);
  const value = valueOf(district, id);
  const national = reference(id);

  if (value === undefined) {
    return (
      <div className="bg-white px-4 py-3.5">
        <dt className="text-[12.5px] font-semibold text-muted">{label}</dt>
        <dd className="mt-1 text-[14px] font-semibold text-ink/70">Not reported separately</dd>
      </div>
    );
  }

  const diff = value - national.value;
  const rounded = Math.round(diff);
  const better = indicator.better === "higher" ? diff > 0 : diff < 0;
  const same = rounded === 0;

  return (
    <div className="bg-white px-4 py-3.5">
      <dt className="text-[12.5px] font-semibold text-muted">{label}</dt>
      <dd className="mt-0.5 flex items-baseline gap-2">
        <span className="font-display text-[28px] font-bold leading-none tracking-[-0.03em] text-cyan-ink">
          {formatValue(indicator, value)}
        </span>
        {!same && (
          <span className={cn("inline-flex items-center gap-0.5 text-[12px] font-bold", better ? "text-cyan-ink" : "text-muted")}>
            {diff > 0 ? (
              <ArrowUpIcon className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ArrowDownIcon className="h-3 w-3" aria-hidden="true" />
            )}
            {Math.abs(rounded)} pts
          </span>
        )}
      </dd>
      <p className="mt-1 text-[11.5px] text-muted">
        Rwanda {formatValue(indicator, national.value)}
        {same ? " · about the same" : better ? " · better than average" : " · worse than average"}
      </p>
    </div>
  );
}
