"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS, GRID, LegendRow } from "@/components/charts/recharts/chart-theme";
import { CHART_CYAN, INK, LIGHT_GREY, RAMPS, WHITE } from "@/lib/palette";
import { FINANCIAL_INCLUSION_TREND } from "@/lib/finscope-2024";

const INCLUSION_COLOR = CHART_CYAN;
const PROTECTION_COLOR = RAMPS.cyan[3];
const POVERTY_COLOR = RAMPS.grey[3];

const HEALTH_INSURANCE_TREND = [
  { year: 2005, value: 43.3 },
  { year: 2010, value: 68.8 },
  { year: 2013, value: 70 },
  { year: 2016, value: 73.9 },
  { year: 2023, value: 85.3 },
];

const POVERTY_TREND = [
  { year: 2016, value: 39.8 },
  { year: 2023, value: 27.4 },
];

type Row = {
  year: number;
  inclusion?: number;
  protection?: number;
  poverty?: number;
};

function buildRows(): Row[] {
  const map = new Map<number, Row>();
  const ensure = (year: number) => {
    if (!map.has(year)) map.set(year, { year });
    return map.get(year)!;
  };

  for (const p of FINANCIAL_INCLUSION_TREND) {
    ensure(Number(p.year)).inclusion = p.included;
  }
  for (const p of HEALTH_INSURANCE_TREND) {
    ensure(p.year).protection = p.value;
  }
  for (const p of POVERTY_TREND) {
    ensure(p.year).poverty = p.value;
  }

  return [...map.values()].sort((a, b) => a.year - b.year);
}

