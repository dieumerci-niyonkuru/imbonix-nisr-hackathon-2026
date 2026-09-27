const { Router } = require("express");
const { z } = require("zod");
const { validate } = require("../middleware/validate");
const { INDICATOR_ID } = require("./indicators");
const { notFound } = require("../utils/http-error");
const { sendData } = require("../utils/respond");

const SLUG = z.string().regex(/^[a-z][a-z-]{1,39}$/, "District slugs use lower-case letters and hyphens, e.g. nyamagabe");

function districtsRouter({ store }) {
  const router = Router();
  const slugParams = z.object({ slug: SLUG });

  // ?indicators=id1,id2 limits a district to the indicators asked for; every id must exist.
  const indicatorList = z
    .string()
    .transform((value) => [...new Set(value.split(",").map((id) => id.trim()))].filter(Boolean))
    .pipe(z.array(INDICATOR_ID).min(1, "List at least one indicator id").max(store.counts.indicators))
    .refine((ids) => ids.every((id) => store.hasIndicator(id)), {
      error: (issue) => `Unknown indicator id: ${issue.input.filter((id) => !store.hasIndicator(id)).join(", ")}`,
    });

  router.get(
    "/",
    validate({ query: z.strictObject({ province: z.enum(store.provinces).optional() }) }),
    (request, response) => {
      const { province } = request.valid.query;
      sendData(response, store.listDistricts({ province }), province ? { filters: { province } } : {});
    },
  );

  router.get(
    "/:slug",
    validate({ params: slugParams, query: z.strictObject({ indicators: indicatorList.optional() }) }),
    (request, response, next) => {
      const { slug } = request.valid.params;
      const district = store.getDistrict(slug, { indicators: request.valid.query.indicators });
      if (!district) return next(notFound(`No district with slug "${slug}"`));
      sendData(response, district);
    },
  );

  router.get("/:slug/sectors", validate({ params: slugParams, query: z.strictObject({}) }), (request, response, next) => {
    const { slug } = request.valid.params;
    const result = store.getSectors(slug);
    if (!result) return next(notFound(`No district with slug "${slug}"`));
    sendData(response, result.sectors, { district: result.district, fields: store.sectorFields });
  });

  return router;
}

module.exports = { districtsRouter };
