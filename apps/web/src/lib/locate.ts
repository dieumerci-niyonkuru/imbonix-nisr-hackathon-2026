/**
 * Resolve a GPS point to the Rwandan district that contains it, using the district boundaries in
 * public/geo/districts.geojson (lng/lat). IMBONIX AI uses this only as silent background context — to understand
 * "my district", "near me" or "here" — and never shows the person their coordinates. The result is just a district
 * name and slug; nothing is stored. Returns null when the point is outside Rwanda or the data cannot be loaded.
 */

type Ring = number[][];
type DistrictFeature = {
  properties: { name: string; slug: string };
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: Ring[] | Ring[][] };
};

let cache: DistrictFeature[] | null = null;

/** Standard ray-casting test: is [lng, lat] inside this ring? */
function inRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

/** Inside the polygon's outer ring and not inside any of its holes. */
function inPolygon(lng: number, lat: number, rings: Ring[]): boolean {
  if (rings.length === 0 || !inRing(lng, lat, rings[0])) return false;
  for (let k = 1; k < rings.length; k += 1) if (inRing(lng, lat, rings[k])) return false;
  return true;
}

export async function districtAt(lat: number, lng: number): Promise<{ name: string; slug: string } | null> {
  try {
    if (!cache) {
      const response = await fetch("/geo/districts.geojson");
      if (!response.ok) return null;
      const geo = (await response.json()) as { features: DistrictFeature[] };
      cache = geo.features;
    }
    for (const feature of cache) {
      const polygons =
        feature.geometry.type === "Polygon"
          ? [feature.geometry.coordinates as Ring[]]
          : (feature.geometry.coordinates as Ring[][]);
      for (const rings of polygons) {
        if (inPolygon(lng, lat, rings)) return { name: feature.properties.name, slug: feature.properties.slug };
      }
    }
    return null;
  } catch {
    return null;
  }
}
