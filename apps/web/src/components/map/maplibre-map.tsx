"use client";

import {
  AttributionControl,
  LngLatBounds,
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { sectorColors } from "@/lib/sector-colors";
import { INK, NO_DATA, PAPER, WHITE } from "@/lib/palette";

type Style = Exclude<Parameters<MapLibreMap["setStyle"]>[0], string | null>;
type Filter = Parameters<MapLibreMap["setFilter"]>[1];

type Geometry = { type: "MultiPolygon"; coordinates: number[][][][] };
type DistrictFeature = { type: "Feature"; properties: { name: string; slug: string; province: string }; geometry: Geometry };
type SectorProps = {
  district: string;
  districtSlug: string;
  sector: string;
  povertySae: number | null;
  mpiHeadcount: number | null;
  severelyPoor: number | null;
  population: number | null;
};
type SectorFeature = { type: "Feature"; properties: SectorProps; geometry: Geometry };
type Collection<F> = { type: "FeatureCollection"; features: F[] };

export type SectorHover = SectorProps & { x: number; y: number };

// The worker module is copied into public/ by scripts/copy-maplibre-worker.mjs (bundlers do not emit it).
setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");

const BASEMAP_URL = "https://tiles.openfreemap.org/styles/positron";
/** How long to wait for the background map before showing the plain style instead. */
const BASEMAP_TIMEOUT_MS = 12000;
const RWANDA: [number, number, number, number] = [28.86, -2.84, 30.9, -1.05];
const EMPTY = NO_DATA;

const PLAIN_STYLE: Style = {
  version: 8,
  sources: {},
  layers: [{ id: "background", type: "background", paint: { "background-color": PAPER } }],
};

/** Is WebGL available? MapLibre cannot render without it. */
export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function boundsOf(geometry: Geometry): [number, number, number, number] {
  const b = new LngLatBounds();
  for (const polygon of geometry.coordinates) for (const [lng, lat] of polygon[0]) b.extend([lng, lat]);
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

/** A MapLibre "match" expression from slug to colour (typed loosely: MapLibre types paint values per layer). */
function matchBySlug(fills: Record<string, string>): never {
  const pairs = Object.entries(fills).flat();
  return (pairs.length ? ["match", ["get", "slug"], ...pairs, EMPTY] : EMPTY) as never;
}

/**
 * Interactive district map (MapLibre GL). Districts are shaded with the same colours as the static map; selecting a
 * district zooms to it and shows its sectors, shaded by EICV7 small-area poverty within the district.
 */
export function MaplibreMap({
  fills,
  selected,
  basemap,
  onSelect,
  onHover,
  onSectorHover,
  onSectorLegend,
  onBasemapUnavailable,
  onUnavailable,
  label,
}: {
  fills: Record<string, string>;
  selected?: string;
  basemap: boolean;
  onSelect: (slug: string) => void;
  onHover: (info: { slug: string; x: number; y: number } | undefined) => void;
  onSectorHover: (info: SectorHover | undefined) => void;
  onSectorLegend: (legend: { color: string; from: number; to: number }[] | undefined) => void;
  onBasemapUnavailable: () => void;
  onUnavailable: () => void;
  label: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const data = useRef<{ districts?: Collection<DistrictFeature>; sectors?: Collection<SectorFeature> }>({});
  const latest = useRef({ fills, selected, onSelect, onHover, onSectorHover, onSectorLegend });
  latest.current = { fills, selected, onSelect, onHover, onSectorHover, onSectorLegend };
  const [ready, setReady] = useState(false);

  // Create the map once per basemap choice.
  useEffect(() => {
    if (!container.current) return;
    if (!webglAvailable()) {
      onUnavailable();
      return;
    }
    let loaded = false;
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: container.current,
        style: basemap ? BASEMAP_URL : PLAIN_STYLE,
        bounds: RWANDA,
        fitBoundsOptions: { padding: 16 },
        maxBounds: [
          [27.9, -3.6],
          [31.9, -0.3],
        ],
        minZoom: 6.5,
        maxZoom: 13,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
      });
    } catch {
      onUnavailable();
      return;
    }
    mapRef.current = map;
    map.touchZoomRotate.disableRotation();
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: "Boundaries: NISR via geoBoundaries (CC BY 4.0)",
      }),
      "bottom-right",
    );

    map.on("error", (event) => {
      if (process.env.NODE_ENV !== "production") console.warn("[map]", event.error?.message ?? event);
    });
    // A background map that has not loaded in time (offline, blocked tiles) falls back to the plain style.
    const fallback = basemap
      ? window.setTimeout(() => {
          if (!loaded) onBasemapUnavailable();
        }, BASEMAP_TIMEOUT_MS)
      : undefined;

    map.on("load", async () => {
      loaded = true;
      window.clearTimeout(fallback);
      try {
        const [districts, sectors] = await Promise.all([
          fetch("/geo/districts.geojson").then((r) => r.json() as Promise<Collection<DistrictFeature>>),
          fetch("/geo/sectors.geojson").then((r) => r.json() as Promise<Collection<SectorFeature>>),
        ]);
        data.current = { districts, sectors };
        // Keep basemap place names above the data layers.
        const firstSymbol = map.getStyle().layers?.find((l) => l.type === "symbol")?.id;
        map.addSource("districts", { type: "geojson", data: districts as never });
        map.addSource("sectors", { type: "geojson", data: { type: "FeatureCollection", features: [] } as never });
        map.addLayer(
          {
            id: "district-fill",
            type: "fill",
            source: "districts",
            paint: { "fill-color": matchBySlug(latest.current.fills) as never, "fill-opacity": basemap ? 0.82 : 1 },
          },
          firstSymbol,
        );
        map.addLayer(
          { id: "sector-fill", type: "fill", source: "sectors", paint: { "fill-color": EMPTY, "fill-opacity": 0.92 } },
          firstSymbol,
        );
        map.addLayer(
          { id: "sector-line", type: "line", source: "sectors", paint: { "line-color": WHITE, "line-width": 0.8 } },
          firstSymbol,
        );
        map.addLayer(
          { id: "district-line", type: "line", source: "districts", paint: { "line-color": WHITE, "line-width": 1.2 } },
          firstSymbol,
        );
        map.addLayer({
          id: "district-hover",
          type: "line",
          source: "districts",
          filter: ["==", ["get", "slug"], ""],
          paint: { "line-color": INK, "line-width": 1.6 },
        });
        map.addLayer({
          id: "district-selected",
          type: "line",
          source: "districts",
          filter: ["==", ["get", "slug"], ""],
          paint: { "line-color": INK, "line-width": 2.8 },
        });

        map.on("mousemove", "district-fill", (e) => {
          const slug = e.features?.[0]?.properties?.slug as string | undefined;
          map.getCanvas().style.cursor = slug ? "pointer" : "";
          map.setFilter("district-hover", ["==", ["get", "slug"], slug ?? ""] as Filter);
          const onSectors = map.queryRenderedFeatures(e.point, { layers: ["sector-fill"] }).length > 0;
          latest.current.onHover(slug && !onSectors ? { slug, x: e.point.x, y: e.point.y } : undefined);
        });
        map.on("mouseleave", "district-fill", () => {
          map.getCanvas().style.cursor = "";
          map.setFilter("district-hover", ["==", ["get", "slug"], ""] as Filter);
          latest.current.onHover(undefined);
        });
        map.on("click", "district-fill", (e) => {
          const slug = e.features?.[0]?.properties?.slug as string | undefined;
          if (slug) latest.current.onSelect(slug);
        });
        map.on("mousemove", "sector-fill", (e) => {
          const props = e.features?.[0]?.properties as SectorProps | undefined;
          latest.current.onSectorHover(props ? { ...props, x: e.point.x, y: e.point.y } : undefined);
        });
        map.on("mouseleave", "sector-fill", () => latest.current.onSectorHover(undefined));
        setReady(true);
      } catch {
        onUnavailable();
      }
    });

    return () => {
      window.clearTimeout(fallback);
      setReady(false);
      map.remove();
      mapRef.current = null;
    };
    // The callbacks are read through `latest`; only the basemap choice recreates the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basemap]);

  // Recolour districts when the layer changes.
  useEffect(() => {
    const map = mapRef.current;
    if (ready && map?.getLayer("district-fill")) map.setPaintProperty("district-fill", "fill-color", matchBySlug(fills));
  }, [fills, ready]);

  // Zoom to the selected district and show its sectors.
  useEffect(() => {
    const map = mapRef.current;
    const { districts, sectors } = data.current;
    if (!ready || !map || !districts || !sectors) return;
    map.setFilter("district-selected", ["==", ["get", "slug"], selected ?? ""] as Filter);
    const feature = districts.features.find((f) => f.properties.slug === selected);
    const own = sectors.features.filter((f) => f.properties.districtSlug === selected);
    (map.getSource("sectors") as GeoJSONSource).setData({ type: "FeatureCollection", features: own } as never);
    if (feature && own.length) {
      const { colors, legend } = sectorColors(own.map((f) => f.properties));
      map.setPaintProperty("sector-fill", "fill-color", [
        "match",
        ["get", "sector"],
        ...Object.entries(colors).flat(),
        EMPTY,
      ] as never);
      latest.current.onSectorLegend(legend);
      map.fitBounds(boundsOf(feature.geometry), { padding: 40, maxZoom: 11, duration: 900 });
    } else {
      latest.current.onSectorLegend(undefined);
      map.fitBounds(RWANDA, { padding: 16, duration: 900 });
    }
  }, [selected, ready]);

  return (
    <div className="relative">
      <div
        ref={container}
        className="h-[460px] w-full overflow-hidden rounded-2xl bg-paper sm:h-[560px]"
        role="application"
        aria-label={label}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-paper/80" aria-live="polite">
          <p className="text-[13px] font-semibold text-muted">Loading the interactive map…</p>
        </div>
      )}
    </div>
  );
}
