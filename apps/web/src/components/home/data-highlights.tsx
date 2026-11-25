"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, ChartTooltip, GRID, LegendRow } from "@/components/charts/recharts/chart-theme";
import { ChartCard, type DownloadData } from "@/components/ui/chart-card";
import { CHART_CYAN, DEEP_CYAN, INK, LIGHT_GREY, MUTED, RAMPS, WHITE } from "@/lib/palette";
import { ACCESS_STRAND, FINANCIAL_HEALTH, POVERTY_BY_PROVINCE, POVERTY_TREND } from "@/lib/national";
import { LIVING_STANDARDS_BY_YEAR } from "@/lib/eicv7-poverty-profile";

function PovertyTrendChart() {
  return (
    <div>
      <div
        className="h-56"
        role="img"
        aria-label="Poverty fell from 39.8% to 27.4%; extreme poverty from 11.3% to 5.4%."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={POVERTY_TREND} margin={{ top: 20, right: 8, bottom: 4, left: -12 }} barGap={4} barCategoryGap={40}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey="period" {...AXIS} />
            <YAxis domain={[0, 45]} ticks={[0, 10, 20, 30, 40]} tickFormatter={(v: number) => `${v}%`} {...AXIS} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(10,27,61,0.04)" }} />
            <Bar dataKey="poverty" name="Poverty" fill={RAMPS.cyan[1]} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="poverty" position="top" formatter={(v: unknown) => `${v}%`} fill={INK} fontSize={12} fontWeight={700} />
            </Bar>
            <Bar dataKey="extreme" name="Extreme poverty" fill={DEEP_CYAN} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="extreme" position="top" formatter={(v: unknown) => `${v}%`} fill={INK} fontSize={12} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2">
        <LegendRow items={[{ label: "Poverty", color: RAMPS.cyan[1] }, { label: "Extreme poverty", color: DEEP_CYAN }]} />
      </div>
    </div>
  );
}

function PovertyProvinceChart() {
  return (
    <div
      className="h-52"
      role="img"
      aria-label="Poverty by province: Western 37.4%, Southern 34.7%, Eastern 26.8%, Northern 20.2%, Kigali City 9.1%."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={POVERTY_BY_PROVINCE} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 0 }} barCategoryGap={10}>
          <CartesianGrid {...GRID} horizontal={false} />
          <XAxis type="number" domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} tickFormatter={(v: number) => `${v}%`} {...AXIS} />
          <YAxis type="category" dataKey="province" width={88} {...AXIS} />
          <Tooltip content={<ChartTooltip title={(l) => `${l} Province`} />} cursor={{ fill: "rgba(10,27,61,0.04)" }} />
          <Bar dataKey="value" name="Poverty rate" fill={DEEP_CYAN} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList dataKey="value" position="right" formatter={(v: unknown) => `${v}%`} fill={INK} fontSize={12} fontWeight={700} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function FinancialHealthChart() {
  return (
    <div>
      <div
        className="h-56"
        role="img"
        aria-label="Financial health: healthy 10% (target 20%), coping 57% (70%), vulnerable 31% (10%), extremely vulnerable 3% (0%)."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={FINANCIAL_HEALTH} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 0 }} barGap={3} barCategoryGap={14}>
            <CartesianGrid {...GRID} horizontal={false} />
            <XAxis type="number" domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} tickFormatter={(v: number) => `${v}%`} {...AXIS} />
            <YAxis type="category" dataKey="segment" width={120} {...AXIS} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(10,27,61,0.04)" }} />
            <Bar dataKey="now" name="2024 (FinScope)" fill={DEEP_CYAN} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="now" position="right" formatter={(v: unknown) => `${v}%`} fill={INK} fontSize={11.5} fontWeight={700} />
            </Bar>
            <Bar dataKey="target" name="2030 target" fill={RAMPS.cyan[0]} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="target" position="right" formatter={(v: unknown) => `${v}%`} fill={MUTED} fontSize={11.5} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2">
        <LegendRow items={[{ label: "2024 (FinScope)", color: DEEP_CYAN }, { label: "2030 target (Roadmap)", color: RAMPS.cyan[0] }]} />
      </div>
    </div>
  );
}

