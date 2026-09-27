import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/scales";
import { BRAND, CORE, CYAN_INK, INK, MUTED, PAPER, RAMPS, WHITE } from "@/lib/palette";

const SRC = join(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "data" ? [] : sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !name.endsWith(".test.ts") ? [path] : [];
  });
}

describe("one palette, from the logo", () => {
  it("keeps every colour value in lib/palette.ts", () => {
    const offenders = sourceFiles(SRC)
      .filter((file) => !file.endsWith("palette.ts") && !file.endsWith("globals.css"))
      .flatMap((file) => {
        const hex = readFileSync(file, "utf8").match(/#[0-9A-Fa-f]{6}\b/g) ?? [];
        return hex.map((value) => `${relative(SRC, file)}: ${value}`);
      });
    expect(offenders).toEqual([]);
  });

  it("uses no Tailwind default colour families", () => {
    const pattern =
      /\b(?:bg|text|border|ring|from|to|via|fill|stroke|decoration)-(?:red|orange|amber|yellow|lime|green|emerald|teal|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;
    const offenders = sourceFiles(SRC).flatMap((file) =>
      (readFileSync(file, "utf8").match(pattern) ?? []).map((cls) => `${relative(SRC, file)}: ${cls}`),
    );
    expect(offenders).toEqual([]);
  });

  it("keeps text colours readable", () => {
    expect(contrastRatio(INK, WHITE)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(MUTED, PAPER)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(BRAND.blue, WHITE)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(CYAN_INK, PAPER)).toBeGreaterThanOrEqual(4.5);
    // Brand cyan is for fills and dark backgrounds: cyan text on navy, navy text on cyan buttons.
    expect(contrastRatio(BRAND.cyan, BRAND.navy)).toBeGreaterThanOrEqual(4.5);
  });

  it("uses the three brand colours only, with their steps and one neutral", () => {
    expect(Object.keys(BRAND)).toEqual(["navy", "navyDeep", "blue", "cyan"]);
    expect([BRAND.navy, BRAND.blue, BRAND.cyan]).toEqual(["#022657", "#0461B1", "#02A5DC"]);
    expect(Object.keys(RAMPS)).toEqual(["navy", "blue", "cyan", "steel"]);
    const retired = /\b(?:bg|text|border|ring|fill|stroke|outline|decoration)-(?:sun|azure|gold)\b/g;
    const offenders = sourceFiles(SRC).flatMap((file) =>
      (readFileSync(file, "utf8").match(retired) ?? []).map((cls) => `${relative(SRC, file)}: ${cls}`),
    );
    expect(offenders).toEqual([]);
  });

  it("makes every ramp step visible as a graphic against white, except the pale first step", () => {
    for (const ramp of Object.values(RAMPS)) {
      expect(contrastRatio(ramp[0], WHITE)).toBeGreaterThanOrEqual(2);
      for (const step of ramp.slice(1)) expect(contrastRatio(step, WHITE)).toBeGreaterThanOrEqual(2.5);
    }
    for (const accent of Object.values(CORE)) expect(contrastRatio(accent, WHITE)).toBeGreaterThanOrEqual(3);
  });
});
