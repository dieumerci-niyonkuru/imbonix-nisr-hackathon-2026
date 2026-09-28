import { NextResponse } from "next/server";
import places from "@/data/generated/places.json";
import type { PlaceIndex } from "@/lib/places";

// Built once at build time. The site search fetches it the first time it opens, so the 416 sectors, 2,148 cells and
// 14,815 villages are not shipped with every page.
export const dynamic = "force-static";

/**
 * Every sector as [name, district slug], every cell as [name, sector index] and every village as [name, cell index],
 * from the place index (scripts/data/build_place_index.py).
 */
export function GET() {
  const index: PlaceIndex = {
    sectors: places.sectors as PlaceIndex["sectors"],
    cells: places.cells as PlaceIndex["cells"],
    villages: places.villages as PlaceIndex["villages"],
  };
  return NextResponse.json(index);
}
