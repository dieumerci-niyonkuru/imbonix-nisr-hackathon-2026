const { Router } = require("express");
const { z } = require("zod");
const { validate } = require("../middleware/validate");
const { notFound } = require("../utils/http-error");
const { sendData } = require("../utils/respond");

const INDICATOR_ID = z.string().regex(/^[a-z0-9_]{1,80}$/, "Indicator ids use lower-case letters, digits and underscores");

function indicatorsRouter({ store }) {
  const router = Router();

  router.get(
    "/",
    validate({ query: z.strictObject({ status: z.enum(store.statuses).optional() }) }),
    (request, response) => {
      const { status } = request.valid.query;
      sendData(response, store.listIndicators({ status }), status ? { filters: { status } } : {});
    },
  );

  router.get("/:id", validate({ params: z.object({ id: INDICATOR_ID }), query: z.strictObject({}) }), (request, response, next) => {
    const result = store.getIndicator(request.valid.params.id);
    if (!result) return next(notFound(`No indicator with id "${request.valid.params.id}"`));
    const { indicator, summary, values } = result;
    sendData(response, { ...indicator, summary, values });
  });

  return router;
}

module.exports = { indicatorsRouter, INDICATOR_ID };
