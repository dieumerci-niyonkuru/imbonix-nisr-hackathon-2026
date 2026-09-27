const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { buildApp } = require("./helpers");

const app = buildApp();

function assertError(response, status, code) {
  assert.equal(response.status, status);
  assert.equal(response.body.error.code, code);
  assert.equal(typeof response.body.error.message, "string");
  assert.equal(response.body.error.requestId, response.headers["x-request-id"]);
  assert.equal(response.headers["cache-control"], "no-store");
}

describe("GET /health", () => {
  it("reports status, version and loaded data", async () => {
    const response = await request(app).get("/health").expect(200);
    assert.equal(response.body.status, "ok");
    assert.equal(response.body.service, "imbonix-api");
    assert.deepEqual(response.body.data, { districts: 30, indicators: 64, sectors: 416 });
    assert.equal(response.headers["cache-control"], "no-store");
  });
});

describe("GET /api/v1", () => {
  it("lists the endpoints and states that IMBONIX is independent of NISR", async () => {
    const response = await request(app).get("/api/v1").expect(200);
    assert.ok(response.body.data.endpoints.length >= 5);
    assert.match(response.body.data.attribution, /not an official NISR product/);
  });
});

describe("GET /api/v1/indicators", () => {
  it("lists every indicator with its provenance", async () => {
    const response = await request(app).get("/api/v1/indicators").expect(200);
    assert.equal(response.body.meta.count, 64);
    const poverty = response.body.data.find((indicator) => indicator.id === "eicv7_poverty_rate");
    assert.ok(poverty.source && poverty.year && poverty.unit && poverty.status);
  });

  it("filters by status", async () => {
    const response = await request(app).get("/api/v1/indicators?status=projection").expect(200);
    assert.ok(response.body.meta.count > 0);
    assert.ok(response.body.data.every((indicator) => indicator.status === "projection"));
    assert.deepEqual(response.body.meta.filters, { status: "projection" });
  });

  it("rejects an unknown status", async () => {
    const response = await request(app).get("/api/v1/indicators?status=guess");
    assertError(response, 400, "bad_request");
    assert.equal(response.body.error.details[0].field, "status");
  });

  it("rejects unknown query parameters instead of ignoring them", async () => {
    assertError(await request(app).get("/api/v1/indicators?stauts=observed"), 400, "bad_request");
  });

  it("rejects a repeated parameter", async () => {
    assertError(await request(app).get("/api/v1/indicators?status=observed&status=projection"), 400, "bad_request");
  });
});

describe("GET /api/v1/indicators/:id", () => {
  it("returns district values with confidence intervals where published", async () => {
    const response = await request(app).get("/api/v1/indicators/eicv7_poverty_rate").expect(200);
    const { data } = response.body;
    assert.equal(data.values.length, 30);
    assert.equal(data.summary.count, 30);
    const nyamagabe = data.values.find((row) => row.district.slug === "nyamagabe");
    assert.equal(nyamagabe.value, 51.3941);
    assert.ok(nyamagabe.ciLow < nyamagabe.value && nyamagabe.value < nyamagabe.ciHigh);
  });

  it("returns 404 for an unknown indicator", async () => {
    assertError(await request(app).get("/api/v1/indicators/not_an_indicator"), 404, "not_found");
  });

  it("returns 400 for a malformed id", async () => {
    assertError(await request(app).get("/api/v1/indicators/DROP%20TABLE"), 400, "bad_request");
  });
});

describe("GET /api/v1/districts", () => {
  it("lists all 30 districts", async () => {
    const response = await request(app).get("/api/v1/districts").expect(200);
    assert.equal(response.body.meta.count, 30);
    assert.deepEqual(Object.keys(response.body.data[0]).sort(), ["name", "province", "slug"]);
  });

  it("filters by province", async () => {
    const response = await request(app).get("/api/v1/districts?province=Kigali%20City").expect(200);
    assert.deepEqual(response.body.data.map((district) => district.slug).sort(), ["gasabo", "kicukiro", "nyarugenge"]);
  });

  it("rejects an unknown province", async () => {
    assertError(await request(app).get("/api/v1/districts?province=Atlantis"), 400, "bad_request");
  });
});

