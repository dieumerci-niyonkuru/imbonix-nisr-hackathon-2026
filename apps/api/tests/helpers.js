const { createApp } = require("../src/app");
const { loadConfig } = require("../src/config");
const { loadDataStore } = require("../src/services/data-store");
const { createLogger } = require("../src/utils/logger");

/** The real published data, loaded once for all tests. */
const config = loadConfig({ NODE_ENV: "test" });
const store = loadDataStore(config.dataDir);

/** An app with test settings; pass overrides to change config, e.g. { rateLimitPerMinute: 2 }. */
function buildApp(overrides = {}, logLines) {
  const logger = createLogger(logLines ? "debug" : "silent", logLines ? { write: (line) => logLines.push(JSON.parse(line)) } : {});
  return createApp({ config: { ...config, ...overrides }, store, logger });
}

module.exports = { buildApp, config, store };
