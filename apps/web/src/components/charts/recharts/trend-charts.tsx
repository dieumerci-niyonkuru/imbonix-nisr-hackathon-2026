"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS, GRID, LegendRow } from "@/components/charts/recharts/chart-theme";
import { StatusBadge } from "@/components/ui/status-badge";
import { CHART_CYAN, DEEP_CYAN, INK, LIGHT_GREY, WHITE } from "@/lib/palette";
import { formatPoint, type DistrictSpreadYear, type TrendPoint } from "@/lib/timeline";

/**
 * One line of a trend chart: a series of survey periods and its colour. Its latest value is written to the right of
 * its last point, or above or below it when another line's label or continuation would sit in the same place.
 */
export type TrendLine = {
  key: string;
  label: string;
  color: string;
  points: TrendPoint[];
  endLabel?: "right" | "above" | "below";
};

type Row = { x: number; period: string } & Record<string, number | string>;

/** The lines' points merged into one row per period, oldest first, for Recharts. */
function mergeRows(lines: TrendLine[]): Row[] {
  const rows = new Map<number, Row>();
  for (const line of lines) {
    for (const point of line.points) {
      const row = rows.get(point.x) ?? { x: point.x, period: point.period };
      row[line.key] = point.value;
      rows.set(point.x, row);
    }
  }
  return [...rows.values()].sort((first, second) => first.x - second.x);
}

/** An axis that starts at zero and ends at a round number just above the largest value. */
function zeroBasedScale(values: number[]): { domain: [number, number]; ticks: number[] } {
  const highest = Math.max(0, ...values);
  if (highest > 60 && highest <= 100) return { domain: [0, 100], ticks: [0, 25, 50, 75, 100] };
  const rough = highest / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough || 1));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough) ?? rough;
  const top = Math.ceil((highest * 1.08) / step) * step;
  return { domain: [0, top], ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step) };
}

