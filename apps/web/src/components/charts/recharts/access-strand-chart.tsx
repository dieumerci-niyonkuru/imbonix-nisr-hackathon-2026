"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, ChartTooltip, GRID, LegendRow } from "@/components/charts/recharts/chart-theme";
import { ACCESS_STRAND } from "@/lib/national";
import { RAMPS } from "@/lib/palette";
import { textOn } from "@/lib/scales";

export const STRAND_SERIES = [
  { key: "banked", label: "Banked", color: RAMPS.blue[3] },
  { key: "otherFormal", label: "Formal non-bank only", color: RAMPS.blue[0] },
  { key: "informalOnly", label: "Informal only", color: RAMPS.gold[0] },
  { key: "excluded", label: "Excluded", color: RAMPS.gold[3] },
] as const;

/** FinScope access strand, 2020 against 2024: every adult once, by the most formal service they use. */
export function AccessStrandChart() {
  return (
    <div>
      <div
        className="h-44"
        role="img"
        aria-label="FinScope access strand, 2020 and 2024: banked 22% both years; formal non-bank only 55% then 70%; informal only 16% then 4%; excluded 7% then 4%."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ACCESS_STRAND} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 0 }} barCategoryGap={18}>
            <CartesianGrid {...GRID} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} unit="%" {...AXIS} />
            <YAxis type="category" dataKey="year" width={44} {...AXIS} />
            <Tooltip content={<ChartTooltip title={(l) => `Adults 16+, ${l}`} />} cursor={{ fill: "rgba(10,27,61,0.04)" }} />
            {STRAND_SERIES.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stackId="strand"
                fill={s.color}
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={s.key}
                  position="center"
                  formatter={(v: unknown) => (Number(v) >= 8 ? `${v}%` : "")}
                  fill={textOn(s.color)}
                  fontSize={12}
                  fontWeight={700}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3">
        <LegendRow items={STRAND_SERIES.map((s) => ({ label: s.label, color: s.color }))} />
      </div>
    </div>
  );
}
