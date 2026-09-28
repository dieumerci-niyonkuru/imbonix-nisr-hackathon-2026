"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, CategoryTick, ChartTooltip, GRID } from "@/components/charts/recharts/chart-theme";
import { WHITE } from "@/lib/palette";
import { textOn } from "@/lib/scales";

export type ShareSeries = { key: string; label: string; color: string }[];

/** Segments narrower than this share are left unlabelled in the bar; the table below the chart still gives them. */
const LABEL_MIN_SHARE = 8;
const NARROW_LABEL_MIN_SHARE = 16;
const NARROW_CHART_WIDTH = 420;
const ROW_HEIGHT = 46;

/**
 * Horizontal 100% bars: one row per category, split into the given series, with a white gap between slices. Under the
 * bars a table gives every value, one row per series with its colour, so it is also the legend and no slice depends on
 * being wide enough for a label.
 */
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
              <Bar
                key={segment.key}
                dataKey={segment.key}
                name={segment.label}
                stackId="share"
                fill={segment.color}
                stroke={WHITE}
                strokeWidth={2}
              >
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
      <table className="mt-4 w-full table-fixed text-[12.5px]">
        <caption className="sr-only">Every value in the chart</caption>
        <thead>
          <tr className="text-muted">
            <th scope="col" className="w-[38%] pb-1.5 text-left font-semibold">
              <span className="sr-only">Group</span>
            </th>
            {rows.map((row) => (
              <th key={String(row[categoryKey])} scope="col" className="pb-1.5 pl-2 text-right align-bottom font-semibold">
                {row[categoryKey]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {series.map((segment) => (
            <tr key={segment.key} className="border-t border-line">
              <th scope="row" className="py-1.5 text-left font-medium text-ink">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: segment.color }} aria-hidden="true" />
                  {segment.label}
                </span>
              </th>
              {rows.map((row) => (
                <td key={String(row[categoryKey])} className="tabular py-1.5 pl-2 text-right font-semibold text-ink">
                  {row[segment.key]}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
