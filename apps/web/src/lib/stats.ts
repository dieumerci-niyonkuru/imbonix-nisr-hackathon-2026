import { DISTRICTS, type District } from "@/lib/data";

/** Pearson correlation between two district measures (districts missing either value are skipped). */
export function correlation(xId: string, yId: string, filter: (d: District) => boolean = () => true): { r: number; n: number } {
  const pairs = DISTRICTS.filter(filter)
    .map((d) => [d.values[xId]?.v, d.values[yId]?.v] as const)
    .filter((p): p is readonly [number, number] => p[0] !== undefined && p[1] !== undefined);
  const n = pairs.length;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pairs) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  return { r: sxy / Math.sqrt(sxx * syy), n };
}

export function formatR(r: number): string {
  return `${r < 0 ? "−" : ""}${Math.abs(r).toFixed(2)}`;
}
