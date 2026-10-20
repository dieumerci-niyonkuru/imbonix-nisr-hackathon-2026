import { ok, notFound, badRequest, isValidIndicatorId } from "@/lib/api-response";
import { getIndicator } from "@/lib/api-store";

/** GET /api/v1/indicators/:id — one indicator with its value in every district, highest first. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidIndicatorId(id)) {
    return badRequest("The request is not valid.", [
      { in: "params", field: "id", message: "Indicator ids use lower-case letters, digits and underscores" },
    ]);
  }
  const result = getIndicator(id);
  if (!result) return notFound(`No indicator with id "${id}"`);
  const { indicator, summary, values } = result;
  return ok({ ...indicator, summary, values });
}
