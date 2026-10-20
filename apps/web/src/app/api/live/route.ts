import { NextResponse } from "next/server";
import pkg from "../../../../package.json";
import { counts } from "@/lib/api-store";

/**
 * Status for the Data page's "live API" panel. By default the JSON API is served from this same deployment
 * (`app/api/v1/*`), so the status is read straight from the in-app store — always live, no network call. If `API_URL`
 * is set instead (a standalone API, e.g. on Railway), the Next.js server checks that one server-side, so the API's URL
 * stays off the browser and no CORS is involved. Either way the panel shows the version and the counts being served.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL?.replace(/\/+$/, "");
const TIMEOUT_MS = 4000;

const ENDPOINTS = [
  "GET /api/v1/indicators",
  "GET /api/v1/indicators/:id",
  "GET /api/v1/districts",
  "GET /api/v1/districts/:slug",
  "GET /api/v1/districts/:slug/sectors",
];

async function fetchJson(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal, headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function GET() {
  const headers = { "Cache-Control": "no-store" };

  // Default: the API ships with this deployment, so it is always available — report it from the in-app store.
  if (!API_URL) {
    return NextResponse.json(
      {
        configured: true,
        connected: true,
        source: "in-app",
        service: "imbonix-api",
        version: pkg.version,
        counts,
        endpoints: ENDPOINTS,
      },
      { headers },
    );
  }

  // A standalone API is configured: check it server-side.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const health = await fetchJson(`${API_URL}/health`, controller.signal);
    let endpoints: string[] = ENDPOINTS;
    try {
      const index = await fetchJson(`${API_URL}/api/v1/`, controller.signal);
      const listed = index?.data?.endpoints ?? index?.endpoints;
      if (Array.isArray(listed)) endpoints = listed.filter((entry: unknown): entry is string => typeof entry === "string");
    } catch {
      // The index is optional; a healthy /health is enough to report "connected".
    }
    return NextResponse.json(
      {
        configured: true,
        connected: true,
        source: "external",
        service: typeof health?.service === "string" ? health.service : "imbonix-api",
        version: typeof health?.version === "string" ? health.version : null,
        counts: health?.data ?? null,
        endpoints,
      },
      { headers },
    );
  } catch {
    return NextResponse.json({ configured: true, connected: false, source: "external" }, { headers });
  } finally {
    clearTimeout(timer);
  }
}
