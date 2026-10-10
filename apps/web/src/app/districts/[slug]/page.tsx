import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ExclamationTriangleIcon, MapIcon } from "@heroicons/react/24/outline";
import { TrendLines } from "@/components/charts/recharts/trend-charts";
import { StackedBar } from "@/components/charts/stacked-bar";
import { DistrictIntelligence, PriorityBadge } from "@/components/district/district-intelligence";
import { DistrictTimeline, type YearIndicator } from "@/components/district/district-timeline";
import { IndicatorRow } from "@/components/district/indicator-row";
import { LinkedSectorExplorer, SectorExplorer } from "@/components/district/sector-explorer";
import { RwandaMap } from "@/components/map/rwanda-map";
import { SectionNav } from "@/components/ui/section-nav";
import { SourceLine } from "@/components/ui/source-line";
import { StatusBadge } from "@/components/ui/status-badge";
import { DISTRICTS, districtBySlug, PROVINCE_LABEL, rankOf, SOURCES, type District } from "@/lib/data";
import { formatValue, ordinal } from "@/lib/format";
import { DIMENSIONS, INDICATOR_BY_ID, meta, type Dimension } from "@/lib/indicators";
import { priorityFor } from "@/lib/district-intelligence";
import { sectorsOf } from "@/lib/sectors";
import { Button } from "@/components/ui/button";
import { CHART_CYAN, DEEP_CYAN, MID_GREY, NO_DATA, RAMPS, STRAND } from "@/lib/palette";
import { districtSpread, formatPoint, periodYears, timelineFor, type TrendPoint } from "@/lib/timeline";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ChartCard, HowToRead } from "@/components/ui/chart-card";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DISTRICTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const district = districtBySlug((await params).slug);
  return district
    ? {
        title: `${district.name} district`,
        description: `${district.name}: poverty, financial access, nutrition, shocks, work and health cover, from NISR data.`,
      }
    : {};
}

const SECTIONS: { dimension: Dimension; title: string; ids: string[] }[] = [
  {
    dimension: "poverty",
    title: "Poverty and living standards",
    ids: [
      "eicv7_poverty_rate",
      "census_mpi_headcount",
      "census_severely_poor",
      "eicv7_electricity_lighting",
      "eicv7_improved_water",
      "eicv7_improved_sanitation",
    ],
  },
  {
    dimension: "finance",
    title: "Financial access",
    ids: [
      "finscope_not_formally_included",
      "finscope_banked",
      "finscope_excluded",
      "calc_excluded_adults_2024",
      "calc_rssb_members_per_100_adults",
      "finscope2020_banked_incl_otc",
    ],
  },
  {
    dimension: "digital",
    title: "Digital readiness",
    ids: ["eicv7_hh_smartphone", "census_internet_use_16plus", "eicv7_hh_mobile_phone", "eicv7_internet_home"],
  },
  {
    dimension: "nutrition",
    title: "Nutrition and food",
    ids: ["dhs_stunting", "dhs_underweight", "cfsva_inadequate_food_consumption", "dhs_severe_stunting"],
  },
  {
    dimension: "shocks",
    title: "Shocks",
    ids: ["cfsva_hazard_any", "cfsva_hazard_drought", "cfsva_hazard_floods", "cfsva_hazard_landslides"],
  },
  {
    dimension: "work",
    title: "Work and income",
    ids: [
      "lfs_unemployment_rate",
      "lfs_neet_youth",
      "lfs_median_monthly_earnings",
      "lfs_labour_underutilisation",
      "ec_informal_employment_share",
      "calc_establishments_per_1000_adults",
    ],
  },
  { dimension: "health", title: "Health cover", ids: ["eicv7_health_insurance", "census_medical_insurance"] },
  {
    dimension: "people",
    title: "Groups Direct Support serves",
    ids: ["census_older_people_share", "census_disability_prevalence", "census_older_people_mobile_phone"],
  },
];

const PAGE_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "priority", label: "Priority" },
  { id: "over-time", label: "Over time" },
  { id: "indicators", label: "All indicators" },
  { id: "sectors", label: "Sectors" },
];

/** The LFS 2025 indicators the yearly LFS series already show for 2025, so the year view lists them once. */
const SHOWN_YEAR_BY_YEAR = new Set([
  "lfs_unemployment_rate",
  "lfs_employment_ratio",
  "lfs_participation_rate",
  "lfs_labour_underutilisation",
  "lfs_neet_youth",
  "lfs_median_monthly_earnings",
]);

/** The labour series drawn year by year on each district page, each against the median district. */
const WORK_TRENDS = [
  { id: "lfs_unemployment", title: "Unemployment rate", lowerIsBetter: true },
  { id: "lfs_neet", title: "Young people not in employment, education or training", lowerIsBetter: true },
  { id: "lfs_labour_force_participation", title: "Labour force participation", lowerIsBetter: false },
  { id: "lfs_median_earnings", title: "Median monthly earnings at the main job", lowerIsBetter: false },
];

