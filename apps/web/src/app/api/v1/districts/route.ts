import { ok, badRequest } from "@/lib/api-response";
import { listDistricts, provinces } from "@/lib/api-store";

/** GET /api/v1/districts — all 30 districts, or only those in a province with `?province=`. */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  for (const key of searchParams.keys()) {
    if (key !== "province") {
      return badRequest("The request is not valid.", [{ in: "query", field: key, message: `Unrecognized key: "${key}"` }]);
    }
  }
  const province = searchParams.get("province") ?? undefined;
  if (province !== undefined && !provinces.includes(province)) {
    return badRequest("The request is not valid.", [
      {
        in: "query",
        field: "province",
        message: `Invalid option: expected one of ${provinces.map((p) => `"${p}"`).join(", ")}`,
      },
    ]);
  }
  return ok(listDistricts({ province }), province ? { filters: { province } } : {});
}