/** A short axis label: 13,246,394 people reads as 13.2M; percentages keep their sign. */
function axisLabel(value: number, unit: string): string {
  if (unit === "%") return `${Math.round(value * 10) / 10}%`;
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}M`;
  if (value >= 10_000) return `${Math.round(value / 100) / 10}k`;
  return value.toLocaleString("en-US");
}

type TooltipEntry = { name?: string | number; value?: number | string; color?: string; dataKey?: string | number };

/** The period and each line's value in its unit; the swatch carries the line's identity, the text stays in ink. */
function TrendTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: (TooltipEntry & { payload?: Row })[];
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-44 rounded-xl bg-white px-3.5 py-3 text-ink shadow-lift ring-1 ring-line">
      <p className="text-[12px] font-bold">{payload[0].payload?.period}</p>
      <ul className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <li key={String(entry.dataKey)} className="flex items-center justify-between gap-4 text-[12px]">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="tabular font-semibold">{formatPoint(Number(entry.value), unit)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One to three measures over the survey rounds, on one axis from zero. Rounds sit at their real distance apart, each
 * point is marked, and the latest value of each line is written at its end. Two or more lines get a legend.
 */
export function TrendLines({
  lines,
  unit,
  description,
  height = 280,
}: {
  lines: TrendLine[];
  unit: string;
  description: string;
  height?: number;
}) {
  const rows = mergeRows(lines);
  const periodAt = Object.fromEntries(rows.map((row) => [row.x, row.period]));
  const scale = zeroBasedScale(lines.flatMap((line) => line.points.map((point) => point.value)));
  const lastIndex = (line: TrendLine) => rows.findIndex((row) => row.x === line.points[line.points.length - 1].x);

  return (
    <div>
      <div style={{ height }} role="img" aria-label={description}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 20, right: 44, bottom: 4, left: 0 }}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis
              dataKey="x"
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={rows.map((row) => row.x)}
              tickFormatter={(x: number) => periodAt[x] ?? ""}
              interval="preserveStartEnd"
              minTickGap={10}
              padding={{ left: 14, right: 14 }}
              {...AXIS}
            />
            <YAxis
              domain={scale.domain}
              ticks={scale.ticks}
              tickFormatter={(value: number) => axisLabel(value, unit)}
              width={52}
              {...AXIS}
            />
            <Tooltip content={<TrendTooltip unit={unit} />} cursor={{ stroke: LIGHT_GREY }} />
            {lines.map((line) => (
              <Line
                key={line.key}
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 4, fill: line.color, stroke: WHITE, strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: WHITE, strokeWidth: 2 }}
                connectNulls
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={line.key}
                  content={(props) => {
                    const { x, y, value, index } = props as { x?: number; y?: number; value?: number; index?: number };
                    if (index !== lastIndex(line) || x === undefined || y === undefined || value === undefined) return null;
                    return (
                      <text
                        x={line.endLabel === "above" ? Number(x) - 6 : Number(x) + 8}
                        y={
                          line.endLabel === "above" ? Number(y) - 10 : line.endLabel === "below" ? Number(y) + 16 : Number(y) + 4
                        }
                        textAnchor={line.endLabel === "above" ? "end" : "start"}
                        fill={INK}
                        fontSize={12}
                        fontWeight={700}
                      >
                        {axisLabel(Number(value), unit === "%" ? "%" : "")}
                      </text>
                    );
                  }}
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {lines.length > 1 && (
        <div className="mt-2">
          <LegendRow items={lines.map((line) => ({ label: line.label, color: line.color }))} />
        </div>
      )}
    </div>
  );
}

/** One measure in a grid of small trend charts. `better` says which way is an improvement, if either is. */
export type TrendMultiple = {
  id: string;
  label: string;
  unit: string;
  better: "higher" | "lower" | "neutral";
  points: TrendPoint[];
};

/**
 * A grid of small trend charts, one measure each, all drawn the same way so they compare at a glance: the latest
 * value, the change since the first round, and the line from zero. Each chart has its own scale.
 */
export function TrendMultiples({ items, columns = 3 }: { items: TrendMultiple[]; columns?: 2 | 3 }) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${columns === 3 ? "xl:grid-cols-3" : ""}`}>
      {items.map((item) => {
        const first = item.points[0];
        const latest = item.points[item.points.length - 1];
        const change = latest.value - first.value;
        const improved = item.better === "neutral" ? false : item.better === "higher" ? change > 0 : change < 0;
        const scale = zeroBasedScale(item.points.map((point) => point.value));
        const changeText =
          item.unit === "%"
            ? `${change > 0 ? "up" : "down"} ${Math.abs(Math.round(change * 10) / 10)} points`
            : `${change > 0 ? "up" : "down"} from ${formatPoint(first.value, item.unit)}`;
        return (
          <li key={item.id} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[13.5px] font-semibold leading-5 text-ink">{item.label}</p>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-[26px] font-bold leading-none tracking-[-0.02em] text-ink">
                {formatPoint(latest.value, item.unit)}
              </span>
              <span className="text-[12.5px] text-muted">in {latest.period}</span>
            </p>
            <p className="mt-1 text-[12.5px] leading-5 text-muted">
              <span className={improved ? "font-semibold text-cyan-ink" : "font-semibold text-ink"}>{changeText}</span> since{" "}
              {first.period}
            </p>
            <div
              className="mt-3 h-28"
              role="img"
              aria-label={`${item.label}: ${item.points.map((point) => `${point.period} ${formatPoint(point.value, item.unit)}`).join(", ")}.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={item.points} margin={{ top: 6, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid {...GRID} vertical={false} />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    ticks={[first.x, latest.x]}
                    interval={0}
                    padding={{ left: 8, right: 8 }}
                    tickFormatter={(x: number) => item.points.find((point) => point.x === x)?.period ?? ""}
                    {...AXIS}
                  />
                  <YAxis domain={scale.domain} ticks={scale.ticks} hide />
                  <Tooltip
                    content={({ active, payload }) => {
                      const point = active ? (payload?.[0]?.payload as TrendPoint | undefined) : undefined;
                      if (!point) return null;
                      return (
                        <div className="rounded-lg bg-white px-3 py-2 text-[12px] text-ink shadow-lift ring-1 ring-line">
                          <span className="font-bold">{point.period}</span>{" "}
                          <span className="tabular">{formatPoint(point.value, item.unit)}</span>
                        </div>
                      );
                    }}
                    cursor={{ stroke: LIGHT_GREY }}
                  />
                  <Line
                    dataKey="value"
                    stroke={CHART_CYAN}
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: CHART_CYAN, stroke: WHITE, strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: DEEP_CYAN, stroke: WHITE, strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * How the 30 districts spread each year: a pale band from the lowest to the highest district and a line for the median
 * district. Hovering a year names the lowest and highest districts.
 */
export function DistrictSpreadChart({
  years,
  unit,
  description,
  height = 280,
}: {
  years: DistrictSpreadYear[];
  unit: string;
  description: string;
  height?: number;
}) {
  const rows = years.map((year) => ({ ...year, range: [year.low, year.high] as [number, number] }));
  const scale = zeroBasedScale(years.map((year) => year.high));
  return (
    <div>
      <div style={{ height }} role="img" aria-label={description}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey="year" type="number" domain={["dataMin", "dataMax"]} ticks={rows.map((row) => row.year)} {...AXIS} />
            <YAxis
              domain={scale.domain}
              ticks={scale.ticks}
              tickFormatter={(value: number) => axisLabel(value, unit)}
              width={52}
              {...AXIS}
            />
            <Tooltip
              cursor={{ stroke: LIGHT_GREY }}
              content={({ active, payload }) => {
                const year = active ? (payload?.[0]?.payload as DistrictSpreadYear | undefined) : undefined;
                if (!year) return null;
                return (
                  <div className="min-w-52 rounded-xl bg-white px-3.5 py-3 text-[12px] text-ink shadow-lift ring-1 ring-line">
                    <p className="flex items-center gap-2 font-bold">
                      {year.year}
                      {year.calculated && <StatusBadge status="calculated" />}
                    </p>
                    <dl className="mt-1.5 grid grid-cols-[auto_auto] gap-x-4 gap-y-1">
                      <dt className="text-muted">Highest, {year.highDistrict}</dt>
                      <dd className="tabular text-right font-semibold">{formatPoint(year.high, unit)}</dd>
                      <dt className="text-muted">Median district</dt>
                      <dd className="tabular text-right font-semibold">{formatPoint(year.median, unit)}</dd>
                      <dt className="text-muted">Lowest, {year.lowDistrict}</dt>
                      <dd className="tabular text-right font-semibold">{formatPoint(year.low, unit)}</dd>
                    </dl>
                  </div>
                );
              }}
            />
            <Area
              dataKey="range"
              name="Lowest to highest district"
              stroke="none"
              fill={CHART_CYAN}
              fillOpacity={0.18}
              isAnimationActive={false}
            />
            <Line
              dataKey="median"
              name="Median district"
              stroke={DEEP_CYAN}
              strokeWidth={2}
              dot={{ r: 3.5, fill: DEEP_CYAN, stroke: WHITE, strokeWidth: 1.5 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-sm opacity-40" style={{ background: CHART_CYAN }} /> Lowest to highest district
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5" style={{ background: DEEP_CYAN }} /> Median district
        </span>
      </div>
    </div>
  );
}
