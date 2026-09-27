"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, ChartTooltip, GRID } from "@/components/charts/recharts/chart-theme";
import { StatusBadge } from "@/components/ui/status-badge";
import { Slider } from "@/components/ui/slider";
import { formatNumber } from "@/lib/format";
import { reachScenario } from "@/lib/scenarios";
import { cn } from "@/lib/utils";
import { BRAND, INK } from "@/lib/palette";

const MEASURES = [
  {
    id: "finscope_not_formally_included",
    label: "Not formally included",
    detail: "using only informal services, or none",
    national: 8,
  },
  { id: "finscope_excluded", label: "Financially excluded", detail: "using no financial service at all", national: 4 },
] as const;

/** How many adults each district would need to reach for its rate to fall to a chosen target. */
export function ReachCalculator() {
  const [measureId, setMeasureId] = useState<(typeof MEASURES)[number]["id"]>("finscope_not_formally_included");
  const [target, setTarget] = useState(4);
  const measure = MEASURES.find((m) => m.id === measureId)!;
  const rows = useMemo(() => reachScenario(target, measureId), [target, measureId]);
  const total = rows.reduce((s, r) => s + r.toReach, 0);
  const above = rows.filter((r) => r.toReach > 0);
  const top5 = rows.slice(0, 5).reduce((s, r) => s + r.toReach, 0);
  const chart = rows.slice(0, 12).filter((r) => r.toReach > 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted">Your scenario</p>
          <StatusBadge status="scenario" />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Measure">
          {MEASURES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={m.id === measureId}
              onClick={() => {
                setMeasureId(m.id);
                setTarget(Math.min(target, m.national));
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors",
                m.id === measureId ? "bg-navy-900 text-white" : "bg-paper text-ink/80 hover:bg-line/70",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <label id="reach-target-label" className="mt-6 block text-[14px] font-semibold text-ink">
          Target: at most <span className="text-royal">{target}%</span> of adults {measure.detail}, in every district
        </label>
        <Slider
          className="mt-3"
          aria-labelledby="reach-target-label"
          aria-label="Target rate"
          min={0}
          max={10}
          step={0.5}
          value={[target]}
          onValueChange={([v]) => setTarget(v)}
        />
        <div className="flex justify-between text-[11px] text-muted">
          <span>0%</span>
          <span>National today: {measure.national}%</span>
          <span>10%</span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-paper p-4">
            <dt className="text-[12px] text-muted">Adults to reach</dt>
            <dd className="mt-1 font-display text-3xl font-semibold text-ink">{formatNumber(total)}</dd>
          </div>
          <div className="rounded-xl bg-paper p-4">
            <dt className="text-[12px] text-muted">Districts above the target</dt>
            <dd className="mt-1 font-display text-3xl font-semibold text-ink">
              {above.length}
              <span className="text-lg text-muted"> / {rows.length}</span>
            </dd>
          </div>
          <div className="col-span-2 rounded-xl bg-paper p-4">
            <dt className="text-[12px] text-muted">Share of the effort in the 5 districts with most to do</dt>
            <dd className="mt-1 font-display text-2xl font-semibold text-ink">{total ? Math.round((top5 / total) * 100) : 0}%</dd>
          </div>
        </dl>
        <p className="mt-4 text-[12px] leading-5 text-muted">
          Arithmetic: (district rate − target) × projected adults 16+ in 2024. District rates come from FinScope 2024 (Figure 13,
          about ±3 points) and adults from NISR&apos;s 2024 projections. Nyarugenge has no separate excluded figure.
        </p>
      </div>

      <div className="card p-5 sm:p-6">
        <p className="font-display text-lg font-semibold text-ink">Where the adults to reach are</p>
        <p className="text-[13px] text-muted">Top districts by number of adults, under your target</p>
        {chart.length ? (
          <div
            className="mt-4 h-[380px]"
            role="img"
            aria-label={`Adults to reach by district at a ${target}% target; the table below lists all districts.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 0 }} barCategoryGap={6}>
                <CartesianGrid {...GRID} horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => formatNumber(v)} {...AXIS} />
                <YAxis type="category" dataKey="name" width={96} {...AXIS} />
                <Tooltip content={<ChartTooltip unit=" adults" />} cursor={{ fill: "rgba(10,27,61,0.04)" }} />
                <Bar dataKey="toReach" name="Adults to reach" fill={BRAND.blue} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  <LabelList
                    dataKey="toReach"
                    position="right"
                    formatter={(v: unknown) => formatNumber(Number(v))}
                    fill={INK}
                    fontSize={11.5}
                    fontWeight={700}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4 flex h-[380px] flex-col items-center justify-center rounded-xl bg-paper text-center">
            <p className="font-display text-lg font-semibold text-ink">Every district already meets this target</p>
            <p className="mt-1 max-w-xs text-[13px] text-muted">
              Lower the target to see where adults would still need to be reached.
            </p>
          </div>
        )}
        <details className="mt-4 rounded-xl border border-line">
          <summary className="cursor-pointer px-4 py-3 text-[13px] font-semibold text-ink">Table: all districts</summary>
          <div className="scrollbar-thin max-h-80 overflow-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead className="sticky top-0 bg-paper text-[11px] uppercase tracking-[0.06em] text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2">
                    District
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    Rate 2024
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    Adults 16+
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    To reach
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.slug} className="border-t border-line">
                    <th scope="row" className="px-4 py-1.5 font-semibold">
                      <Link href={`/districts/${r.slug}`} className="text-ink hover:text-royal">
                        {r.name}
                      </Link>
                    </th>
                    <td className="tabular px-4 py-1.5 text-right">{r.rate}%</td>
                    <td className="tabular px-4 py-1.5 text-right">{formatNumber(r.adults)}</td>
                    <td className="tabular px-4 py-1.5 text-right font-semibold">{formatNumber(r.toReach)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
