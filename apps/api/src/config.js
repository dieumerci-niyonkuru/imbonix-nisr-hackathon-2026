const path = require("node:path");

/** The web app's build step writes the published aggregates here (scripts/data/build_web_data.py). */
const DEFAULT_DATA_DIR = path.resolve(__dirname, "../../web/src/data/generated");
const LOG_LEVELS = ["silent", "error", "warn", "info", "debug"];

function integer(name, value, { min, max }) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`${name} must be a whole number from ${min} to ${max}, got "${value}"`);
  }
  return number;
}

/** "*" allows any origin; otherwise a comma-separated list of exact origins. */
function parseOrigins(value) {
  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (origins.includes("*")) return "*";
  for (const origin of origins) {
    if (!/^https?:\/\/[^/\s]+$/.test(origin)) throw new Error(`CORS_ORIGINS has an invalid origin: "${origin}"`);
  }
  return origins;
}

/** Read and validate settings from the environment. Invalid values stop the server at startup. */
function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  const logLevel = env.LOG_LEVEL || (nodeEnv === "test" ? "silent" : "info");
  if (!LOG_LEVELS.includes(logLevel)) throw new Error(`LOG_LEVEL must be one of ${LOG_LEVELS.join(", ")}`);

  return {
    env: nodeEnv,
    port: integer("PORT", env.PORT || 4000, { min: 1, max: 65535 }),
    // Unset means every interface, IPv4 and IPv6.
    host: env.HOST || undefined,
    dataDir: path.resolve(env.DATA_DIR || DEFAULT_DATA_DIR),
    corsOrigins: parseOrigins(env.CORS_ORIGINS || "http://localhost:3000"),
    rateLimitPerMinute: integer("RATE_LIMIT_PER_MINUTE", env.RATE_LIMIT_PER_MINUTE || 120, { min: 1, max: 100000 }),
    // Number of proxies in front of the API (load balancer, platform router), so rate limits see real client IPs.
    trustProxy: integer("TRUST_PROXY", env.TRUST_PROXY || 0, { min: 0, max: 10 }),
    logLevel,
  };
}

module.exports = { loadConfig, parseOrigins, LOG_LEVELS };
