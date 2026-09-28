import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CHART_INDEX } from "@/lib/chart-index";

const SOURCE_ROOT = resolve(process.cwd(), "src");

/** Every .tsx file under a folder, so the test can look for each chart's anchor wherever the chart is drawn. */
function tsxFiles(folder: string): string[] {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

const SOURCE = tsxFiles(SOURCE_ROOT)
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

describe("chart index", () => {
  it("points every chart at an anchor that exists in the source", () => {
    for (const chart of CHART_INDEX) expect(SOURCE, chart.id).toContain(`id="${chart.id}"`);
  });

  it("uses each anchor once", () => {
    const ids = CHART_INDEX.map((chart) => chart.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links only to pages that exist", () => {
    for (const chart of CHART_INDEX) {
      const page = chart.page.startsWith("/focus/") ? "focus/[area]" : chart.page.slice(1);
      expect(existsSync(join(SOURCE_ROOT, "app", page, "page.tsx")), chart.page).toBe(true);
    }
  });
});
