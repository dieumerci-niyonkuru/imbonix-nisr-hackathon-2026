import { ok, badRequest } from "@/lib/api-response";
import { listIndicators, statuses } from "@/lib/api-store";

/** GET /api/v1/indicators — every indicator, or only those with `?status=`. */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  for (const key of searchParams.keys()) {
    if (key !== "status") {
      return badRequest("The request is not valid.", [{ in: "query", field: key, message: `Unrecognized key: "${key}"` }]);
    }
  }
  const status = searchParams.get("status") ?? undefined;
  if (status !== undefined && !statuses.includes(status)) {
    return badRequest("The request is not valid.", [
      { in: "query", field: "status", message: `Invalid option: expected one of ${statuses.map((s) => `"${s}"`).join(", ")}` },
    ]);
  }
  return ok(listIndicators({ status }), status ? { filters: { status } } : {});
}
