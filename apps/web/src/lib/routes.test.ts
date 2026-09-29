import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FOCUS_AREAS, MENU_SECTIONS, NAV, NAV_GROUPS } from "@/components/layout/nav";

const SOURCE_ROOT = resolve(process.cwd(), "src");
const APP = join(SOURCE_ROOT, "app");

/** Every .ts and .tsx file under a folder. */
function sourceFiles(folder: string): string[] {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !name.endsWith(".test.ts") ? [path] : [];
  });
}

/** Whether an address is a page of the site: a page.tsx at that folder, or a district profile. */
function isPage(address: string): boolean {
  const path = address.split(/[?#]/)[0].replace(/\/$/, "");
  if (/^\/districts\/[a-z-]+$/.test(path)) return true;
  return existsSync(join(APP, path, "page.tsx"));
}

describe("page addresses", () => {
  it("gives every page in the menus a page file", () => {
    for (const item of NAV) expect(isPage(item.href), item.href).toBe(true);
  });

  it("puts each focus area's pages under its own address", () => {
    for (const group of NAV_GROUPS) {
      expect(group.href).toBe(FOCUS_AREAS.find((area) => area.id === group.focusId)!.href);
      for (const item of group.items.filter((entry) => entry.href !== "/districts")) {
        expect(item.href.startsWith(`${group.href}/`), item.href).toBe(true);
      }
    }
    const data = MENU_SECTIONS.find((section) => section.id === "data")!;
    for (const item of data.items) expect(item.href.startsWith(`${data.href}/`), item.href).toBe(true);
  });

  it("links only to pages that exist", () => {
    const links = sourceFiles(SOURCE_ROOT).flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(/(?:href=|href: |page: )["'`](\/[a-z][a-z0-9/-]*)/g)].map((match) => ({
        file,
        address: match[1],
      })),
    );
    expect(links.length).toBeGreaterThan(20);
    for (const { file, address } of links) {
      if (address.startsWith("/api/") || address.startsWith("/geo/") || address.startsWith("/brand/")) continue;
      expect(isPage(address), `${address} in ${file}`).toBe(true);
    }
  });
});
