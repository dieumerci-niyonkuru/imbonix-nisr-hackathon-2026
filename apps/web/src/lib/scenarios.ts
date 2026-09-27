/**
 * What-if calculations on published district figures. Every output is a scenario (arithmetic under stated
 * assumptions), not a forecast or an official estimate.
 */
import { DISTRICTS, rankOf } from "@/lib/data";
import { CORE_DIMENSIONS, DIMENSIONS, meta, type Dimension } from "@/lib/indicators";

export type ReachRow = { slug: string; name: string; province: string; rate: number; adults: number; toReach: number };

/**
 * Adults each district would need to bring into formal finance for its rate to fall to `target` percent:
 * max(0, rate - target) / 100 x projected adults 16+ in 2024.
 */
export function reachScenario(target: number, indicatorId = "finscope_not_formally_included"): ReachRow[] {
  return DISTRICTS.flatMap((d) => {
    const rate = d.values[indicatorId]?.v;
    const adults = d.values.proj_adults_16plus_2024?.v;
    if (rate === undefined || adults === undefined) return [];
    return [
      {
        slug: d.slug,
        name: d.name,
        province: d.province,
        rate,
        adults,
        toReach: Math.round((Math.max(0, rate - target) / 100) * adults),
      },
    ];
  }).sort((a, b) => b.toReach - a.toReach);
}

export type Weights = Record<Dimension, number>;

export const EQUAL_WEIGHTS: Weights = {
  poverty: 1,
  finance: 1,
  nutrition: 1,
  shocks: 1,
  digital: 0,
  work: 0,
  health: 0,
  people: 0,
};

export type PriorityRow = { slug: string; name: string; province: string; score: number; rank: number; equalRank: number };

/**
 * Weighted average of each district's position on the four core dimensions, where position = (n - rank) / (n - 1):
 * 1 for the most affected district, 0 for the least affected. Ranks, not raw values, so no single survey
 * dominates because of its scale.
 */
export function weightedPriority(weights: Weights): PriorityRow[] {
  const score = (w: Weights) =>
    DISTRICTS.map((d) => {
      let total = 0;
      let weightSum = 0;
      for (const dimension of CORE_DIMENSIONS) {
        const weight = w[dimension] ?? 0;
        const rank = rankOf(d, meta(DIMENSIONS[dimension].headline!));
        if (!weight || !rank) continue;
        total += weight * ((rank.of - rank.rank) / (rank.of - 1));
        weightSum += weight;
      }
      return { d, score: weightSum ? total / weightSum : 0 };
    }).sort((a, b) => b.score - a.score);

  const equal = score(EQUAL_WEIGHTS);
  const equalRank = new Map(equal.map((row, i) => [row.d.slug, i + 1]));
  return score(weights).map((row, i) => ({
    slug: row.d.slug,
    name: row.d.name,
    province: row.d.province,
    score: row.score,
    rank: i + 1,
    equalRank: equalRank.get(row.d.slug)!,
  }));
}
