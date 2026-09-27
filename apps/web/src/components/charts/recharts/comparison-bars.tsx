"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, CategoryTick, ChartTooltip, GRID, LegendRow } from "@/components/charts/recharts/chart-theme";
import { MUTED } from "@/lib/palette";

export type ComparisonSeries = { key: string; label: string; color: string }[];

const ROW_HEIGHT = 62;

/** Two values per category as paired horizontal bars, such as two survey years or a level and its target. */
export function ComparisonBars({
  rows,
  categoryKey,
  series,
  description,
  labelWidth = 118,
}: {
  rows: Record<string, string | number>[];
  categoryKey: string;
  series: ComparisonSeries;
  description: string;
  labelWidth?: number;
}) {
  return (
    <div>
      <div style={{ height: rows.length * ROW_HEIGHT + 36 }} role="img" aria-label={description}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
            barCategoryGap={14}
            barGap={3}
          >
            <CartesianGrid {...GRID} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} unit="%" {...AXIS} />
            <YAxis
              type="category"
              dataKey={categoryKey}
              width={labelWidth + 8}
              {...AXIS}
              tick={(tickProps) => <CategoryTick {...tickProps} labelWidth={labelWidth} />}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,36,84,0.04)" }} />
            {series.map((entry) => (
              <Bar key={entry.key} dataKey={entry.key} name={entry.label} fill={entry.color} radius={[0, 5, 5, 0]}>
                <LabelList
                  dataKey={entry.key}
                  position="right"
                  formatter={(value: unknown) => `${value}%`}
                  fill={MUTED}
                  fontSize={11}
                  fontWeight={700}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3">
        <LegendRow items={series.map((entry) => ({ label: entry.label, color: entry.color }))} />
      </div>
    </div>
  );
}
