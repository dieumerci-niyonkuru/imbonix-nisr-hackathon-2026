"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FocusEvent, type MouseEvent } from "react";
import { ArrowRightIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Fingerprint, OverlapBadge } from "@/components/charts/fingerprint";
import { RankBars } from "@/components/charts/rank-bars";
import { MapLegend } from "@/components/map/map-legend";
import { RwandaMap } from "@/components/map/rwanda-map";
import type { SectorHover } from "@/components/map/maplibre-map";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceLine } from "@/components/ui/source-line";
import { DISTRICTS, PROVINCE_LABEL, rankOf, reference, sortedDistricts, valuesFor } from "@/lib/data";
import { formatDiff, formatValue } from "@/lib/format";
import { DIMENSIONS, MAP_LAYERS, meta, type Dimension } from "@/lib/indicators";
import { scaleFor } from "@/lib/scales";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// MapLibre (about 800 KB) loads only here, and only in the browser.
const MaplibreMap = dynamic(() => import("@/components/map/maplibre-map").then((m) => m.MaplibreMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[460px] w-full rounded-2xl sm:h-[560px]" />,
});

const DIMENSION_ORDER: Dimension[] = ["poverty", "finance", "digital", "nutrition", "shocks", "work", "health", "people"];
const DEFAULT_LAYER = "eicv7_poverty_rate";

type Hover = { slug: string; x: number; y: number };