type TooltipEntry = {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

function OverviewTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const seen = new Set<string>();
  const unique = payload.filter((entry) => {
    const key = String(entry.dataKey);
    if (seen.has(key) || entry.value === undefined) return false;
    seen.add(key);
    return true;
  });
  if (!unique.length) return null;
  return (
    <div className="min-w-56 rounded-xl bg-white px-4 py-3 text-ink shadow-lift ring-1 ring-line">
      <p className="text-[13px] font-bold">{label}</p>
      <ul className="mt-2 space-y-1.5">
        {unique.map((entry) => (
          <li key={String(entry.dataKey)} className="flex items-center justify-between gap-5 text-[12.5px]">
            <span className="flex items-center gap-2 text-muted">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="tabular font-bold text-ink">{entry.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EndLabel({
  dataKey,
  rows,
  color,
  position,
}: {
  dataKey: keyof Row;
  rows: Row[];
  color: string;
  position: "above" | "below" | "right";
}) {
  const lastIndex = [...rows].reverse().findIndex((r) => r[dataKey] !== undefined);
  const actualIndex = lastIndex >= 0 ? rows.length - 1 - lastIndex : -1;

  return (
    <LabelList
      dataKey={dataKey}
      content={(props) => {
        const { x, y, value, index } = props as { x?: number; y?: number; value?: number; index?: number };
        if (index !== actualIndex || x === undefined || y === undefined || value === undefined) return null;
        const xPos = position === "right" ? Number(x) + 10 : Number(x);
        const yPos =
          position === "above" ? Number(y) - 12 : position === "below" ? Number(y) + 18 : Number(y) + 4;
        return (
          <text
            x={xPos}
            y={yPos}
            textAnchor={position === "right" ? "start" : "middle"}
            fill={color}
            fontSize={13}
            fontWeight={800}
          >
            {value}%
          </text>
        );
      }}
    />
  );
}

const exploreLink =
  "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-bold transition-colors hover:bg-cyan hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink";

export function NationalOverviewChart() {
  const rows = buildRows();

  const latestInclusion = FINANCIAL_INCLUSION_TREND[FINANCIAL_INCLUSION_TREND.length - 1];
  const firstInclusion = FINANCIAL_INCLUSION_TREND[0];
  const latestInsurance = HEALTH_INSURANCE_TREND[HEALTH_INSURANCE_TREND.length - 1];
  const latestPoverty = POVERTY_TREND[POVERTY_TREND.length - 1];
  const firstPoverty = POVERTY_TREND[0];
  const povertyDrop = Math.round((firstPoverty.value - latestPoverty.value) * 10) / 10;

  return (
    <section className="border-y border-line bg-white py-10 sm:py-14" aria-labelledby="overview-heading">
      <div className="container-page">
        <p className="eyebrow text-cyan-ink">Rwanda at a glance</p>
        <h2
          id="overview-heading"
          className="mt-3 max-w-4xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl"
        >
          More people have money services and insurance — and fewer live in poverty
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px]">
          Since 2008, the share of adults using financial services went from {firstInclusion.included}% to{" "}
          <strong className="font-bold text-ink">{latestInclusion.included}%</strong>. Health insurance coverage grew
          from 43% to <strong className="font-bold text-ink">{latestInsurance.value}%</strong>. And poverty dropped{" "}
          <strong className="font-bold text-ink">{povertyDrop} points</strong> to {latestPoverty.value}%. But many
          people are still left behind — IMBONIX shows where they are.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col rounded-2xl border-l-4 bg-paper px-5 py-4" style={{ borderColor: INCLUSION_COLOR }}>
            <span className="text-[13px] font-bold uppercase tracking-widest" style={{ color: INCLUSION_COLOR }}>
              Financial inclusion
            </span>
            <p className="mt-1.5 font-display text-[32px] font-bold leading-none tracking-[-0.02em] text-ink">
              {latestInclusion.included}%
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-muted">
              of adults use a financial service — up from {firstInclusion.included}% in {firstInclusion.year}
            </p>
            <Link href="/financial-exclusion" className={`${exploreLink} mt-3 self-start text-cyan-ink ring-1 ring-cyan/30`}>
              See the data
              <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col rounded-2xl border-l-4 bg-paper px-5 py-4" style={{ borderColor: PROTECTION_COLOR }}>
            <span className="text-[13px] font-bold uppercase tracking-widest" style={{ color: PROTECTION_COLOR }}>
              Social protection
            </span>
            <p className="mt-1.5 font-display text-[32px] font-bold leading-none tracking-[-0.02em] text-ink">
              {latestInsurance.value}%
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-muted">
              have health insurance — up from 43.3% in 2005
            </p>
            <Link href="/social-protection" className={`${exploreLink} mt-3 self-start text-cyan-ink ring-1 ring-cyan/30`}>
              See the data
              <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col rounded-2xl border-l-4 bg-paper px-5 py-4" style={{ borderColor: POVERTY_COLOR }}>
            <span className="text-[13px] font-bold uppercase tracking-widest" style={{ color: POVERTY_COLOR }}>
              Poverty reduction
            </span>
            <p className="mt-1.5 font-display text-[32px] font-bold leading-none tracking-[-0.02em] text-ink">
              {latestPoverty.value}%
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-muted">
              live in poverty — down {povertyDrop} points from {firstPoverty.value}%
            </p>
            <Link href="/poverty-dynamics" className={`${exploreLink} mt-3 self-start text-cyan-ink ring-1 ring-cyan/30`}>
              See the data
              <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <figure className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-lift sm:p-7">
          <figcaption>
            <p className="font-display text-lg font-bold tracking-[-0.01em] text-ink sm:text-xl">
              How Rwanda changed over time (2005–2024)
            </p>
            <p className="mt-1 text-[13px] leading-5 text-muted">
              Lines going up mean more people have services. The dashed line going down means poverty is falling.
              Each dot is one survey year. Hover any dot for the exact number.
            </p>
          </figcaption>

          <div
            className="mt-6 h-80 sm:h-96"
            role="img"
            aria-label="Line chart: financial inclusion rose from 48% in 2008 to 96% in 2024, social protection (health insurance) from 43% in 2005 to 85% in 2023, and poverty fell from 40% in 2016/17 to 27% in 2023/24."
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rows} margin={{ top: 28, right: 56, bottom: 4, left: 0 }}>
                <CartesianGrid {...GRID} vertical={false} />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[2004, 2025]}
                  ticks={[2005, 2008, 2010, 2012, 2016, 2020, 2023, 2024]}
                  tickFormatter={(y: number) => String(y)}
                  {...AXIS}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(v: number) => `${v}%`}
                  width={44}
                  {...AXIS}
                />
                <Tooltip content={<OverviewTooltip />} cursor={{ stroke: LIGHT_GREY, strokeDasharray: "4 4" }} />

                <Area
                  dataKey="inclusion"
                  stroke="none"
                  fill={INCLUSION_COLOR}
                  fillOpacity={0.12}
                  connectNulls
                  isAnimationActive={false}
                  tooltipType="none"
                />
                <Line
                  dataKey="inclusion"
                  name="Financial inclusion"
                  stroke={INCLUSION_COLOR}
                  strokeWidth={3}
                  dot={{ r: 5, fill: INCLUSION_COLOR, stroke: WHITE, strokeWidth: 2.5 }}
                  activeDot={{ r: 7, fill: INCLUSION_COLOR, stroke: WHITE, strokeWidth: 2.5 }}
                  connectNulls
                  isAnimationActive={false}
                >
                  <EndLabel dataKey="inclusion" rows={rows} color={INK} position="above" />
                </Line>

                <Area
                  dataKey="protection"
                  stroke="none"
                  fill={PROTECTION_COLOR}
                  fillOpacity={0.08}
                  connectNulls
                  isAnimationActive={false}
                  tooltipType="none"
                />
                <Line
                  dataKey="protection"
                  name="Social protection"
                  stroke={PROTECTION_COLOR}
                  strokeWidth={3}
                  dot={{ r: 5, fill: PROTECTION_COLOR, stroke: WHITE, strokeWidth: 2.5 }}
                  activeDot={{ r: 7, fill: PROTECTION_COLOR, stroke: WHITE, strokeWidth: 2.5 }}
                  connectNulls
                  isAnimationActive={false}
                >
                  <EndLabel dataKey="protection" rows={rows} color={INK} position="right" />
                </Line>

                <Area
                  dataKey="poverty"
                  stroke="none"
                  fill={POVERTY_COLOR}
                  fillOpacity={0.06}
                  connectNulls
                  isAnimationActive={false}
                  tooltipType="none"
                />
                <Line
                  dataKey="poverty"
                  name="Poverty reduction"
                  stroke={POVERTY_COLOR}
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  dot={{ r: 5, fill: POVERTY_COLOR, stroke: WHITE, strokeWidth: 2.5 }}
                  activeDot={{ r: 7, fill: POVERTY_COLOR, stroke: WHITE, strokeWidth: 2.5 }}
                  connectNulls
                  isAnimationActive={false}
                >
                  <EndLabel dataKey="poverty" rows={rows} color={INK} position="below" />
                </Line>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3">
            <LegendRow
              items={[
                { label: "Financial inclusion (% of adults)", color: INCLUSION_COLOR },
                { label: "Social protection (% with health insurance)", color: PROTECTION_COLOR },
                { label: "Poverty reduction (% in poverty)", color: POVERTY_COLOR },
              ]}
            />
          </div>

          <p className="mt-2 text-[12.5px] leading-5 text-muted">
            <span className="font-semibold text-ink">How to read: </span>
            The solid lines (financial inclusion and social protection) go up — that is good. The dashed line (poverty)
            goes down — that is also good. If a year has no dot, there was no survey that year.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/financial-exclusion"
              className="inline-flex items-center gap-1 rounded-full bg-cyan px-4 py-2.5 text-[14px] font-bold text-ink transition-colors hover:bg-cyan-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
            >
              Explore financial inclusion
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/social-protection"
              className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2.5 text-[14px] font-bold text-cyan-ink ring-1 ring-cyan/30 transition-colors hover:bg-cyan hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
            >
              Explore social protection
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/poverty-dynamics"
              className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2.5 text-[14px] font-bold text-cyan-ink ring-1 ring-cyan/30 transition-colors hover:bg-cyan hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
            >
              Explore poverty reduction
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <p className="text-[11.5px] leading-4 text-muted">
              Sources: NISR/AFR FinScope surveys 2008 to 2024; NISR EICV and DHS surveys (health insurance 2005/06 to
              2023/24); NISR EICV7 Poverty Profile 2023/24
            </p>
            <button
              type="button"
              onClick={() => {
                const header = "Year,Financial inclusion (%),Social protection (%),Poverty (%),Source";
                const lines = rows.map((r) =>
                  `${r.year},${r.inclusion ?? ""},${r.protection ?? ""},${r.poverty ?? ""},NISR FinScope / EICV / DHS`,
                );
                const blob = new Blob([header + "\n" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "imbonix-national-overview.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[11.5px] font-bold text-cyan-ink ring-1 ring-line transition-colors hover:bg-cyan hover:text-ink"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M8 1a.75.75 0 0 1 .75.75v6.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V1.75A.75.75 0 0 1 8 1ZM2.75 10a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A2.25 2.25 0 0 1 11.75 14.5h-7.5A2.25 2.25 0 0 1 2 12.25v-1.5a.75.75 0 0 1 .75-.75Z" />
              </svg>
              Download CSV
            </button>
          </div>
        </figure>
      </div>
    </section>
  );
}
