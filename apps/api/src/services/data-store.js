const fs = require("node:fs");
const path = require("node:path");

/** Where each sector field comes from. Sector figures have no sampling error except the small-area estimate. */
const SECTOR_FIELDS = {
  population: { label: "Population", unit: "people", source: "NISR Population and Housing Census 2022 (RPHC5)", status: "observed" },
  nonpoor: {
    label: "Non-poor, non-monetary measure",
    unit: "% of population",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.1, 2022",
    status: "observed",
  },
  vulnerable: {
    label: "Vulnerable, non-monetary measure",
    unit: "% of population",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.1, 2022",
    status: "observed",
  },
  moderatelyPoor: {
    label: "Moderately poor, non-monetary measure",
    unit: "% of population",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.1, 2022",
    status: "observed",
  },
  severelyPoor: {
    label: "Severely poor, non-monetary measure",
    unit: "% of population",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.1, 2022",
    status: "observed",
  },
  mpiHeadcount: {
    label: "Multidimensionally poor (headcount)",
    unit: "% of population",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.10, 2022",
    status: "observed",
  },
  mpi: {
    label: "Multidimensional Poverty Index (M0)",
    unit: "index, 0 to 1",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.10, 2022",
    status: "observed",
  },
  povertySae: {
    label: "Poverty rate, small-area estimate",
    unit: "% of population",
    source: "NISR EICV7 district presentations (small-area estimation with the 2022 census), 2023/24",
    status: "model_estimate",
  },
};

function readJson(dataDir, file) {
  const fullPath = path.join(dataDir, file);
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    throw new Error(
      `Cannot read ${fullPath}: ${error.message}. Run scripts/data/build_web_data.py or set DATA_DIR to the generated data folder.`,
    );
  }
}

function median(sorted) {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function toValue(raw) {
  return { value: raw.v, standardError: raw.se ?? null, ciLow: raw.lo ?? null, ciHigh: raw.hi ?? null };
}

/**
 * Load the published aggregates once at startup and index them for lookups.
 * The files are small (about 0.5 MB) and read-only, so everything stays in memory.
 */
function loadDataStore(dataDir) {
  const { indicators: indicatorMeta, districts: districtRows } = readJson(dataDir, "districts.json");
  const sectorFile = readJson(dataDir, "sectors.json");
  if (!indicatorMeta || !Array.isArray(districtRows) || districtRows.length === 0) {
    throw new Error(`${path.join(dataDir, "districts.json")} does not contain indicators and districts`);
  }

  const indicators = Object.entries(indicatorMeta)
    .map(([id, meta]) => ({ id, ...meta }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const indicatorById = new Map(indicators.map((indicator) => [indicator.id, indicator]));

  const districts = districtRows
    .map(({ name, slug, province, values }) => ({ name, slug, province, values }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const districtBySlug = new Map(districts.map((district) => [district.slug, district]));

  const sectorsBySlug = new Map();
  for (const district of districts) {
    const rows = sectorFile[district.name] ?? [];
    sectorsBySlug.set(
      district.slug,
      // Drop drawing data (SVG paths, bounding boxes); the API serves figures only.
      rows.map(({ d: _path, bbox: _bbox, ...figures }) => figures).sort((a, b) => a.sector.localeCompare(b.sector)),
    );
  }

  const provinces = [...new Set(districts.map((district) => district.province))].sort();
  const statuses = [...new Set(indicators.map((indicator) => indicator.status))].sort();
  const sectorCount = [...sectorsBySlug.values()].reduce((sum, rows) => sum + rows.length, 0);

  const summaryOf = (district) => ({ name: district.name, slug: district.slug, province: district.province });

  return {
    counts: { districts: districts.length, indicators: indicators.length, sectors: sectorCount },
    provinces,
    statuses,
    sectorFields: SECTOR_FIELDS,

    listIndicators({ status } = {}) {
      return status ? indicators.filter((indicator) => indicator.status === status) : indicators;
    },

    hasIndicator(id) {
      return indicatorById.has(id);
    },

    /** One indicator with its value in every district that has one, highest first. */
    getIndicator(id) {
      const indicator = indicatorById.get(id);
      if (!indicator) return undefined;
      const values = districts
        .filter((district) => district.values[id])
        .map((district) => ({ district: summaryOf(district), ...toValue(district.values[id]) }))
        .sort((a, b) => b.value - a.value);
      const sorted = values.map((row) => row.value).sort((a, b) => a - b);
      const summary = sorted.length
        ? { count: sorted.length, min: sorted[0], median: median(sorted), max: sorted[sorted.length - 1] }
        : { count: 0, min: null, median: null, max: null };
      return { indicator, summary, values };
    },

    listDistricts({ province } = {}) {
      const rows = province ? districts.filter((district) => district.province === province) : districts;
      return rows.map(summaryOf);
    },

    /** A district with its indicator values (all of them, or only the ids asked for). */
    getDistrict(slug, { indicators: only } = {}) {
      const district = districtBySlug.get(slug);
      if (!district) return undefined;
      const ids = only ?? indicators.map((indicator) => indicator.id);
      const values = ids
        .filter((id) => district.values[id])
        .map((id) => ({ indicator: indicatorById.get(id), ...toValue(district.values[id]) }));
      return { ...summaryOf(district), sectorCount: sectorsBySlug.get(slug).length, values };
    },

    getSectors(slug) {
      const district = districtBySlug.get(slug);
      return district ? { district: summaryOf(district), sectors: sectorsBySlug.get(slug) } : undefined;
    },
  };
}

module.exports = { loadDataStore, SECTOR_FIELDS };
