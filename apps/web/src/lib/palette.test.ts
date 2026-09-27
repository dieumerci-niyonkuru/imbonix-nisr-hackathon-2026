import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/scales";
import { BRAND, CORE, INK, MUTED, PAPER, RAMPS, SUN_INK, WHITE } from "@/lib/palette";

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
    expect(contrastRatio(SUN_INK, PAPER)).toBeGreaterThanOrEqual(4.5);
    // Logo cyan and gold are for dark backgrounds.
    expect(contrastRatio(BRAND.cyan, BRAND.navy)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(BRAND.gold, BRAND.navy)).toBeGreaterThanOrEqual(4.5);
  });

  it("makes every ramp step visible as a graphic against white, except the pale first step", () => {
    for (const ramp of Object.values(RAMPS)) {
      expect(contrastRatio(ramp[0], WHITE)).toBeGreaterThanOrEqual(2);
      for (const step of ramp.slice(1)) expect(contrastRatio(step, WHITE)).toBeGreaterThanOrEqual(2.5);
    }
    for (const accent of Object.values(CORE)) expect(contrastRatio(accent, WHITE)).toBeGreaterThanOrEqual(3);
  });
});
