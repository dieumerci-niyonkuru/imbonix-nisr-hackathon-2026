const { LOG_LEVELS } = require("../config");

/**
 * Minimal structured logger: one JSON object per line, which hosting platforms can search and filter.
 * Errors and warnings go to stderr, everything else to stdout.
 */
function createLogger(level = "info", { write } = {}) {
  const threshold = LOG_LEVELS.indexOf(level);
  const emit = (name) => (msg, fields = {}) => {
    if (threshold < LOG_LEVELS.indexOf(name)) return;
    const line = JSON.stringify({ time: new Date().toISOString(), level: name, msg, ...fields });
    if (write) write(line, name);
    else if (name === "error" || name === "warn") process.stderr.write(line + "\n");
    else process.stdout.write(line + "\n");
  };
  return { error: emit("error"), warn: emit("warn"), info: emit("info"), debug: emit("debug") };
}

module.exports = { createLogger };