/** A district's yearly series and the median district's, as two lines for a trend chart. */
function workTrend(id: string, points: ReturnType<typeof timelineFor>["district"]) {
  const names = Object.fromEntries(DISTRICTS.map((item) => [item.slug, item.name]));
  const own: TrendPoint[] = points
    .filter((point) => point.id === id)
    .map((point) => ({ x: point.year, period: String(point.year), value: point.value, status: point.status ?? "observed" }));
  const median: TrendPoint[] = districtSpread(id, names).map((year) => ({
    x: year.year,
    period: String(year.year),
    value: Math.round(year.median * 10) / 10,
    status: "calculated",
  }));
  return { own, median, calculated: own.some((point) => point.status === "calculated") };
}

/** Every indicator the district has, with the period it was measured in, for the year view, grouped by theme. */
function yearIndicatorsOf(district: District): YearIndicator[] {
  const order = Object.keys(DIMENSIONS);
  return Object.entries(district.values)
    .filter(([id, value]) => value && INDICATOR_BY_ID[id] && SOURCES[id] && !SHOWN_YEAR_BY_YEAR.has(id))
    .map(([id, value]) => {
      const indicator = meta(id);
      const source = SOURCES[id];
      const [start, end] = periodYears(source.year);
      const rank = indicator.better === "neutral" ? undefined : rankOf(district, indicator);
      return {
        id,
        label: indicator.short,
        period: source.year,
        start,
        end,
        value: formatValue(indicator, value?.v),
        status: source.status,
        group: DIMENSIONS[indicator.dimension].label,
        source: source.source.replace(/^NISR /, ""),
        rank: rank && `${ordinal(rank.rank)} of ${rank.of} most affected`,
        order: order.indexOf(indicator.dimension),
      };
    })
    .sort((first, second) => first.order - second.order)
    .map(({ order: _order, ...indicator }) => indicator);
}

