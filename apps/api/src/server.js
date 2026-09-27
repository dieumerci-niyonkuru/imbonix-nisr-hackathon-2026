const { createApp } = require("./app");
const { loadConfig } = require("./config");
const { loadDataStore } = require("./services/data-store");
const { createLogger } = require("./utils/logger");

const SHUTDOWN_TIMEOUT_MS = 10_000;

function start() {
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    console.error(`Invalid configuration: ${error.message}`);
    process.exit(1);
  }
  const logger = createLogger(config.logLevel);

  let store;
  try {
    store = loadDataStore(config.dataDir);
  } catch (error) {
    logger.error("could not load data", { error: error.message });
    process.exit(1);
  }

  const app = createApp({ config, store, logger });
  const server = app.listen(config.port, config.host, () => {
    logger.info("IMBONIX API listening", { url: `http://localhost:${config.port}`, environment: config.env, ...store.counts });
  });

  // Finish in-flight requests before exiting, so deploys and restarts do not cut responses short.
  const shutdown = (signal) => {
    logger.info("shutting down", { signal });
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => logger.error("unhandled rejection", { error: String(reason) }));
}

start();
