import { ok, notFound, badRequest, isValidSlug, isValidIndicatorId } from "@/lib/api-response";
import { getDistrict, hasIndicator } from "@/lib/api-store";

/** GET /api/v1/districts/:slug — one district with its indicator values, or only `?indicators=id1,id2`. */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return badRequest("The request is not valid.", [
      { in: "params", field: "slug", message: "District slugs use lower-case letters and hyphens, e.g. nyamagabe" },
    ]);
  }

  const { searchParams } = new URL(request.url);
  let only: string[] | undefined;
  const raw = searchParams.get("indicators");
  if (raw !== null) {
    const ids = [...new Set(raw.split(",").map((value) => value.trim()))].filter(Boolean);
    if (ids.length < 1) {
      return badRequest("The request is not valid.", [
        { in: "query", field: "indicators", message: "List at least one indicator id" },
      ]);
    }
    if (ids.some((id) => !isValidIndicatorId(id))) {
      return badRequest("The request is not valid.", [
        { in: "query", field: "indicators", message: "Indicator ids use lower-case letters, digits and underscores" },
      ]);
    }
    const unknown = ids.filter((id) => !hasIndicator(id));
    if (unknown.length) {
      return badRequest("The request is not valid.", [
        { in: "query", field: "indicators", message: `Unknown indicator id: ${unknown.join(", ")}` },
      ]);
    }
    only = ids;
  }

  const district = getDistrict(slug, { indicators: only });
  if (!district) return notFound(`No district with slug "${slug}"`);
  return ok(district);
}