describe("GET /api/v1/districts/:slug", () => {
  it("returns a district with all of its indicator values", async () => {
    const response = await request(app).get("/api/v1/districts/nyamagabe").expect(200);
    const { data } = response.body;
    assert.equal(data.name, "Nyamagabe");
    assert.equal(data.province, "South");
    assert.ok(data.values.length > 40);
    assert.ok(data.values.every((row) => row.indicator.id && row.indicator.source && typeof row.value === "number"));
  });

  it("limits values to the indicators asked for", async () => {
    const response = await request(app).get("/api/v1/districts/nyamagabe?indicators=eicv7_poverty_rate,finscope_excluded").expect(200);
    assert.deepEqual(response.body.data.values.map((row) => row.indicator.id).sort(), ["eicv7_poverty_rate", "finscope_excluded"]);
  });

  it("names unknown indicators in the error", async () => {
    const response = await request(app).get("/api/v1/districts/nyamagabe?indicators=eicv7_poverty_rate,made_up");
    assertError(response, 400, "bad_request");
    assert.match(response.body.error.details[0].message, /made_up/);
  });

  it("returns 404 for an unknown district", async () => {
    assertError(await request(app).get("/api/v1/districts/atlantis"), 404, "not_found");
  });
});

describe("GET /api/v1/districts/:slug/sectors", () => {
  it("returns sector figures with field sources", async () => {
    const response = await request(app).get("/api/v1/districts/nyamagabe/sectors").expect(200);
    assert.ok(response.body.meta.count > 10);
    assert.equal(response.body.meta.district.slug, "nyamagabe");
    assert.equal(response.body.meta.fields.povertySae.status, "model_estimate");
    assert.equal(response.body.data[0].d, undefined);
  });
});

describe("errors and security", () => {
  it("returns JSON 404s for unknown routes", async () => {
    assertError(await request(app).get("/api/v2/everything"), 404, "not_found");
  });

  it("does not accept writes", async () => {
    assertError(await request(app).post("/api/v1/districts").send({ name: "New" }), 404, "not_found");
  });

  it("returns 400, not 500, for a malformed URL", async () => {
    assertError(await request(app).get("/api/v1/districts/%E0%A4%A"), 400, "bad_request");
  });

  it("sets security headers and hides the framework", async () => {
    const response = await request(app).get("/api/v1/districts");
    assert.equal(response.headers["x-content-type-options"], "nosniff");
    assert.ok(response.headers["content-security-policy"]);
    assert.equal(response.headers["x-powered-by"], undefined);
  });

  it("allows configured origins only", async () => {
    const allowed = await request(app).get("/api/v1/districts").set("Origin", "http://localhost:3000");
    assert.equal(allowed.headers["access-control-allow-origin"], "http://localhost:3000");
    const other = await request(app).get("/api/v1/districts").set("Origin", "https://evil.example");
    assert.equal(other.headers["access-control-allow-origin"], undefined);
  });

  it("keeps a safe incoming request id and replaces an unsafe one", async () => {
    const kept = await request(app).get("/health").set("X-Request-Id", "abc-123");
    assert.equal(kept.headers["x-request-id"], "abc-123");
    const replaced = await request(app).get("/health").set("X-Request-Id", "<script>");
    assert.match(replaced.headers["x-request-id"], /^[0-9a-f-]{36}$/);
  });

  it("rate-limits the data endpoints but not the health check", async () => {
    const limited = buildApp({ rateLimitPerMinute: 2 });
    await request(limited).get("/api/v1/districts").expect(200);
    await request(limited).get("/api/v1/districts").expect(200);
    assertError(await request(limited).get("/api/v1/districts"), 429, "rate_limited");
    await request(limited).get("/health").expect(200);
  });

  it("logs one structured line per request", async () => {
    const lines = [];
    await request(buildApp({}, lines)).get("/api/v1/districts?province=West");
    const entry = lines.find((line) => line.msg === "request");
    assert.equal(entry.status, 200);
    assert.equal(entry.path, "/api/v1/districts");
    assert.equal(typeof entry.durationMs, "number");
  });

  it("logs passing health checks at debug level so probes do not flood the logs", async () => {
    const lines = [];
    await request(buildApp({}, lines)).get("/health").expect(200);
    assert.equal(lines.find((line) => line.msg === "request").level, "debug");
  });
});
