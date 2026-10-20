import { NextResponse } from "next/server";

/**
 * Live link to the IMBONIX JSON API (apps/api). The browser calls this same-origin route; the Next.js server then
 * reaches the API, so the API's URL stays on the server and the call is not subject to the browser's CSP or CORS. When
 * `API_URL` is not set (for example a static preview with no backend), it reports `configured: false` and the UI shows
 * the published endpoints without a live status — the site never depends on the API being up.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/+$/, "");
const TIMEOUT_MS = 4000;

async function fetchJson(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal, headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function GET() {
  const headers = { "Cache-Control": "no-store" };

  if (!API_URL) {
    return NextResponse.json({ configured: false, connected: false }, { headers });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const health = await fetchJson(`${API_URL}/health`, controller.signal);
    let endpoints: string[] = [];
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
        service: typeof health?.service === "string" ? health.service : "imbonix-api",
        version: typeof health?.version === "string" ? health.version : null,
        counts: health?.data ?? null,
        endpoints,
      },
      { headers },
    );
  } catch {
    return NextResponse.json({ configured: true, connected: false }, { headers });
  } finally {
    clearTimeout(timer);
  }
}
