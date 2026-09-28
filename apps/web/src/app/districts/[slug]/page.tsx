import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, ExclamationTriangleIcon, MapIcon } from "@heroicons/react/24/outline";
import { StackedBar } from "@/components/charts/stacked-bar";
import { DistrictIntelligence, PriorityBadge } from "@/components/district/district-intelligence";
import { IndicatorRow } from "@/components/district/indicator-row";
import { SectorExplorer } from "@/components/district/sector-explorer";
import { RwandaMap } from "@/components/map/rwanda-map";
import { SourceLine } from "@/components/ui/source-line";
import { DISTRICTS, districtBySlug, PROVINCE_LABEL, type District } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { DIMENSIONS, meta, type Dimension } from "@/lib/indicators";
import { priorityFor } from "@/lib/district-intelligence";
import { sectorsOf } from "@/lib/sectors";
import { Button } from "@/components/ui/button";
import { BRAND, CORE, NO_DATA, RAMPS } from "@/lib/palette";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { HeroRings } from "@/components/ui/section";
import { HowToRead } from "@/components/ui/chart-card";

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
];

export default async function DistrictPage({ params }: Params) {
  const district = districtBySlug((await params).slug);
  if (!district) notFound();

  const index = DISTRICTS.findIndex((d) => d.slug === district.slug);
  const previous = DISTRICTS[(index - 1 + DISTRICTS.length) % DISTRICTS.length];
  const next = DISTRICTS[(index + 1) % DISTRICTS.length];
  const locator = Object.fromEntries(
    DISTRICTS.map((d) => [
      d.slug,
      d.slug === district.slug ? BRAND.blue : d.province === district.province ? RAMPS.blue[0] : NO_DATA,
    ]),
  );
  const v = (id: string) => district.values[id]?.v;
  const facts = [
    { label: "Population, 2022", value: formatValue(meta("census_population"), v("census_population")) },
    { label: "Adults 16+, 2024", value: formatValue(meta("proj_adults_16plus_2024"), v("proj_adults_16plus_2024")) },
    { label: "Sectors", value: String(sectorsOf(district.name).length) },
    { label: "Households headed by women", value: formatValue(meta("census_female_headed_hh"), v("census_female_headed_hh")) },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-white">
        <HeroRings />
        <div className="container-page relative grid gap-10 py-10 sm:py-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <Breadcrumbs extra={[{ label: PROVINCE_LABEL[district.province] }, { label: district.name }]} />
            <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.04em] text-ink sm:text-6xl">{district.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <PriorityBadge priority={priorityFor(district)} />
              <Link
                href={`/map?district=${district.slug}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-royal hover:underline"
              >
                <MapIcon className="h-4 w-4" /> See it on the district map
              </Link>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="rounded-xl bg-paper px-4 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{f.label}</dt>
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

      <DistrictIntelligence district={district} />

      {/* Detailed sections */}
      <section className="container-page space-y-6 py-12" aria-labelledby="evidence-heading">
        <div className="max-w-3xl">
          <p className="eyebrow text-royal">The evidence in detail</p>
          <h2 id="evidence-heading" className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-ink">
            Every published indicator for {district.name}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted">
            Grouped by theme, each with its value, how it compares with Rwanda, its rank among the 30 districts and its source.
          </p>
        </div>
        {SECTIONS.map((section) => {
          const info = DIMENSIONS[section.dimension];
          return (
            <div key={section.title} className="card p-5 sm:p-7">
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
      <section className="border-y border-line bg-white py-12 sm:py-14">
        <div className="container-page">
          <p className="eyebrow text-dim-poverty">Inside the district</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-ink">{district.name}&apos;s sectors</h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-muted">
            A district average can hide very different sectors. Hover a sector on the map, or sort the table by any column.
          </p>
          <HowToRead className="mt-3 max-w-3xl">
            Each shape is one sector of the district. The darker the colour, the higher the value on the chosen measure; colours
            compare sectors within this district only.
          </HowToRead>
          <div className="mt-8">
            <SectorExplorer district={district.name} sectors={sectorsOf(district.name)} />
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
  const ramp = DIMENSIONS.finance.ramp;
  const informal = v("finscope_informal_only");
  const excluded = v("finscope_excluded");
  const segments = [
    { label: "Banked", value: v("finscope_banked") ?? 0, color: ramp[4] },
    { label: "Formal nonbank only", value: v("finscope_other_formal_only") ?? 0, color: ramp[2] },
    ...(informal !== undefined && excluded !== undefined
      ? [
          { label: "Informal only", value: informal, color: CORE.cyan },
          { label: "Excluded", value: excluded, color: RAMPS.steel[1] },
        ]
      : [{ label: "Informal only or excluded", value: v("finscope_not_formally_included") ?? 0, color: RAMPS.steel[1] }]),
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
