const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig, parseOrigins } = require("../src/config");

describe("loadConfig", () => {
  it("uses safe defaults", () => {
    const config = loadConfig({});
    assert.equal(config.port, 4000);
    assert.equal(config.env, "development");
    assert.deepEqual(config.corsOrigins, ["http://localhost:3000"]);
    assert.equal(config.trustProxy, 0);
    assert.equal(config.logLevel, "info");
  });

  it("is silent under test", () => {
    assert.equal(loadConfig({ NODE_ENV: "test" }).logLevel, "silent");
  });

  it("rejects an invalid port, rate limit or log level", () => {
    assert.throws(() => loadConfig({ PORT: "eighty" }), /PORT/);
    assert.throws(() => loadConfig({ PORT: "70000" }), /PORT/);
    assert.throws(() => loadConfig({ RATE_LIMIT_PER_MINUTE: "0" }), /RATE_LIMIT_PER_MINUTE/);
    assert.throws(() => loadConfig({ LOG_LEVEL: "loud" }), /LOG_LEVEL/);
  });
});

describe("parseOrigins", () => {
  it("splits and trims a list of origins", () => {
    assert.deepEqual(parseOrigins("https://imbonix.rw, http://localhost:3000"), ["https://imbonix.rw", "http://localhost:3000"]);
  });

  it("treats * as any origin", () => {
    assert.equal(parseOrigins("https://imbonix.rw,*"), "*");
  });

  it("rejects values that are not origins", () => {
    assert.throws(() => parseOrigins("imbonix.rw"), /invalid origin/);
    assert.throws(() => parseOrigins("https://imbonix.rw/path"), /invalid origin/);
  });
});
