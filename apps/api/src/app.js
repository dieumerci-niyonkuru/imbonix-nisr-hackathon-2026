const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { version } = require("../package.json");
const { requestContext } = require("./middleware/request-context");
const { errorHandler, notFoundHandler } = require("./middleware/error-handler");
const { healthRouter } = require("./routes/health");
const { indicatorsRouter } = require("./routes/indicators");
const { districtsRouter } = require("./routes/districts");
const { HttpError } = require("./utils/http-error");
const { sendData } = require("./utils/respond");

const ATTRIBUTION =
  "Published statistics from the National Institute of Statistics of Rwanda (NISR), compiled by IMBONIX. IMBONIX is an independent project, not an official NISR product.";

/** Build the Express app. Dependencies are passed in so tests can use their own settings and data. */
function createApp({ config, store, logger }) {
  const app = express();
  app.set("trust proxy", config.trustProxy);
  app.set("query parser", "simple");

  app.use(requestContext(logger));
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins === "*" ? "*" : (origin, done) => done(null, !origin || config.corsOrigins.includes(origin)),
      methods: ["GET", "HEAD", "OPTIONS"],
      exposedHeaders: ["X-Request-Id", "RateLimit", "RateLimit-Policy"],
    }),
  );

  app.use("/health", healthRouter({ config, store }));

  const api = express.Router();
  api.use(
    rateLimit({
      windowMs: 60_000,
      limit: config.rateLimitPerMinute,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      handler: (_request, _response, next) =>
        next(new HttpError(429, "rate_limited", "Too many requests. Please wait a minute and try again.")),
    }),
  );
  // The data changes only when the site is rebuilt, so clients and CDNs may cache it briefly.
  api.use((_request, response, next) => {
    response.set("Cache-Control", "public, max-age=300");
    next();
  });
  api.get("/", (_request, response) =>
    sendData(response, {
      name: "IMBONIX API",
      version,
      attribution: ATTRIBUTION,
      endpoints: [
        "GET /api/v1/indicators",
        "GET /api/v1/indicators/:id",
        "GET /api/v1/districts",
        "GET /api/v1/districts/:slug",
        "GET /api/v1/districts/:slug/sectors",
      ],
      documentation: "https://github.com/dieumerci-niyonkuru/imbonix-nisr-hackathon-2026/blob/develop/docs/api.md",
    }),
  );
  api.use("/indicators", indicatorsRouter({ store }));
  api.use("/districts", districtsRouter({ store }));
  app.use("/api/v1", api);

  app.use(notFoundHandler);
  app.use(errorHandler(logger));
  return app;
}

module.exports = { createApp, ATTRIBUTION };
