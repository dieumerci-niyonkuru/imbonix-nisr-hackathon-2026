const { Router } = require("express");
const { version } = require("../../package.json");

/** Liveness and readiness in one: the data is loaded before the server starts listening. */
function healthRouter({ config, store }) {
  const router = Router();
  router.get("/", (_request, response) => {
    response.set("Cache-Control", "no-store");
    response.json({
      status: "ok",
      service: "imbonix-api",
      version,
      environment: config.env,
      uptimeSeconds: Math.round(process.uptime()),
      data: store.counts,
    });
  });
  return router;
}

module.exports = { healthRouter };
