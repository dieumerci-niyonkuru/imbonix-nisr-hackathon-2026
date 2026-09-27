import { NextResponse } from "next/server";
import { DISTRICTS } from "@/lib/data";
import { sectorsOf } from "@/lib/sectors";

// Built once at build time. The site search fetches it the first time it opens, so the 416 sector names are not
// shipped with every page.
export const dynamic = "force-static";

/** Every sector as [sector name, district slug], for the site search. */
export function GET() {
  return NextResponse.json({
    sectors: DISTRICTS.flatMap((district) => sectorsOf(district.name).map((sector) => [sector.sector, district.slug])),
  });
}
