const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadDataStore } = require("../src/services/data-store");
const { store } = require("./helpers");

describe("data store", () => {
  it("loads all 30 districts, 64 indicators and 416 sectors", () => {
    assert.deepEqual(store.counts, { districts: 30, indicators: 64, sectors: 416 });
    assert.deepEqual(store.provinces, ["East", "Kigali City", "North", "South", "West"]);
  });

  it("gives every indicator its source and status", () => {
    for (const indicator of store.listIndicators()) {
      assert.ok(indicator.source, `${indicator.id} has no source`);
      assert.ok(["observed", "calculated", "model_estimate", "projection"].includes(indicator.status), indicator.id);
    }
  });

  it("orders an indicator's district values from highest to lowest", () => {
    const { values, summary } = store.getIndicator("eicv7_poverty_rate");
    assert.equal(values.length, 30);
    for (let i = 1; i < values.length; i++) assert.ok(values[i - 1].value >= values[i].value);
    assert.equal(summary.max, values[0].value);
    assert.equal(summary.min, values[values.length - 1].value);
  });

  it("serves sector figures without drawing data", () => {
    const { sectors } = store.getSectors("nyamagabe");
    assert.ok(sectors.length > 0);
    for (const sector of sectors) {
      assert.equal(sector.d, undefined);
      assert.equal(sector.bbox, undefined);
      assert.equal(typeof sector.sector, "string");
    }
  });

  it("fails with a helpful message when the data folder is missing", () => {
    assert.throws(() => loadDataStore(path.join(__dirname, "no-such-folder")), /build_web_data\.py or set DATA_DIR/);
  });
});
