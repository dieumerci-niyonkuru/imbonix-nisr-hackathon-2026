"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { StatusBadge } from "@/components/ui/status-badge";
import { DIMENSIONS } from "@/lib/indicators";
import { INK, NO_DATA, WHITE } from "@/lib/palette";
import { foldText, loadPlaceIndex } from "@/lib/places";
import { SECTOR_MEASURES, type SectorMeasure, type SectorRow } from "@/lib/sectors";
import { cn } from "@/lib/utils";

const RAMP = DIMENSIONS.poverty.ramp;
const pct = (v: number | null | undefined) => (v === null || v === undefined ? "n/a" : `${v.toFixed(1)}%`);
type SortKey = "sector" | "population" | SectorMeasure;

/** The place a search opened the page for: its sector, and the cell and village when it was one of those. */
export type SearchedPlace = { sector: string; cell?: string; village?: string };

type SectorExplorerProps = {
  district: string;
  districtSlug: string;
  sectors: SectorRow[];
  searchedPlace?: SearchedPlace;
};

/** 1st, 2nd, 3rd, 4th… */
function ordinal(position: number): string {
  const lastTwo = position % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${position}th`;
  return `${position}${["th", "st", "nd", "rd"][position % 10] ?? "th"}`;
}

/**
 * The sector explorer with the sector a search link asked for (?sector=, with ?cell= and ?village=) selected. A new
 * link on the same page remounts it, so the selection follows the address.
 */
export function LinkedSectorExplorer(props: Omit<SectorExplorerProps, "searchedPlace">) {
  const params = useSearchParams();
  const sector = params.get("sector");
  const searchedPlace = sector
    ? { sector, cell: params.get("cell") ?? undefined, village: params.get("village") ?? undefined }
    : undefined;
  return <SectorExplorer key={params.toString()} {...props} searchedPlace={searchedPlace} />;
}

/**
 * Sector map and table for one district. Colours compare sectors within the district only. Selecting a sector, on the
 * map or in the table, shows its figures, its rank in the district and its cells and villages.
 */
export function SectorExplorer({ district, districtSlug, sectors, searchedPlace }: SectorExplorerProps) {
  const [measure, setMeasure] = useState<SectorMeasure>("povertySae");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "povertySae", desc: true });
  const [hover, setHover] = useState<{ sector: string; x: number; y: number }>();
  const [rowHover, setRowHover] = useState<string>();
  const [selectedSector, setSelectedSector] = useState<string | undefined>(
    () => sectors.find((row) => searchedPlace && foldText(row.sector) === foldText(searchedPlace.sector))?.sector,
  );
  const frame = useRef<HTMLDivElement>(null);
  const info = SECTOR_MEASURES.find((m) => m.id === measure)!;
  const toggleSector = (sector: string) => setSelectedSector((current) => (current === sector ? undefined : sector));

  const viewBox = useMemo(() => {
    const boxes = sectors.map((s) => s.bbox).filter((b): b is [number, number, number, number] => Boolean(b));
    const x0 = Math.min(...boxes.map((b) => b[0]));
    const y0 = Math.min(...boxes.map((b) => b[1]));
    const x1 = Math.max(...boxes.map((b) => b[2]));
    const y1 = Math.max(...boxes.map((b) => b[3]));
    const pad = Math.max(x1 - x0, y1 - y0) * 0.04;
    return `${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`;
  }, [sectors]);

  const values = sectors
    .map((s) => s[measure])
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  const breaks = [1, 2, 3, 4].map((i) => values[Math.min(values.length - 1, Math.floor((i * values.length) / 5))]);
  const classOf = (v: number) => breaks.filter((b) => v >= b).length;
  const fill = (v: number | null) => (v === null ? NO_DATA : RAMP[classOf(v)]);
  const legend = RAMP.map((color, i) => {
    const members = values.filter((v) => classOf(v) === i);
    return members.length ? { color, from: members[0], to: members[members.length - 1] } : null;
  }).filter(Boolean) as { color: string; from: number; to: number }[];

  const rows = [...sectors].sort((a, b) => {
    if (sort.key === "sector") return sort.desc ? b.sector.localeCompare(a.sector) : a.sector.localeCompare(b.sector);
    const av = a[sort.key] ?? -Infinity;
    const bv = b[sort.key] ?? -Infinity;
    return sort.desc ? bv - av : av - bv;
  });

  const hovered = hover ? sectors.find((s) => s.sector === hover.sector) : undefined;
  const selected = selectedSector ? sectors.find((s) => s.sector === selectedSector) : undefined;
  const onMove = (sector: string, event: MouseEvent<SVGPathElement>) => {
    const box = frame.current?.getBoundingClientRect();
    if (box) setHover({ sector, x: event.clientX - box.left, y: event.clientY - box.top });
  };
  const header = (key: SortKey, label: string, align = "text-right") => (
    <th
      scope="col"
      aria-sort={sort.key === key ? (sort.desc ? "descending" : "ascending") : undefined}
      className={`px-3 py-2.5 ${align}`}
    >
      <button
        type="button"
        onClick={() => setSort((s) => ({ key, desc: s.key === key ? !s.desc : key !== "sector" }))}
        className="inline-flex items-center gap-1 font-semibold hover:text-ink"
      >
        {label}
        {sort.key === key &&
          (sort.desc ? (
            <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
          ))}
      </button>
    </th>
  );

  return (
    <div>
      {selected && (
        <SectorDetail
          key={selected.sector}
          sector={selected}
          sectors={sectors}
          district={district}
          districtSlug={districtSlug}
          searchedPlace={
            searchedPlace && foldText(searchedPlace.sector) === foldText(selected.sector) ? searchedPlace : undefined
          }
          onClose={() => setSelectedSector(undefined)}
        />
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <div className="flex flex-wrap gap-1.5">
            {SECTOR_MEASURES.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={m.id === measure}
                onClick={() => {
                  setMeasure(m.id);
                  setSort({ key: m.id, desc: true });
                }}
                className={`rounded-md border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                  m.id === measure
                    ? "border-cyan bg-cyan text-ink"
                    : "border-line bg-white text-ink/80 hover:border-cyan-ink hover:text-ink"
                }`}
              >
                {m.short}
              </button>
            ))}
          </div>
          <div ref={frame} className="relative mt-4 rounded-2xl border border-line bg-paper/60 p-3">
            <svg viewBox={viewBox} className="h-auto w-full" role="group" aria-label={`Sectors of ${district}: ${info.label}`}>
              {sectors.map((s) =>
                s.d ? (
                  <path
                    key={s.sector}
                    d={s.d}
                    fill={fill(s[measure])}
                    stroke={WHITE}
                    strokeWidth={1.4}
                    vectorEffect="non-scaling-stroke"
                    className="map-shape cursor-pointer outline-none"
                    opacity={hover && hover.sector !== s.sector ? 0.8 : 1}
                    tabIndex={0}
                    role="button"
                    aria-pressed={s.sector === selectedSector}
                    aria-label={`${s.sector}: ${s[measure] ?? "no data"}%. Select to see its figures, cells and villages.`}
                    onClick={() => toggleSector(s.sector)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleSector(s.sector);
                      }
                    }}
                    onMouseMove={(e) => onMove(s.sector, e)}
                    onMouseLeave={() => setHover(undefined)}
                    onFocus={(e) => {
                      const box = frame.current?.getBoundingClientRect();
                      const t = (e.target as SVGPathElement).getBoundingClientRect();
                      if (box)
                        setHover({ sector: s.sector, x: t.left + t.width / 2 - box.left, y: t.top + t.height / 2 - box.top });
                    }}
                    onBlur={() => setHover(undefined)}
                  />
                ) : null,
              )}
              {sectors
                .filter((s) => s.d && (s.sector === rowHover || s.sector === hover?.sector || s.sector === selectedSector))
                .map((s) => (
                  <path
                    key={`outline-${s.sector}`}
                    d={s.d!}
                    fill="none"
                    stroke={INK}
                    strokeWidth={s.sector === selectedSector ? 3.2 : 2.4}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                ))}
            </svg>
            {hover && hovered && (
              <div
                className="pointer-events-none absolute z-10 w-52 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-xl bg-white px-3 py-2.5 text-ink shadow-lift ring-1 ring-line"
                style={{ left: Math.min(Math.max(hover.x, 104), (frame.current?.clientWidth ?? 400) - 104), top: hover.y }}
              >
                <p className="font-display text-sm font-bold">{hovered.sector}</p>
                <p className="mt-0.5 text-lg font-bold text-cyan-ink">{pct(hovered[measure])}</p>
                <p className="text-[11px] text-muted">{info.short}</p>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-stretch gap-1">
            {legend.map((c) => (
              <div key={c.color} className="min-w-0 flex-1">
                <div className="h-2.5 rounded-full" style={{ background: c.color }} />
                <p className="tabular mt-1 truncate text-center text-[10.5px] font-semibold text-muted">
                  {c.from === c.to ? pct(c.from) : `${c.from.toFixed(1)} to ${pct(c.to)}`}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-1 text-[12px] font-semibold text-muted">Darker = poorer · colours compare sectors within {district}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <StatusBadge status={info.status} /> {info.source}
          </div>
          <p className="mt-2 flex gap-2 text-[12px] leading-5 text-muted">
            <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" /> {info.note}
          </p>
        </div>

        <div className="scrollbar-thin max-h-[560px] overflow-auto rounded-2xl border border-line">
          <table className="w-full min-w-[520px] text-left text-[12.5px]">
            <caption className="sr-only">Sectors of {district}. Select a sector to see its cells and villages.</caption>
            <thead className="sticky top-0 bg-paper text-[12.5px] text-muted">
              <tr>
                {header("sector", "Sector", "text-left")}
                {header("population", "Population 2022")}
                {header("povertySae", "Poverty (SAE)")}
                {header("mpiHeadcount", "MPI poor")}
                {header("severelyPoor", "Severely poor")}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const isSelected = s.sector === selectedSector;
                return (
                  <tr
                    key={s.sector}
                    className={cn(
                      "border-t border-line",
                      isSelected ? "bg-mist" : hover?.sector === s.sector || rowHover === s.sector ? "bg-cyan-ink/5" : "bg-white",
                    )}
                    onMouseEnter={() => setRowHover(s.sector)}
                    onMouseLeave={() => setRowHover(undefined)}
                  >
                    <th
                      scope="row"
                      className={cn(
                        "border-l-[3px] px-3 py-2 font-semibold text-ink",
                        isSelected ? "border-cyan" : "border-transparent",
                      )}
                    >
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleSector(s.sector)}
                        className="inline-flex items-center rounded text-left underline-offset-4 hover:text-cyan-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                      >
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ background: fill(s[measure]) }}
                          aria-hidden="true"
                        />
                        {s.sector}
                      </button>
                    </th>
                    <td className="tabular px-3 py-2 text-right text-muted">{s.population?.toLocaleString("en-US") ?? "n/a"}</td>
                    <td className="tabular px-3 py-2 text-right font-semibold text-ink">{pct(s.povertySae)}</td>
                    <td className="tabular px-3 py-2 text-right text-ink/85">{pct(s.mpiHeadcount)}</td>
                    <td className="tabular px-3 py-2 text-right text-ink/85">{pct(s.severelyPoor)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** Where a sector stands in its district on one measure: "3rd highest of 15 sectors in Gasabo". */
function rankPhrase(sectors: SectorRow[], sector: SectorRow, measure: SectorMeasure, district: string): string | undefined {
  const value = sector[measure];
  if (value === null) return undefined;
  const ranked = sectors.map((row) => row[measure]).filter((other): other is number => other !== null);
  const position = ranked.filter((other) => other > value).length + 1;
  if (position === 1) return `Highest of ${ranked.length} sectors in ${district}`;
  if (position === ranked.length) return `Lowest of ${ranked.length} sectors in ${district}`;
  return `${ordinal(position)} highest of ${ranked.length} sectors in ${district}`;
}

/** The selected sector: its figures and rank in the district, and the cells and villages it contains. */
function SectorDetail({
  sector,
  sectors,
  district,
  districtSlug,
  searchedPlace,
  onClose,
}: {
  sector: SectorRow;
  sectors: SectorRow[];
  district: string;
  districtSlug: string;
  searchedPlace?: SearchedPlace;
  onClose: () => void;
}) {
  const searchedName = searchedPlace?.village
    ? `${searchedPlace.village} village`
    : searchedPlace?.cell
      ? `${searchedPlace.cell} cell`
      : undefined;
  return (
    <section
      aria-label={`${sector.sector} sector`}
      className="mb-8 rounded-xl border border-t-[3px] border-line border-t-cyan bg-white p-5 shadow-card sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {searchedName && (
            <p className="text-[15px] leading-6 text-ink/85">
              You searched for <strong className="font-semibold text-ink">{searchedName}</strong>
              {searchedPlace?.village && searchedPlace.cell ? ` in ${searchedPlace.cell} cell` : ""}. NISR does not publish
              figures for a single {searchedPlace?.village ? "village" : "cell"}, so these are for the sector it lies in.
            </p>
          )}
          <h3 className={cn("font-display text-2xl font-bold tracking-[-0.02em] text-ink", searchedName && "mt-3")}>
            {sector.sector} sector
          </h3>
          <p className="mt-1 text-[14px] text-muted">
            {district} district
            {sector.population !== null && ` · ${sector.population.toLocaleString("en-US")} residents in 2022`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-cyan-ink hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          Clear selection
        </button>
      </div>

      <dl className="mt-6 grid gap-5 sm:grid-cols-3">
        {SECTOR_MEASURES.map((measure) => (
          <div key={measure.id} className="border-l-[3px] border-cyan-ink pl-4">
            <dt className="text-[13px] font-semibold text-muted">{measure.label}</dt>
            <dd className="tabular mt-1 font-display text-3xl font-bold tracking-[-0.02em] text-ink">
              {pct(sector[measure.id])}
            </dd>
            <dd className="mt-1 text-[13px] leading-5 text-muted">
              {rankPhrase(sectors, sector, measure.id, district) ?? "Not published"}
            </dd>
          </div>
        ))}
      </dl>

      <CellsAndVillages
        sectorName={sector.sector}
        districtSlug={districtSlug}
        searchedCell={searchedPlace?.cell}
        searchedVillage={searchedPlace?.village}
      />
    </section>
  );
}

type CellGroup = { name: string; villages: string[] };

/** The cells of a sector and the villages of each, from the place index, with the searched ones open and marked. */
function CellsAndVillages({
  sectorName,
  districtSlug,
  searchedCell,
  searchedVillage,
}: {
  sectorName: string;
  districtSlug: string;
  searchedCell?: string;
  searchedVillage?: string;
}) {
  const [cells, setCells] = useState<CellGroup[]>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPlaceIndex()
      .then((index) => {
        if (cancelled) return;
        const sectorIndex = index.sectors.findIndex(
          ([name, slug]) => slug === districtSlug && foldText(name) === foldText(sectorName),
        );
        const groups = new Map<number, CellGroup>();
        index.cells.forEach(([name, cellSector], cellIndex) => {
          if (cellSector === sectorIndex) groups.set(cellIndex, { name, villages: [] });
        });
        index.villages.forEach(([name, cellIndex]) => groups.get(cellIndex)?.villages.push(name));
        setCells(
          [...groups.values()]
            .map((group) => ({ ...group, villages: group.villages.sort((first, second) => first.localeCompare(second)) }))
            .sort((first, second) => first.name.localeCompare(second.name)),
        );
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [sectorName, districtSlug]);

  const villageCount = cells?.reduce((count, cell) => count + cell.villages.length, 0) ?? 0;
  const isSearched = (name: string, searched?: string) => Boolean(searched) && foldText(name) === foldText(searched!);

  return (
    <div className="mt-7 border-t border-line pt-6">
      <h4 className="font-display text-[17px] font-bold text-ink">Cells and villages in {sectorName} sector</h4>
      <p className="mt-1 text-[13.5px] leading-6 text-muted">
        {failed
          ? "The list of cells and villages could not be loaded."
          : cells
            ? `${cells.length} cells and ${villageCount} villages, as mapped in the 2012 administrative boundaries (geoBoundaries). Open a cell to see its villages.`
            : "Loading the cells and villages…"}
      </p>
      {cells && cells.length > 0 && (
        <ul className="mt-4 grid items-start gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cells.map((cell) => {
            const searched = isSearched(cell.name, searchedCell);
            return (
              <li key={cell.name}>
                <details
                  open={searched}
                  className={cn("group rounded-lg border bg-white", searched ? "border-cyan" : "border-line")}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-[14px] font-semibold text-ink hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-ink [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 truncate">
                      {cell.name} cell
                      <span className="ml-2 font-normal text-muted">
                        {cell.villages.length} {cell.villages.length === 1 ? "village" : "villages"}
                      </span>
                    </span>
                    <ChevronDownIcon
                      className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <ul className="flex flex-wrap gap-1.5 border-t border-line px-3.5 py-3">
                    {cell.villages.map((village, villageIndex) => {
                      const found = searched && isSearched(village, searchedVillage);
                      return (
                        <li
                          key={`${village}-${villageIndex}`}
                          className={cn(
                            "rounded px-2 py-0.5 text-[13px]",
                            found ? "bg-cyan font-semibold text-ink" : "bg-paper text-ink/85",
                          )}
                        >
                          {village}
                          {found && <span className="sr-only"> (the village you searched for)</span>}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
