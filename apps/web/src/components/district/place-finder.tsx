"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  foldText,
  listPlaces,
  loadPlaceIndex,
  PLACE_KIND_LABEL,
  placeAddress,
  placeHref,
  placeMatchScore,
  type Place,
  type PlaceKind,
} from "@/lib/places";
import { cn } from "@/lib/utils";

export type FinderDistrict = { name: string; slug: string; province: string };

type FinderResult = {
  key: string;
  kind: "district" | PlaceKind;
  name: string;
  address: string;
  href: string;
  folded: string;
  terms: string;
};

const KIND_ORDER: Record<FinderResult["kind"], number> = { district: 0, sector: 1, cell: 2, village: 3 };
const KIND_LABEL: Record<FinderResult["kind"], string> = { district: "District", ...PLACE_KIND_LABEL };
const RESULT_LIMIT = 8;
const MIN_QUERY_LENGTH = 2;

function placeResult(place: Place): FinderResult {
  return {
    key: place.key,
    kind: place.kind,
    name: place.name,
    address: placeAddress(place),
    href: placeHref(place),
    folded: place.folded,
    terms: place.terms,
  };
}

/**
 * One search box for any place in Rwanda: a district, sector, cell or village. Choosing a district opens its page;
 * choosing a sector, cell or village opens its district's page at the sectors, with that sector selected and its
 * published figures shown. Many names repeat across the country, so every result shows where it lies. The 14,815
 * villages load the first time the box is used.
 */
export function PlaceFinder({
  districts,
  counts,
  tone = "light",
  className,
}: {
  districts: FinderDistrict[];
  counts: { sectors: number; cells: number; villages: number };
  /** Light for white or paper sections, royal for a blue panel. */
  tone?: "light" | "royal";
  className?: string;
}) {
  const router = useRouter();
  const inputId = useId();
  const listId = useId();
  const hintId = useId();
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [places, setPlaces] = useState<FinderResult[]>();
  const [loadFailed, setLoadFailed] = useState(false);

  const districtResults = useMemo(
    () =>
      districts.map((district): FinderResult => ({
        key: `district:${district.slug}`,
        kind: "district",
        name: district.name,
        address: district.province,
        href: `/districts/${district.slug}`,
        folded: foldText(district.name),
        terms: foldText(`${district.province} district akarere`),
      })),
    [districts],
  );

  const startLoading = () => {
    if (places) return;
    setLoadFailed(false);
    const districtNameBySlug = Object.fromEntries(districts.map((district) => [district.slug, district.name]));
    loadPlaceIndex()
      .then((index) => setPlaces(listPlaces(index, districtNameBySlug).map(placeResult)))
      .catch(() => setLoadFailed(true));
  };

  const foldedQuery = foldText(query.trim());
  const searching = foldedQuery.length >= MIN_QUERY_LENGTH;
  const { results, total } = useMemo(() => {
    if (!searching) return { results: [], total: 0 };
    const words = foldedQuery.split(/\s+/);
    const matches = [...districtResults, ...(places ?? [])]
      .map((result) => ({ result, score: placeMatchScore(result, foldedQuery, words) }))
      .filter((match): match is { result: FinderResult; score: number } => match.score !== undefined)
      .sort(
        (first, second) =>
          first.score - second.score ||
          KIND_ORDER[first.result.kind] - KIND_ORDER[second.result.kind] ||
          first.result.name.localeCompare(second.result.name),
      );
    return { results: matches.slice(0, RESULT_LIMIT).map((match) => match.result), total: matches.length };
  }, [districtResults, places, foldedQuery, searching]);

  useEffect(() => setActiveIndex(0), [foldedQuery]);
  const optionId = (index: number) => `${listId}-option-${index}`;
  useEffect(() => {
    if (listOpen) document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listOpen, listId]);

  const choose = (result: FinderResult | undefined) => {
    if (!result) return;
    setListOpen(false);
    setQuery(result.name);
    router.push(result.href);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (listOpen) {
        event.preventDefault();
        setListOpen(false);
      }
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (listOpen) choose(results[activeIndex]);
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!listOpen) setListOpen(true);
      else setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    }
  };

  const loading = searching && !places && !loadFailed;
  const showPanel = listOpen && searching;
  const expanded = showPanel && results.length > 0;
  const onRoyal = tone === "royal";
  const status = !searching
    ? ""
    : results.length
      ? total > results.length
        ? `${results.length} of ${total.toLocaleString("en-US")} places shown. Add the sector or district to narrow it down.`
        : `${total} ${total === 1 ? "place" : "places"} found.`
      : loading
        ? "Loading the cells and villages…"
        : `No place matches “${query.trim()}”.`;

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={inputId} className={cn("text-[15px] font-semibold", onRoyal ? "text-white" : "text-ink")}>
        Find a district, sector, cell or village
      </label>
      <div className="relative mt-2">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-royal"
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded ? optionId(activeIndex) : undefined}
          aria-describedby={hintId}
          value={query}
          placeholder="For example Nyamirambo, Kimihurura or Biryogo"
          onFocus={() => {
            startLoading();
            setListOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setListOpen(true);
            startLoading();
          }}
          onBlur={() => setListOpen(false)}
          onKeyDown={onKeyDown}
          className={cn(
            "h-14 w-full rounded-xl bg-white pl-12 pr-4 text-[16px] font-semibold text-ink placeholder:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2",
            onRoyal ? "focus-visible:ring-cyan" : "ring-1 ring-line focus-visible:ring-royal",
          )}
        />
        {showPanel && (
          <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl bg-white text-left shadow-lift ring-1 ring-line">
            <ul id={listId} role="listbox" aria-label="Places" className="max-h-[23rem] overflow-y-auto py-1.5">
              {results.map((result, index) => (
                <li
                  key={result.key}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === activeIndex}
                  // Keep focus in the box, so the list does not close before the click lands.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => choose(result)}
                  className={cn(
                    "flex cursor-pointer items-baseline gap-3 border-l-[3px] px-4 py-2.5",
                    index === activeIndex ? "border-cyan bg-mist" : "border-transparent",
                  )}
                >
                  <span className="w-[4.25rem] shrink-0 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-royal">
                    {KIND_LABEL[result.kind]}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-ink">{result.name}</span>
                    <span className="block truncate text-[13px] text-muted">{result.address}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-line bg-paper px-4 py-2.5 text-[13px] text-muted">
              {loadFailed ? "Cells and villages could not be loaded. Districts can still be found." : status}
            </p>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {listOpen ? status : ""}
      </p>
      <p id={hintId} className={cn("mt-2.5 text-[13px] leading-5", onRoyal ? "text-white/80" : "text-muted")}>
        All {districts.length} districts, {counts.sectors} sectors, {counts.cells.toLocaleString("en-US")} cells and{" "}
        {counts.villages.toLocaleString("en-US")} villages. NISR publishes poverty estimates down to the sector, so a cell or
        village opens with the figures of its sector.
      </p>
    </div>
  );
}
