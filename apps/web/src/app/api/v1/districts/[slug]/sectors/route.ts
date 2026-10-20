import { ok, notFound, badRequest, isValidSlug } from "@/lib/api-response";
import { getSectors, SECTOR_FIELDS } from "@/lib/api-store";

/** GET /api/v1/districts/:slug/sectors — a district's sectors with their figures (no drawing data). */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return badRequest("The request is not valid.", [
      { in: "params", field: "slug", message: "District slugs use lower-case letters and hyphens, e.g. nyamagabe" },
    ]);
  }
  const result = getSectors(slug);
  if (!result) return notFound(`No district with slug "${slug}"`);
  return ok(result.sectors, { district: result.district, fields: SECTOR_FIELDS });
}
