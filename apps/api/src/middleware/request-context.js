const { randomUUID } = require("node:crypto");

const SAFE_ID = /^[A-Za-z0-9._-]{1,64}$/;

/**
 * Give every request an id (reusing a well-formed X-Request-Id from a proxy) and log one line when it finishes.
 */
function requestContext(logger) {
  return (request, response, next) => {
    const incoming = request.get("x-request-id");
    request.id = incoming && SAFE_ID.test(incoming) ? incoming : randomUUID();
    response.set("X-Request-Id", request.id);

    const started = process.hrtime.bigint();
    response.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      const path = request.originalUrl.split("?")[0];
      const status = response.statusCode;
      // Health probes run every few seconds; passing ones are only interesting when debugging.
      const level = status >= 500 ? "error" : status >= 400 ? "warn" : path === "/health" ? "debug" : "info";
      logger[level]("request", {
        requestId: request.id,
        method: request.method,
        path,
        status,
        durationMs: Math.round(durationMs * 10) / 10,
      });
    });
    next();
  };
}

module.exports = { requestContext };
