import { NextResponse } from "next/server";
import pkg from "../../../../package.json";
import { DISTRICTS, SOURCES } from "@/lib/data";

// Evaluate on every request, so a passing check means the server is actually answering.
export const dynamic = "force-dynamic";

/** Health check for hosting platforms and uptime monitors. */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "imbonix-web",
      version: pkg.version,
      data: { districts: DISTRICTS.length, indicators: Object.keys(SOURCES).length },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
