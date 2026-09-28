"use client";

import type { ReactNode } from "react";
import { Text } from "recharts";
import { LINE, MUTED } from "@/lib/palette";

/** Shared Recharts styling: hairline solid grid, muted axis text, white tooltip (see the dataviz rules in README). */
export const AXIS = {
  tick: { fill: MUTED, fontSize: 11.5, fontFamily: "Manrope Variable, sans-serif" },
  axisLine: { stroke: LINE },
  tickLine: false as const,
};

export const GRID = { stroke: LINE, strokeDasharray: "0" };

/**
 * A percentage axis from zero that fits the data: up to 100% once a value passes 60%, otherwise up to the next round
 * step above the largest value, so short bars are not lost at the bottom of an empty scale.
 */
export function percentScale(values: number[]): { domain: [number, number]; ticks: number[] } {
  const highest = Math.max(0, ...values);
  if (highest > 60) return { domain: [0, 100], ticks: [0, 25, 50, 75, 100] };
  const step = highest > 25 ? 10 : 5;
  const top = Math.max(step, Math.ceil((highest * 1.12) / step) * step);
  return { domain: [0, top], ticks: Array.from({ length: top / step + 1 }, (_, index) => index * step) };
}

type Payload = { name?: string | number; value?: number | string; color?: string; dataKey?: string | number };

/** Tooltip content: series swatch, name and value; values stay in ink, the swatch carries identity. */
export function ChartTooltip({
  active,
  payload,
  label,
  unit = "%",
  title,
}: {
  active?: boolean;
  payload?: Payload[];
  label?: ReactNode;
  unit?: string;
  title?: (label: ReactNode) => ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-44 rounded-xl bg-white px-3.5 py-3 text-ink shadow-lift ring-1 ring-line">
      <p className="text-[12px] font-bold">{title ? title(label) : label}</p>
      <ul className="mt-1.5 space-y-1">
        {payload.map((p) => (
          <li key={String(p.dataKey ?? p.name)} className="flex items-center justify-between gap-4 text-[12px]">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="tabular font-semibold">
              {p.value}
              {unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A category axis label that wraps onto a second line instead of running into the bars. */
export function CategoryTick({
  x,
  y,
  payload,
  labelWidth,
}: {
  x?: number | string;
  y?: number | string;
  payload?: { value?: string | number };
  labelWidth: number;
}) {
  return (
    <Text
      x={Number(x)}
      y={Number(y)}
      width={labelWidth}
      textAnchor="end"
      verticalAnchor="middle"
      fill={MUTED}
      fontSize={11.5}
      fontFamily="Manrope Variable, sans-serif"
    >
      {String(payload?.value ?? "")}
    </Text>
  );
}

export function LegendRow({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
