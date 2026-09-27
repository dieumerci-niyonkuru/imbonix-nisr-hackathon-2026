"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, CategoryTick, ChartTooltip, GRID, LegendRow } from "@/components/charts/recharts/chart-theme";
import { textOn } from "@/lib/scales";

export type ShareSeries = { key: string; label: string; color: string }[];

/** Segments narrower than this share are left unlabelled (the tooltip still shows them); narrow charts need wider segments. */
const LABEL_MIN_SHARE = 8;
const NARROW_LABEL_MIN_SHARE = 16;
const NARROW_CHART_WIDTH = 420;
const ROW_HEIGHT = 46;

/** Horizontal 100% bars: one row per category, split into the given series. */
export function StackedShareChart({
  rows,
  categoryKey,
  series,
  description,
  labelWidth = 104,
}: {
  rows: Record<string, string | number>[];
  categoryKey: string;
  series: ShareSeries;
  description: string;
  labelWidth?: number;
}) {
  const [chartWidth, setChartWidth] = useState<number>();
  const minimumLabelledShare =
    chartWidth !== undefined && chartWidth < NARROW_CHART_WIDTH ? NARROW_LABEL_MIN_SHARE : LABEL_MIN_SHARE;

  return (
    <div>
      <div style={{ height: rows.length * ROW_HEIGHT + 36 }} role="img" aria-label={description}>
        <ResponsiveContainer width="100%" height="100%" onResize={(width) => setChartWidth(width)}>
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barCategoryGap={10}>
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
            {series.map((segment) => (
              <Bar key={segment.key} dataKey={segment.key} name={segment.label} stackId="share" fill={segment.color}>
                <LabelList
                  dataKey={segment.key}
                  position="center"
                  formatter={(value: unknown) => (Number(value) >= minimumLabelledShare ? `${value}%` : "")}
                  fill={textOn(segment.color)}
                  fontSize={11.5}
                  fontWeight={700}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3">
        <LegendRow items={series.map((segment) => ({ label: segment.label, color: segment.color }))} />
      </div>
    </div>
  );
}
