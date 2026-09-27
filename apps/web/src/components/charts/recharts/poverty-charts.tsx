"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, ChartTooltip, GRID, LegendRow } from "@/components/charts/recharts/chart-theme";
import { POVERTY_BY_PROVINCE, POVERTY_TREND } from "@/lib/national";
import { CORE, INK, RAMPS } from "@/lib/palette";

const POVERTY = RAMPS.navy[1];
const EXTREME = RAMPS.navy[3];

/** EICV7 poverty and extreme poverty, 2016/17 (modelled on the new method) and 2023/24. */
export function PovertyTrendChart() {
  return (
    <div>
      <div
        className="h-60"
        role="img"
        aria-label="Poverty fell from 39.8% in 2016/17 to 27.4% in 2023/24; extreme poverty from 11.3% to 5.4%."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={POVERTY_TREND} margin={{ top: 20, right: 8, bottom: 4, left: -12 }} barGap={4} barCategoryGap={40}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey="period" {...AXIS} />
            <YAxis domain={[0, 45]} ticks={[0, 10, 20, 30, 40]} unit="%" {...AXIS} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(10,27,61,0.04)" }} />
            <Bar dataKey="poverty" name="Poverty" fill={POVERTY} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="poverty"
                position="top"
                formatter={(v: unknown) => `${v}%`}
                fill={INK}
                fontSize={12}
                fontWeight={700}
              />
            </Bar>
            <Bar dataKey="extreme" name="Extreme poverty" fill={EXTREME} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="extreme"
                position="top"
                formatter={(v: unknown) => `${v}%`}
                fill={INK}
                fontSize={12}
                fontWeight={700}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2">
        <LegendRow
          items={[
            { label: "Poverty", color: POVERTY },
            { label: "Extreme poverty", color: EXTREME },
          ]}
        />
      </div>
    </div>
  );
}

/** EICV7 poverty rate by province, 2023/24 (one series, so one colour and no legend). */
export function PovertyProvinceChart() {
  return (
    <div
      className="h-56"
      role="img"
      aria-label="Poverty by province, 2023/24: Western 37.4%, Southern 34.7%, Eastern 26.8%, Northern 20.2%, Kigali City 9.1%."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={POVERTY_BY_PROVINCE}
          layout="vertical"
          margin={{ top: 4, right: 40, bottom: 4, left: 0 }}
          barCategoryGap={10}
        >
          <CartesianGrid {...GRID} horizontal={false} />
          <XAxis type="number" domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} unit="%" {...AXIS} />
          <YAxis type="category" dataKey="province" width={88} {...AXIS} />
          <Tooltip content={<ChartTooltip title={(l) => `${l} Province`} />} cursor={{ fill: "rgba(10,27,61,0.04)" }} />
          <Bar dataKey="value" name="Poverty rate" fill={CORE.navy} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: unknown) => `${v}%`}
              fill={INK}
              fontSize={12}
              fontWeight={700}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