function LivingConditionsChart() {
  const data = LIVING_STANDARDS_BY_YEAR.map((row) => ({
    measure: row.measure.replace("Near an all weather road", "All-weather road").replace("Improved drinking water", "Clean water").replace("Adult literacy", "Literacy").replace("Iron sheet roof", "Iron roof").replace("Planned rural settlement", "Planned settlement"),
    before: row.in2017,
    after: row.in2024,
  }));

  return (
    <div>
      <div
        className="h-56"
        role="img"
        aria-label="Living conditions: all-weather road 93% to 96%, clean water 87% to 90%, literacy 86.7% to 87.7%, iron roof 67% to 76%, planned settlement 59% to 68%."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 0 }} barGap={2} barCategoryGap={10}>
            <CartesianGrid {...GRID} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v: number) => `${v}%`} {...AXIS} />
            <YAxis type="category" dataKey="measure" width={112} {...AXIS} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(10,27,61,0.04)" }} />
            <Bar dataKey="before" name="2016/17" fill={LIGHT_GREY} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="before" position="right" formatter={(v: unknown) => `${v}%`} fill={MUTED} fontSize={11} />
            </Bar>
            <Bar dataKey="after" name="2023/24" fill={CHART_CYAN} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="after" position="right" formatter={(v: unknown) => `${v}%`} fill={INK} fontSize={11} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2">
        <LegendRow items={[{ label: "2016/17", color: LIGHT_GREY }, { label: "2023/24", color: CHART_CYAN }]} />
      </div>
    </div>
  );
}

function AccessStrandChart() {
  return (
    <div>
      <div
        className="h-48"
        role="img"
        aria-label="Access strand: in 2024, banked 22%, other formal 70%, informal only 4%, excluded 4%."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ACCESS_STRAND} margin={{ top: 20, right: 8, bottom: 4, left: -12 }} barGap={2} barCategoryGap={40}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey="year" {...AXIS} />
            <YAxis domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} tickFormatter={(v: number) => `${v}%`} {...AXIS} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(10,27,61,0.04)" }} />
            <Bar dataKey="banked" name="Banked" fill={DEEP_CYAN} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="banked" position="top" formatter={(v: unknown) => `${v}%`} fill={INK} fontSize={11} fontWeight={700} />
            </Bar>
            <Bar dataKey="otherFormal" name="Other formal" fill={CHART_CYAN} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="otherFormal" position="top" formatter={(v: unknown) => `${v}%`} fill={INK} fontSize={11} fontWeight={700} />
            </Bar>
            <Bar dataKey="informalOnly" name="Informal only" fill={RAMPS.cyan[0]} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="informalOnly" position="top" formatter={(v: unknown) => `${v}%`} fill={INK} fontSize={11} fontWeight={700} />
            </Bar>
            <Bar dataKey="excluded" name="Excluded" fill={RAMPS.grey[2]} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="excluded" position="top" formatter={(v: unknown) => `${v}%`} fill={INK} fontSize={11} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2">
        <LegendRow
          items={[
            { label: "Banked", color: DEEP_CYAN },
            { label: "Other formal (mobile money, SACCO)", color: CHART_CYAN },
            { label: "Informal only", color: RAMPS.cyan[0] },
            { label: "Excluded", color: RAMPS.grey[2] },
          ]}
        />
      </div>
    </div>
  );
}

const POVERTY_TREND_CSV: DownloadData = {
  filename: "imbonix-poverty-trend.csv",
  csv: "Period,Poverty (%),Extreme poverty (%),Source\n" +
    POVERTY_TREND.map((r) => `${r.period},${r.poverty},${r.extreme},NISR EICV7 Poverty Profile 2023/24`).join("\n"),
};

const POVERTY_PROVINCE_CSV: DownloadData = {
  filename: "imbonix-poverty-by-province.csv",
  csv: "Province,Poverty rate (%),Source\n" +
    POVERTY_BY_PROVINCE.map((r) => `${r.province},${r.value},NISR EICV7 Poverty Profile 2023/24`).join("\n"),
};