export default async function DistrictPage({ params }: Params) {
  const district = districtBySlug((await params).slug);
  if (!district) notFound();

  const index = DISTRICTS.findIndex((d) => d.slug === district.slug);
  const previous = DISTRICTS[(index - 1 + DISTRICTS.length) % DISTRICTS.length];
  const next = DISTRICTS[(index + 1) % DISTRICTS.length];
  const sectors = sectorsOf(district.name);
  const locator = Object.fromEntries(
    DISTRICTS.map((d) => [
      d.slug,
      d.slug === district.slug ? DEEP_CYAN : d.province === district.province ? RAMPS.cyan[0] : NO_DATA,
    ]),
  );
  const v = (id: string) => district.values[id]?.v;
  const facts = [
    { label: "Population, 2022", value: formatValue(meta("census_population"), v("census_population")) },
    { label: "Adults 16+, 2024", value: formatValue(meta("proj_adults_16plus_2024"), v("proj_adults_16plus_2024")) },
    { label: "Sectors", value: String(sectors.length) },
    { label: "Households headed by women", value: formatValue(meta("census_female_headed_hh"), v("census_female_headed_hh")) },
  ];
  const timeline = timelineFor(district.slug, district.province);

  return (
    <>
      <section id="overview" className="relative scroll-mt-36 overflow-hidden border-b border-line bg-white">
        <div className="container-page relative grid gap-10 py-10 sm:py-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <Breadcrumbs extra={[{ label: PROVINCE_LABEL[district.province] }, { label: district.name }]} />
            <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.04em] text-ink sm:text-6xl">{district.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <PriorityBadge priority={priorityFor(district)} />
              <Link
                href={`/poverty-dynamics/district-map?district=${district.slug}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-cyan-ink hover:underline"
              >
                <MapIcon className="h-4 w-4" /> See it on the district map
              </Link>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="rounded-xl bg-paper px-4 py-3">
                  <dt className="text-[12.5px] font-semibold text-muted">{f.label}</dt>
                  <dd className="mt-1 font-display text-lg font-bold text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <RwandaMap fills={locator} highlight={district.slug} title={`Location of ${district.name} in Rwanda`} />
            <p className="mt-2 text-center text-[11px] text-muted">
              {district.name} and the rest of the {PROVINCE_LABEL[district.province]}
            </p>
          </div>
        </div>
      </section>

      <SectionNav label={district.name} sections={PAGE_SECTIONS} />

      <div id="priority" className="scroll-mt-36">
        <DistrictIntelligence district={district} />
      </div>

      <section
        id="over-time"
        className="scroll-mt-36 border-b border-line bg-paper py-12 sm:py-16"
        aria-labelledby="over-time-heading"
      >
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="eyebrow text-cyan-ink">Over time</p>
            <h2 id="over-time-heading" className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-ink">
              {district.name} and Rwanda, year by year from 1978
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-muted">
              Choose a year to see what NISR published for {district.name} and for Rwanda in that year. Rwanda&apos;s figures go
              back to the 1978 census. For {district.name} this site holds the labour force survey for every year from 2017, the
              projected population from 2023, and the latest census and surveys, from 2020 to 2026.
            </p>
          </div>
          <div className="mt-8">
            <DistrictTimeline
              district={district.name}
              provinceLabel={PROVINCE_LABEL[district.province]}
              series={timeline.series}
              national={timeline.national}
              districtPoints={timeline.district}
              indicators={yearIndicatorsOf(district)}
            />
          </div>

          <h3 className="mt-14 font-display text-2xl font-bold tracking-[-0.02em] text-ink">
            Work in {district.name}, year by year since 2017
          </h3>
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-muted">
            Each chart sets {district.name} against the median of the 30 districts, from the Labour Force Survey district tables.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {WORK_TRENDS.map((trend) => {
              const { own, median, calculated } = workTrend(trend.id, timeline.district);
              if (own.length < 2) return null;
              const unit = timeline.series[trend.id].unit;
              const latest = own[own.length - 1];
              const latestMedian = median.find((point) => point.x === latest.x);
              // Compared as shown, so a district level with the median at the shown precision is not called above or below it.
              const comparison =
                latestMedian === undefined
                  ? undefined
                  : formatPoint(latest.value, unit) === formatPoint(latestMedian.value, unit)
                    ? "Level with"
                    : latest.value > latestMedian.value
                      ? "Above"
                      : "Below";
              return (
                <ChartCard
                  key={trend.id}
                  id={`chart-district-${trend.id.replace("lfs_", "").replaceAll("_", "-")}`}
                  title={`${trend.title}: ${formatPoint(latest.value, unit)} in ${latest.period}`}
                  note={
                    latestMedian && comparison
                      ? `${comparison} the median district (${formatPoint(latestMedian.value, unit)}) in ${latest.period}.`
                      : undefined
                  }
                  howToRead={`The dark line is ${district.name}, the grey line the median of the 30 districts.${trend.lowerIsBetter ? " Lower is better." : ""}`}
                  source={`NISR, LFS 2025 annual tables, Tables 21 to 25${calculated ? "; unemployment before 2024 is the published number of unemployed people divided by the labour force" : ""}`}
                  status={calculated ? "calculated" : "observed"}
                >
                  <TrendLines
                    lines={[
                      { key: "district", label: district.name, color: DEEP_CYAN, points: own },
                      { key: "median", label: "Median district", color: MID_GREY, points: median, endLabel: "below" },
                    ]}
                    unit={unit}
                    height={240}
                    description={`${trend.title} in ${district.name}: ${own.map((point) => `${point.period} ${formatPoint(point.value, unit)}`).join(", ")}. Median district: ${median.map((point) => `${point.period} ${formatPoint(point.value, unit)}`).join(", ")}.`}
                  />
                </ChartCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed sections */}
      <section id="indicators" className="container-page scroll-mt-36 space-y-6 py-12" aria-labelledby="evidence-heading">
        <div className="max-w-3xl">
          <p className="eyebrow text-cyan-ink">The evidence in detail</p>
          <h2 id="evidence-heading" className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-ink">
            Every published indicator for {district.name}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted">
            Grouped by theme, each with its value, how it compares with Rwanda, its rank among the 30 districts and its source.
          </p>
        </div>
        <CardLegend />
        <nav aria-label="Themes" className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[13px] font-semibold text-muted">Go to a theme</span>
          {SECTIONS.map((section) => (
            <a
              key={section.dimension}
              href={`#theme-${section.dimension}`}
              className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-ink ring-1 ring-line transition-colors hover:text-cyan-ink hover:ring-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
            >
              {section.title}
            </a>
          ))}
        </nav>
        {SECTIONS.map((section) => {
          const info = DIMENSIONS[section.dimension];
          return (
            <div key={section.title} id={`theme-${section.dimension}`} className="card scroll-mt-36 p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow" style={{ color: info.ink }}>
                    {info.label}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.02em] text-ink">{section.title}</h2>
                </div>
                <p className="text-[12.5px] text-muted">{info.question}</p>
              </div>
              {section.dimension === "poverty" && <NonMonetaryBar district={district} />}
              {section.dimension === "finance" && <AccessStrand district={district} />}
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {section.ids.map((id) => (
                  <IndicatorRow key={id} district={district} id={id} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Sectors */}
      <section id="sectors" className="scroll-mt-36 border-y border-line bg-white py-12 sm:py-14">
        <div className="container-page">
          <p className="eyebrow text-dim-poverty">Inside the district</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-ink">{district.name}&apos;s sectors</h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-muted">
            A district average can hide very different sectors. Select a sector on the map or in the table to see its figures, its
            rank in the district and its cells and villages, or sort the table by any column.
          </p>
          <HowToRead className="mt-3 max-w-3xl">
            Each shape is one sector of the district. The darker the colour, the higher the value on the chosen measure; colours
            compare sectors within this district only.
          </HowToRead>
          <div className="mt-8">
            {/* The static page shows the explorer with nothing selected; a search link then selects its sector. */}
            <Suspense fallback={<SectorExplorer district={district.name} districtSlug={district.slug} sectors={sectors} />}>
              <LinkedSectorExplorer district={district.name} districtSlug={district.slug} sectors={sectors} />
            </Suspense>
          </div>
        </div>
      </section>

      <nav aria-label="Other districts" className="container-page flex flex-wrap items-center justify-between gap-4 py-10">
        <Button asChild variant="outline">
          <Link href={`/districts/${previous.slug}`}>
            <ArrowLeftIcon className="h-4 w-4" /> {previous.name}
          </Link>
        </Button>
        <Link href="/districts" className="text-[13px] font-semibold text-muted hover:text-ink">
          All 30 districts
        </Link>
        <Button asChild variant="outline">
          <Link href={`/districts/${next.slug}`}>
            {next.name} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Button>
      </nav>
    </>
  );
}

/** What each indicator card shows, drawn the way the cards draw it. */
function CardLegend() {
  const items = [
    {
      mark: <span className="h-3.5 w-3.5 rounded-full border-2 border-white shadow" style={{ background: CHART_CYAN }} />,
      text: "The dot is this district.",
    },
    {
      mark: <span className="h-5 w-px bg-ink/60" />,
      text: "The line is Rwanda, or the median district when there is no national figure.",
    },
    {
      mark: <span className="h-1 w-8 rounded-full opacity-30" style={{ background: CHART_CYAN }} />,
      text: "The pale band is the 95% confidence interval, where the survey gives one.",
    },
    {
      mark: <span className="text-[12px] font-semibold text-ink">#1</span>,
      text: "The rank counts from the most affected district: #1 of 30 is the most affected.",
    },
    {
      mark: <StatusBadge status="observed" />,
      text: "The label says whether the figure is published, calculated or projected.",
    },
  ];
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-[14px] font-bold text-ink">How to read each card</p>
      <p className="mt-1 text-[13px] leading-5 text-muted">
        The strip runs from the lowest district on the left to the highest on the right.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item.text} className="flex items-center gap-3 text-[13px] leading-5 text-ink/80">
            <span className="flex h-6 w-28 shrink-0 items-center justify-center" aria-hidden="true">
              {item.mark}
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NonMonetaryBar({ district }: { district: District }) {
  const v = (id: string) => district.values[id]?.v ?? 0;
  const ramp = DIMENSIONS.poverty.ramp;
  return (
    <div className="mt-5 rounded-xl bg-paper p-4">
      <p className="mb-2 text-[12.5px] font-semibold text-ink">People by census nonmonetary poverty status, 2022</p>
      <StackedBar
        segments={[
          { label: "Not poor", value: v("census_nonpoor"), color: ramp[0] },
          { label: "Vulnerable", value: v("census_vulnerable"), color: ramp[1] },
          { label: "Moderately poor", value: v("census_moderately_poor"), color: ramp[3] },
          { label: "Severely poor", value: v("census_severely_poor"), color: ramp[4] },
        ]}
      />
      <SourceLine id="census_nonpoor" className="mt-2" />
    </div>
  );
}

function AccessStrand({ district }: { district: District }) {
  const v = (id: string) => district.values[id]?.v;
  const informal = v("finscope_informal_only");
  const excluded = v("finscope_excluded");
  const segments = [
    { label: "Banked", value: v("finscope_banked") ?? 0, color: STRAND.banked },
    { label: "Formal nonbank only", value: v("finscope_other_formal_only") ?? 0, color: STRAND.otherFormal },
    ...(informal !== undefined && excluded !== undefined
      ? [
          { label: "Informal only", value: informal, color: STRAND.informalOnly },
          { label: "Excluded", value: excluded, color: STRAND.excluded },
        ]
      : [{ label: "Informal only or excluded", value: v("finscope_not_formally_included") ?? 0, color: STRAND.excluded }]),
  ];
  return (
    <div className="mt-5 rounded-xl bg-paper p-4">
      <p className="mb-2 text-[12.5px] font-semibold text-ink">
        Adults 16+ by the most formal service they use (FinScope access strand), 2024
      </p>
      <StackedBar segments={segments} />
      <SourceLine id="finscope_banked" className="mt-2" />
      {informal === undefined && (
        <p className="mt-2 flex gap-2 text-[12px] text-muted">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> The report shows informal only and excluded adults together for
          this district.
        </p>
      )}
    </div>
  );
}
