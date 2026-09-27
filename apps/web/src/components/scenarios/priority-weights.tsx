"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import { RwandaMap } from "@/components/map/rwanda-map";
import { StatusBadge } from "@/components/ui/status-badge";
import { Slider } from "@/components/ui/slider";
import { PROVINCE_LABEL } from "@/lib/data";
import { CORE_DIMENSIONS, DIMENSIONS, type Dimension } from "@/lib/indicators";
import { EQUAL_WEIGHTS, weightedPriority, type Weights } from "@/lib/scenarios";
import { cn } from "@/lib/utils";
import { NO_DATA, RAMPS } from "@/lib/palette";

/** Navy single-hue ramp for the what-if priority score (validated ordinal ramp; darker = higher priority). */
const RAMP = RAMPS.navy;

const PRESETS: { label: string; weights: Partial<Weights> }[] = [
  { label: "Equal weights", weights: { poverty: 1, finance: 1, nutrition: 1, shocks: 1 } },
  { label: "Poverty first", weights: { poverty: 3, finance: 1, nutrition: 1, shocks: 1 } },
  { label: "Financial access first", weights: { poverty: 1, finance: 3, nutrition: 1, shocks: 1 } },
  { label: "Resilience to shocks", weights: { poverty: 1, finance: 1, nutrition: 2, shocks: 3 } },
];

/** How a "priority ranking" depends on the weights someone chooses: the value judgement made visible. */
export function PriorityWeights() {
  const [weights, setWeights] = useState<Weights>(EQUAL_WEIGHTS);
  const rows = useMemo(() => weightedPriority(weights), [weights]);
  const allZero = CORE_DIMENSIONS.every((d) => !weights[d]);
  const fills = Object.fromEntries(
    rows.map((r) => [r.slug, allZero ? NO_DATA : RAMP[4 - Math.min(4, Math.floor(((r.rank - 1) * 5) / rows.length))]]),
  );
  const set = (dimension: Dimension, value: number) => setWeights((w) => ({ ...w, [dimension]: value }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted">Your weights</p>
          <StatusBadge status="scenario" />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setWeights({ ...EQUAL_WEIGHTS, ...preset.weights })}
              className="rounded-lg bg-paper px-3 py-1.5 text-[12.5px] font-semibold text-ink/80 transition-colors hover:bg-line/70"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-5">
          {CORE_DIMENSIONS.map((dimension) => (
            <div key={dimension}>
              <div className="flex items-center justify-between text-[13.5px]">
                <label id={`w-${dimension}`} className="flex items-center gap-2 font-semibold text-ink">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: DIMENSIONS[dimension].accent }} />
                  {DIMENSIONS[dimension].label}
                </label>
                <span className="tabular font-semibold text-ink">× {weights[dimension]}</span>
              </div>
              <Slider
                aria-labelledby={`w-${dimension}`}
                aria-label={`${DIMENSIONS[dimension].label} weight`}
                min={0}
                max={5}
                step={1}
                value={[weights[dimension]]}
                onValueChange={([v]) => set(dimension, v)}
              />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-6 max-w-sm">
          <RwandaMap fills={fills} title="Districts shaded by scenario priority under the chosen weights" />
          <div className="mt-2 flex items-center gap-1">
            {RAMP.map((c) => (
              <span key={c} className="h-1.5 flex-1 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted">
            <span>Lower priority</span>
            <span>Higher priority</span>
          </div>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <p className="font-display text-lg font-semibold text-ink">Top 10 under your weights</p>
        <p className="text-[13px] text-muted">Arrows show the change against equal weights.</p>
        {allZero ? (
          <div className="mt-4 rounded-xl bg-paper p-8 text-center">
            <p className="font-display text-lg font-semibold text-ink">Give at least one dimension a weight</p>
            <p className="mt-1 text-[13px] text-muted">With every weight at zero there is nothing to rank.</p>
          </div>
        ) : (
          <ol className="mt-4 divide-y divide-line" aria-live="polite">
            {rows.slice(0, 10).map((r) => {
              const move = r.equalRank - r.rank;
              return (
                <li key={r.slug} className="flex items-center gap-3 py-2.5">
                  <span className="tabular w-6 text-right text-[13px] font-bold text-ink">{r.rank}</span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/districts/${r.slug}`} className="font-semibold text-ink hover:text-royal">
                      {r.name}
                    </Link>
                    <span className="ml-2 text-[11.5px] text-muted">{PROVINCE_LABEL[r.province]}</span>
                  </div>
                  <span
                    className={cn(
                      "tabular flex w-16 items-center justify-end gap-0.5 text-[12px] font-semibold",
                      move > 0 ? "text-sun-ink" : move < 0 ? "text-royal" : "text-muted",
                    )}
                  >
                    {move > 0 ? (
                      <>
                        <ArrowUpIcon className="h-3.5 w-3.5" aria-hidden="true" /> {move}
                        <span className="sr-only">places higher than with equal weights</span>
                      </>
                    ) : move < 0 ? (
                      <>
                        <ArrowDownIcon className="h-3.5 w-3.5" aria-hidden="true" /> {-move}
                        <span className="sr-only">places lower than with equal weights</span>
                      </>
                    ) : (
                      "same"
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-4 rounded-xl bg-paper p-4 text-[12.5px] leading-5 text-muted">
          Score = weighted average of each district&apos;s position on the four dimensions (1 = most affected of 30, 0 = least).
          Changing the weights reorders the list, which is exactly the point: any single &quot;priority index&quot; hides a value
          judgement. This is a scenario, not an official ranking.
        </p>
      </div>
    </div>
  );
}