export function MapExplorer({ initialLayer, initialDistrict }: { initialLayer?: string; initialDistrict?: string }) {
  const [layerId, setLayerId] = useState(
    initialLayer && MAP_LAYERS.some((l) => l.id === initialLayer) ? initialLayer : DEFAULT_LAYER,
  );
  const [selected, setSelected] = useState<string | undefined>(
    initialDistrict && DISTRICTS.some((d) => d.slug === initialDistrict) ? initialDistrict : "nyamagabe",
  );
  const [hover, setHover] = useState<Hover | undefined>();
  const [view, setView] = useState<"interactive" | "simple">("interactive");
  const [basemap, setBasemap] = useState(true);
  const [notice, setNotice] = useState<string>();
  const [sectorHover, setSectorHover] = useState<SectorHover>();
  const [sectorLegend, setSectorLegend] = useState<{ color: string; from: number; to: number }[]>();
  const frame = useRef<HTMLDivElement>(null);

  // Keep the address shareable: ?layer=&district= (read on the server by the map page).
  useEffect(() => {
    const params = new URLSearchParams({ layer: layerId, ...(selected ? { district: selected } : {}) });
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [layerId, selected]);

  const indicator = meta(layerId);
  const dimension = indicator.dimension;
  const scale = useMemo(() => scaleFor(indicator, valuesFor(layerId)), [indicator, layerId]);
  const ref = reference(layerId);
  const fills = useMemo(
    () => Object.fromEntries(DISTRICTS.map((d) => [d.slug, scale.color(d.values[layerId]?.v)])),
    [scale, layerId],
  );
  const rows = useMemo(
    () =>
      sortedDistricts(layerId, indicator.better).map((d) => {
        const value = d.values[layerId]!;
        return { slug: d.slug, name: d.name, value: value.v, lo: value.lo, hi: value.hi, color: scale.color(value.v) };
      }),
    [layerId, indicator.better, scale],
  );

  const district = DISTRICTS.find((d) => d.slug === selected);
  const hovered = hover ? DISTRICTS.find((d) => d.slug === hover.slug) : undefined;

  const onHover = (slug: string | undefined, event?: MouseEvent<SVGPathElement> | FocusEvent<SVGPathElement>) => {
    if (!slug || !frame.current) return setHover(undefined);
    const box = frame.current.getBoundingClientRect();
    if (event && "clientX" in event) {
      setHover({ slug, x: event.clientX - box.left, y: event.clientY - box.top });
    } else if (event) {
      const target = (event.target as SVGPathElement).getBoundingClientRect();
      setHover({ slug, x: target.left + target.width / 2 - box.left, y: target.top + target.height / 2 - box.top });
    }
  };

  const describe = (slug: string) => {
    const d = DISTRICTS.find((x) => x.slug === slug)!;
    return `${d.name}: ${formatValue(indicator, d.values[layerId]?.v)}`;
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="card overflow-hidden">
        {/* Layer picker */}
        <div className="border-b border-line">
          {/* Dimensions as a tab bar: the chosen one has a cyan underline. It scrolls sideways on a phone. */}
          <div className="flex gap-0.5 overflow-x-auto border-b border-line px-3 sm:px-4" aria-label="Dimension">
            {DIMENSION_ORDER.map((dim) => {
              const active = dim === dimension;
              const first = MAP_LAYERS.find((l) => l.dimension === dim);
              if (!first) return null;
              return (
                <button
                  key={dim}
                  type="button"
                  onClick={() => setLayerId(DIMENSIONS[dim].headline ?? first.id)}
                  aria-pressed={active}
                  className={`-mb-px shrink-0 border-b-[3px] px-2 pb-3 pt-3.5 text-[13.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-ink ${
                    active ? "border-cyan text-navy-900" : "border-transparent text-muted hover:border-line hover:text-ink"
                  }`}
                >
                  {DIMENSIONS[dim].label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 p-4 sm:px-5">
            {MAP_LAYERS.filter((l) => l.dimension === dimension).map((layer) => {
              const active = layer.id === layerId;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setLayerId(layer.id)}
                  aria-pressed={active}
                  className={`rounded-md border px-3 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink ${
                    active
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-line bg-white text-ink/80 hover:border-cyan-ink hover:text-ink"
                  }`}
                >
                  {layer.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-xl">
              <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink sm:text-2xl">{indicator.short}</h2>
              <p className="mt-1 text-[13px] leading-5 text-muted">{DIMENSIONS[dimension].question}</p>
            </div>
            <div className="text-right">
              <p className="text-[12.5px] font-semibold text-muted">{ref.label}</p>
              <p className="font-display text-2xl font-bold text-ink">{formatValue(indicator, ref.value)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-line bg-paper p-1" role="radiogroup" aria-label="Map view">
              {(
                [
                  ["interactive", "Interactive · zoom to sectors"],
                  ["simple", "Simple map"],
                ] as const
              ).map(([id, text]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={view === id}
                  onClick={() => {
                    setView(id);
                    setHover(undefined);
                    setSectorHover(undefined);
                  }}
                  className={cn(
                    "rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                    view === id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
                  )}
                >
                  {text}
                </button>
              ))}
            </div>
            {view === "interactive" && (
              <label className="flex items-center gap-2 text-[12.5px] font-semibold text-muted">
                <input
                  type="checkbox"
                  checked={basemap}
                  onChange={(e) => setBasemap(e.target.checked)}
                  className="h-4 w-4 rounded border-line accent-cyan-ink"
                />
                Background map with place names
              </label>
            )}
          </div>
          {notice && (
            <p className="mt-3 rounded-lg bg-cyan-soft px-3 py-2 text-[12.5px] text-ink ring-1 ring-inset ring-cyan/50">
              {notice}
            </p>
          )}

          <div ref={frame} className={cn("relative mx-auto mt-4", view === "simple" && "max-w-[700px]")}>
            {view === "interactive" ? (
              <MaplibreMap
                fills={fills}
                selected={selected}
                basemap={basemap}
                label={`Interactive map of Rwanda's districts: ${indicator.short}. Select a district to zoom to its sectors.`}
                onSelect={setSelected}
                onHover={(info) => setHover(info)}
                onSectorHover={setSectorHover}
                onSectorLegend={setSectorLegend}
                onBasemapUnavailable={() => {
                  setBasemap(false);
                  setNotice("The background map could not load, so the map is shown without it.");
                }}
                onUnavailable={() => {
                  setView("simple");
                  setNotice("The interactive map needs WebGL, which this browser does not provide, so the simple map is shown.");
                }}
              />
            ) : (
              <RwandaMap
                fills={fills}
                title={`Map of Rwanda's districts: ${indicator.short}`}
                selected={selected}
                hovered={hover?.slug}
                onSelect={setSelected}
                onHover={onHover}
                describe={describe}
                showNames
              />
            )}
            {sectorHover && view === "interactive" && (
              <div
                className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl bg-navy-900 px-3.5 py-3 text-white shadow-lift"
                style={{
                  left: Math.min(Math.max(sectorHover.x, 110), (frame.current?.clientWidth ?? 600) - 110),
                  top: sectorHover.y,
                }}
              >
                <p className="text-[12.5px] font-semibold text-white/60">{sectorHover.district} district</p>
                <p className="font-display text-base font-bold">{sectorHover.sector} sector</p>
                <p className="mt-1 text-[13px]">
                  Poverty (small area estimate):{" "}
                  <strong className="text-cyan">{sectorHover.povertySae === null ? "n/a" : `${sectorHover.povertySae}%`}</strong>
                </p>
                <p className="text-[12px] text-white/70">
                  Multidimensionally poor (census 2022):{" "}
                  {sectorHover.mpiHeadcount === null ? "n/a" : `${sectorHover.mpiHeadcount}%`}
                </p>
              </div>
            )}
            {hover && hovered && (
              <div
                className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl bg-navy-900 px-3.5 py-3 text-white shadow-lift"
                style={{ left: Math.min(Math.max(hover.x, 110), (frame.current?.clientWidth ?? 600) - 110), top: hover.y }}
              >
                <p className="text-[12.5px] font-semibold text-white/60">{PROVINCE_LABEL[hovered.province]}</p>
                <p className="font-display text-base font-bold">{hovered.name}</p>
                <p className="tabular mt-1 text-xl font-bold text-cyan">{formatValue(indicator, hovered.values[layerId]?.v)}</p>
                {hovered.values[layerId]?.lo !== undefined && (
                  <p className="tabular text-[11px] text-white/60">
                    95% CI {formatValue(indicator, hovered.values[layerId]!.lo)} to{" "}
                    {formatValue(indicator, hovered.values[layerId]!.hi)}
                  </p>
                )}
                {(() => {
                  const rank = rankOf(hovered, indicator);
                  return rank ? (
                    <p className="mt-1 text-[11px] text-white/70">
                      Rank {rank.rank} of {rank.of} · 1 = most affected
                    </p>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          <div className="mx-auto mt-5 max-w-[700px] space-y-3">
            <MapLegend indicator={indicator} scale={scale} />
            {view === "interactive" && selected && sectorLegend && district && (
              <div className="rounded-xl bg-paper p-3">
                <p className="text-[12px] font-semibold text-ink">
                  Sectors of {district.name}: poverty rate, small area estimate (EICV7 with census 2022)
                </p>
                <div className="mt-2 flex items-stretch gap-1">
                  {sectorLegend.map((c) => (
                    <div key={c.color} className="min-w-0 flex-1">
                      <div className="h-2 rounded-full" style={{ background: c.color }} />
                      <p className="tabular mt-1 text-center text-[10.5px] font-semibold leading-tight text-muted">
                        {c.from === c.to ? `${c.from}%` : `${c.from} to ${c.to}%`}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  Model estimates, coloured within this district only; not comparable across districts.
                </p>
              </div>
            )}
            <SourceLine id={layerId} />
            {indicator.note && (
              <p className="flex gap-2 text-[12px] leading-5 text-muted">
                <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" /> {indicator.note}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* District panel: it runs down the right column beside the map and the ranking, so while it stays in view it
          never covers either of them. */}
      <aside className="space-y-6 xl:sticky xl:top-24 xl:row-span-2 xl:self-start">
        <div className="card p-5">
          {district ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12.5px] font-semibold text-muted">{PROVINCE_LABEL[district.province]}</p>
                  <h3 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">{district.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(undefined)}
                  className="text-[12px] font-semibold text-muted hover:text-ink"
                >
                  Clear
                </button>
              </div>
              <div className="mt-4 rounded-xl bg-paper p-4">
                <p className="text-[12px] font-semibold text-muted">{indicator.short}</p>
                <p className="mt-0.5 font-display text-3xl font-bold text-ink">
                  {formatValue(indicator, district.values[layerId]?.v)}
                </p>
                {district.values[layerId] !== undefined && (
                  <p className="mt-1 text-[12px] text-muted">
                    {formatDiff(indicator, district.values[layerId]!.v - ref.value)} vs{" "}
                    {ref.label === "Rwanda" ? "Rwanda" : "the district median"}
                    {(() => {
                      const rank = rankOf(district, indicator);
                      return rank ? ` · rank ${rank.rank} of ${rank.of}` : "";
                    })()}
                  </p>
                )}
              </div>
              <div className="mt-5">
                <div className="mb-3 space-y-2">
                  <p className="text-[13px] font-bold text-ink">Four dimensions</p>
                  <OverlapBadge district={district} />
                </div>
                <Fingerprint district={district} />
                <p className="mt-3 text-[11px] leading-4 text-muted">
                  Rank 1 = most affected of 30. Ranks are indicative: many districts overlap within survey error.
                </p>
              </div>
              <Button asChild variant="default" className="mt-5 w-full">
                <Link href={`/districts/${district.slug}`}>
                  Open {district.name} profile <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <div className="py-6 text-center">
              <p className="font-display text-lg font-bold text-ink">Select a district</p>
              <p className="mt-1 text-sm text-muted">Click the map or the ranking to see its four-dimension profile.</p>
            </div>
          )}
        </div>
      </aside>

      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow" style={{ color: DIMENSIONS[dimension].ink }}>
              All 30 districts
            </p>
            <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-ink">{indicator.short}, ranked</h3>
          </div>
          <p className="max-w-md text-[12px] leading-5 text-muted">
            Click a district to select it. Where confidence intervals overlap, the difference between two districts may not be
            real.
          </p>
        </div>
        <div className="mt-5 columns-1 gap-8 lg:columns-2">
          <RankBars indicator={indicator} rows={rows} reference={ref} selected={selected} onSelect={setSelected} />
        </div>
      </div>
    </div>
  );
}
