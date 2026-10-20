import pkg from "../../../../package.json";
import { ok } from "@/lib/api-response";

/**
 * The IMBONIX JSON API index, served from the Next.js app itself (one deployment, no separate service). It lists the
 * read-only endpoints and names the source; the data is the same published NISR aggregates the website is built from.
 */

const ATTRIBUTION =
  "Published statistics from the National Institute of Statistics of Rwanda (NISR), compiled by IMBONIX. IMBONIX is an independent project, not an official NISR product.";

export function GET() {
  return ok({
    name: "IMBONIX API",
    version: pkg.version,
    attribution: ATTRIBUTION,
    endpoints: [
      "GET /api/v1/indicators",
      "GET /api/v1/indicators/:id",
      "GET /api/v1/districts",
      "GET /api/v1/districts/:slug",
      "GET /api/v1/districts/:slug/sectors",
    ],
    documentation: "https://github.com/dieumerci-niyonkuru/imbonix-nisr-hackathon-2026/blob/main/docs/api.md",
  });
}