const ACCESS_STRAND_CSV: DownloadData = {
  filename: "imbonix-financial-access.csv",
  csv: "Year,Banked (%),Other formal (%),Informal only (%),Excluded (%),Source\n" +
    ACCESS_STRAND.map((r) => `${r.year},${r.banked},${r.otherFormal},${r.informalOnly},${r.excluded},NISR FinScope`).join("\n"),
};

const FINANCIAL_HEALTH_CSV: DownloadData = {
  filename: "imbonix-financial-health.csv",
  csv: "Segment,2024 (%),2030 target (%),Source\n" +
    FINANCIAL_HEALTH.map((r) => `${r.segment},${r.now},${r.target},NISR FinScope 2024 / Financial Inclusion Roadmap`).join("\n"),
};

const LIVING_CONDITIONS_CSV: DownloadData = {
  filename: "imbonix-living-conditions.csv",
  csv: "Measure,2016/17 (%),2023/24 (%),Source\n" +
    LIVING_STANDARDS_BY_YEAR.map((r) => `${r.measure},${r.in2017},${r.in2024},NISR EICV7 Main Indicators 2023/24`).join("\n"),
};

const linkStyle =
  "inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-cyan-ink ring-1 ring-cyan/30 transition-colors hover:bg-cyan hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink";

export function DataHighlights() {
  return (
    <section className="bg-paper py-10 sm:py-14" aria-labelledby="highlights-heading">
      <div className="container-page">
        <p className="eyebrow text-cyan-ink">The evidence</p>
        <h2
          id="highlights-heading"
          className="mt-3 max-w-4xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl"
        >
          Key facts from Rwanda&apos;s data — in five charts
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px]">
          All numbers come from official NISR surveys. Hover any bar to see the exact number. Click the links below each
          chart to see more details, maps, and downloadable data.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <ChartCard
            id="chart-home-poverty-trend"
            title="Poverty is going down"
            howToRead="Compare the bars: shorter bars mean less poverty. Both poverty and extreme poverty dropped."
            source="NISR, EICV7 Poverty Profile 2023/24"
            status="model_estimate"
            downloadData={POVERTY_TREND_CSV}
          >
            <PovertyTrendChart />
          </ChartCard>

          <ChartCard
            id="chart-home-poverty-province"
            title="Which provinces have the most poverty"
            howToRead="Longer bars mean more poverty. Kigali has the least; Western province has the most."
            source="NISR, EICV7 Poverty Profile 2023/24"
            downloadData={POVERTY_PROVINCE_CSV}
          >
            <PovertyProvinceChart />
          </ChartCard>

          <ChartCard
            id="chart-home-access-strand"
            title="More people use financial services now"
            howToRead="Four bars per year show how people access money. Mobile money grew a lot; bank use stayed the same."
            source="NISR, FinScope 2020 and 2024"
            downloadData={ACCESS_STRAND_CSV}
          >
            <AccessStrandChart />
          </ChartCard>

          <ChartCard
            id="chart-home-financial-health"
            title="How financially healthy are Rwandans today vs. the 2030 goal"
            howToRead="Dark bars show where people are now. Light bars show the 2030 target. The goal is more healthy people and fewer vulnerable ones."
            source="NISR, FinScope 2024; National Financial Inclusion Roadmap 2025 to 2030"
            downloadData={FINANCIAL_HEALTH_CSV}
          >
            <FinancialHealthChart />
          </ChartCard>

          <ChartCard
            id="chart-home-living-conditions"
            title="Life is getting better in every area"
            className="lg:col-span-2"
            howToRead="Grey bars are before (2016/17). Blue bars are now (2023/24). Every measure improved — roads, water, roofing, and more."
            source="NISR, EICV7 Main Indicators 2023/24"
            downloadData={LIVING_CONDITIONS_CSV}
          >
            <LivingConditionsChart />
          </ChartCard>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/financial-exclusion" className={linkStyle}>
            Financial inclusion data
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/poverty-dynamics" className={linkStyle}>
            Poverty reduction data
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/social-protection" className={linkStyle}>
            Social protection data
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/data" className={linkStyle}>
            All data sources
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
