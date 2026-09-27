"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "@/components/charts/recharts/chart-theme";
import { cn } from "@/lib/utils";

export type DonutSegment = { label: string; share: number; color: string };

/**
 * Parts of a whole as a ring, with the headline share in the middle and a legend with values beside it. `stacked`
 * puts the legend under the ring, for narrow cards such as a row of three.
 */
export function ShareDonut({
  segments,
  centerValue,
  centerLabel,
  description,
  stacked = false,
}: {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
  description: string;
  stacked?: boolean;
}) {
  return (
    <div className={cn("grid items-center gap-6", !stacked && "sm:grid-cols-2")}>
      <div className="relative mx-auto h-56 w-full max-w-[240px]" role="img" aria-label={description}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="share"
              nameKey="label"
              innerRadius="64%"
              outerRadius="96%"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {segments.map((segment) => (
                <Cell key={segment.label} fill={segment.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip title={() => centerLabel} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
          <span className="font-display text-3xl font-bold tracking-[-0.02em] text-ink">{centerValue}</span>
          <span className="text-[12px] font-semibold leading-4 text-muted">{centerLabel}</span>
        </div>
      </div>
      <ul className="grid gap-2.5" aria-hidden="true">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-3 text-[13.5px]">
            <span className="flex items-center gap-2 text-ink">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: segment.color }} />
              {segment.label}
            </span>
            <span className="tabular font-bold text-ink">{segment.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
