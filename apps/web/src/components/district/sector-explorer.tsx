"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/components/ui/status-badge";
import { DIMENSIONS } from "@/lib/indicators";
import { SECTOR_MEASURES, type SectorMeasure, type SectorRow } from "@/lib/sectors";
import { INK, NO_DATA, WHITE } from "@/lib/palette";

const RAMP = DIMENSIONS.poverty.ramp;
const pct = (v: number | null | undefined) => (v === null || v === undefined ? "–" : `${v.toFixed(1)}%`);
type SortKey = "sector" | "population" | SectorMeasure;

/** Sector map and table for one district. Colours compare sectors within the district only. */
export function SectorExplorer({ district, sectors }: { district: string; sectors: SectorRow[] }) {
  const [measure, setMeasure] = useState<SectorMeasure>("povertySae");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "povertySae", desc: true });
  const [hover, setHover] = useState<{ sector: string; x: number; y: number }>();
  const [rowHover, setRowHover] = useState<string>();
  const frame = useRef<HTMLDivElement>(null);
  const info = SECTOR_MEASURES.find((m) => m.id === measure)!;

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
  const onMove = (sector: string, event: MouseEvent<SVGPathElement>) => {
    const box = frame.current?.getBoundingClientRect();
    if (box) setHover({ sector, x: event.clientX - box.left, y: event.clientY - box.top });
  };
  const header = (key: SortKey, label: string, align = "text-right") => (
    <th scope="col" className={`px-3 py-2.5 ${align}`}>
      <button
        type="button"
        onClick={() => setSort((s) => ({ key, desc: s.key === key ? !s.desc : key !== "sector" }))}
        className="inline-flex items-center gap-1 font-semibold hover:text-ink"
      >
        {label}
        {sort.key === key && <span aria-hidden="true">{sort.desc ? "↓" : "↑"}</span>}
      </button>
    </th>
  );

  return (
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
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                m.id === measure ? "bg-navy-900 text-white" : "bg-paper text-ink/80 hover:bg-line/70"
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
                  role="img"
                  aria-label={`${s.sector}: ${s[measure] ?? "no data"}%`}
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
              .filter((s) => s.d && (s.sector === rowHover || s.sector === hover?.sector))
              .map((s) => (
                <path
                  key={`outline-${s.sector}`}
                  d={s.d!}
                  fill="none"
                  stroke={INK}
                  strokeWidth={2.4}
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              ))}
          </svg>
          {hover && hovered && (
            <div
              className="pointer-events-none absolute z-10 w-52 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-xl bg-navy-900 px-3 py-2.5 text-white shadow-lift"
              style={{ left: Math.min(Math.max(hover.x, 104), (frame.current?.clientWidth ?? 400) - 104), top: hover.y }}
            >
              <p className="font-display text-sm font-bold">{hovered.sector}</p>
              <p className="mt-0.5 text-lg font-bold text-sun">{pct(hovered[measure])}</p>
              <p className="text-[11px] text-white/65">{info.short}</p>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-stretch gap-1">
          {legend.map((c) => (
            <div key={c.color} className="min-w-0 flex-1">
              <div className="h-2.5 rounded-full" style={{ background: c.color }} />
              <p className="tabular mt-1 truncate text-center text-[10.5px] font-semibold text-muted">
                {c.from === c.to ? pct(c.from) : `${c.from.toFixed(1)}–${pct(c.to)}`}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted">
          Darker = poorer · colours compare sectors within {district}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
          <StatusBadge status={info.status} /> {info.source}
        </div>
        <p className="mt-2 flex gap-2 text-[12px] leading-5 text-muted">
          <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" /> {info.note}
        </p>
      </div>

      <div className="scrollbar-thin max-h-[560px] overflow-auto rounded-2xl border border-line">
        <table className="w-full min-w-[520px] text-left text-[12.5px]">
          <caption className="sr-only">Sectors of {district}</caption>
          <thead className="sticky top-0 bg-paper text-[11px] uppercase tracking-[0.06em] text-muted">
            <tr>
              {header("sector", "Sector", "text-left")}
              {header("population", "Population 2022")}
              {header("povertySae", "Poverty (SAE)")}
              {header("mpiHeadcount", "MPI poor")}
              {header("severelyPoor", "Severely poor")}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.sector}
                className={`border-t border-line ${hover?.sector === s.sector || rowHover === s.sector ? "bg-royal/5" : "bg-white"}`}
                onMouseEnter={() => setRowHover(s.sector)}
                onMouseLeave={() => setRowHover(undefined)}
              >
                <th scope="row" className="px-3 py-2 font-semibold text-ink">
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle"
                    style={{ background: fill(s[measure]) }}
                  />
                  {s.sector}
                </th>
                <td className="tabular px-3 py-2 text-right text-muted">{s.population?.toLocaleString("en-US") ?? "–"}</td>
                <td className="tabular px-3 py-2 text-right font-semibold text-ink">{pct(s.povertySae)}</td>
                <td className="tabular px-3 py-2 text-right text-ink/85">{pct(s.mpiHeadcount)}</td>
                <td className="tabular px-3 py-2 text-right text-ink/85">{pct(s.severelyPoor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
