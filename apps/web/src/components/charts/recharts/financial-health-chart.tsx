"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, ChartTooltip, GRID, LegendRow } from "@/components/charts/recharts/chart-theme";
import { FINANCIAL_HEALTH } from "@/lib/national";
import { DEEP_CYAN, INK, MUTED, RAMPS } from "@/lib/palette";

const NOW = DEEP_CYAN;
const TARGET = RAMPS.cyan[0];

/** FinScope 2024 financial health segments against the Roadmap's 2030 targets. */
export function FinancialHealthChart() {
  return (
    <div>
      <div
        className="h-64"
        role="img"
        aria-label="Financial health of adults in 2024 against 2030 targets: healthy 10% (target 20%), coping 57% (70%), vulnerable 31% (10%), extremely vulnerable 3% (0%)."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={FINANCIAL_HEALTH}
            layout="vertical"
            margin={{ top: 4, right: 36, bottom: 4, left: 0 }}
            barGap={3}
            barCategoryGap={14}
          >
            <CartesianGrid {...GRID} horizontal={false} />
            <XAxis type="number" domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} unit="%" {...AXIS} />
            <YAxis type="category" dataKey="segment" width={128} {...AXIS} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(10,27,61,0.04)" }} />
            <Bar dataKey="now" name="2024 (FinScope)" fill={NOW} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="now"
                position="right"
                formatter={(v: unknown) => `${v}%`}
                fill={INK}
                fontSize={11.5}
                fontWeight={700}
              />
            </Bar>
            <Bar dataKey="target" name="2030 target (Roadmap)" fill={TARGET} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="target" position="right" formatter={(v: unknown) => `${v}%`} fill={MUTED} fontSize={11.5} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3">
        <LegendRow
          items={[
            { label: "2024 (FinScope)", color: NOW },
            { label: "2030 target (Roadmap)", color: TARGET },
          ]}
        />
      </div>
    </div>
  );
}
