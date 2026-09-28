"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, CategoryTick, ChartTooltip, GRID, percentScale } from "@/components/charts/recharts/chart-theme";
import { MUTED } from "@/lib/palette";

export type ValueBar = { label: string; value: number; color: string };

const ROW_HEIGHT = 44;

/** One value per bar, each with its own colour: upright columns, or horizontal rows for long labels. */
export function ValueBars({
  bars,
  seriesName,
  description,
  orientation = "column",
  labelWidth = 104,
}: {
  bars: ValueBar[];
  seriesName: string;
  description: string;
  orientation?: "column" | "row";
  labelWidth?: number;
}) {
  const isRow = orientation === "row";
  const scale = percentScale(bars.map((bar) => bar.value));
  const valueLabel = (
    <LabelList
      dataKey="value"
      position={isRow ? "right" : "top"}
      formatter={(value: unknown) => `${value}%`}
      fill={MUTED}
      fontSize={12}
      fontWeight={700}
    />
  );

  return (
    <div style={{ height: isRow ? bars.length * ROW_HEIGHT + 36 : 256 }} role="img" aria-label={description}>
      <ResponsiveContainer width="100%" height="100%">
        {isRow ? (
          <BarChart data={bars} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap={10}>
            <CartesianGrid {...GRID} horizontal={false} />
            <XAxis type="number" domain={scale.domain} ticks={scale.ticks} unit="%" {...AXIS} />
            <YAxis
              type="category"
              dataKey="label"
              width={labelWidth + 8}
              {...AXIS}
              tick={(tickProps) => <CategoryTick {...tickProps} labelWidth={labelWidth} />}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,36,84,0.04)" }} />
            <Bar dataKey="value" name={seriesName} radius={[0, 5, 5, 0]}>
              {bars.map((bar) => (
                <Cell key={bar.label} fill={bar.color} />
              ))}
              {valueLabel}
            </Bar>
          </BarChart>
        ) : (
          <BarChart data={bars} margin={{ top: 24, right: 8, bottom: 0, left: -14 }} barCategoryGap="30%">
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey="label" {...AXIS} />
            <YAxis domain={scale.domain} ticks={scale.ticks} unit="%" {...AXIS} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,36,84,0.04)" }} />
            <Bar dataKey="value" name={seriesName} radius={[6, 6, 0, 0]} maxBarSize={96}>
              {bars.map((bar) => (
                <Cell key={bar.label} fill={bar.color} />
              ))}
              {valueLabel}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
