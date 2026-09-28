import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { DHS_SOURCE, paymentTimelinessByProgramme, VUP_TIMELINESS_SOURCE } from "@/components/focus/focus-panels";
import { AudienceSection, type Audience } from "@/components/home/audience-section";
import { ChallengeSection, type ChallengePart } from "@/components/home/challenge-section";
import { ChallengeStatement, type Requirement } from "@/components/home/challenge-statement";
import { DataEvidence, type KeyFigure } from "@/components/home/data-evidence";
import { DistrictFinder, type FinderProvince } from "@/components/home/district-finder";
import { GapChart, type GapRow } from "@/components/home/gap-chart";
import { HomeHero } from "@/components/home/home-hero";
import { MethodologyJourney, type JourneyStep } from "@/components/home/methodology-journey";
import { PovertyMapSection } from "@/components/home/poverty-map-section";
import { WhySection, type Contribution } from "@/components/home/why-section";
import { DISTRICTS, PROVINCE_LABEL, PROVINCES, SOURCES } from "@/lib/data";
import { EICV7_PROFILE_SOURCE, POVERTY_RATE_BY_YEAR } from "@/lib/eicv7-poverty-profile";
import {
  EXCLUDED_ADULTS,
  FINANCIAL_HEALTH_SEGMENTS,
  FINSCOPE_2024_SOURCE,
  INCLUSION_BY_ROUND,
  MOBILE_MONEY_BY_ROUND,
} from "@/lib/finscope-2024";
import { BRAND, CORE, DIMENSION_COLORS } from "@/lib/palette";
import { LEVERS } from "@/lib/priorities";
import { sectorsOf } from "@/lib/sectors";
import { usageRows } from "@/lib/surveys";

/**
 * The homepage, kept short on purpose: the gap, the challenge and the three tests a useful answer has to meet, why
 * IMBONIX, the evidence behind it, the three focus areas, who benefits, the method in five steps, one featured
 * insight and a way in by district. The detail lives on the focus area pages and the pages behind them.
 */
export default function Home() {
  const inclusionOf = (measure: string) => INCLUSION_BY_ROUND.find((row) => row.measure === measure)!;
  const includedShare = inclusionOf("Financially included").in2024;
  const bankedRow = inclusionOf("Banked");
  const healthyShare = FINANCIAL_HEALTH_SEGMENTS.find((segment) => segment.segment === "Financially healthy")!.share;
  const registeredWallet = MOBILE_MONEY_BY_ROUND.find((row) => row.measure === "Registered wallet in own name")!.in2024;
  const [povertyIn2017, povertyIn2024] = POVERTY_RATE_BY_YEAR;
  const poorestWomen = usageRows("Wealth quintile", "women").find((row) => row.category === "Lowest")!;
  const paymentTimeliness = paymentTimelinessByProgramme();
  const directSupportOnTime = paymentTimeliness.find((row) => row.programme === "Direct Support")!.onTime;
  const bestOnTimeShare = Math.max(...paymentTimeliness.map((row) => row.onTime));

  const indicatorCount = Object.keys(SOURCES).length;
  const publicationCount = new Set(Object.values(SOURCES).map((source) => source.source)).size;
  const sectorCount = DISTRICTS.reduce((count, district) => count + sectorsOf(district.name).length, 0);

  // The opening chart: FinScope 2024 measures from access to financial health, with the gap drawn in.
  const gapRows: GapRow[] = [
    { label: "Use a financial service", value: includedShare, color: BRAND.blue },
    { label: "Are formally served", value: inclusionOf("Formally served").in2024, color: BRAND.blue },
    { label: "Have a mobile money wallet", value: registeredWallet, color: BRAND.blue },
    { label: "Are banked", value: bankedRow.in2024, color: BRAND.navy },
    {
      label: "Are financially healthy",
      value: healthyShare,
      color: CORE.cyan,
      gapTo: includedShare,
      gapLabel: `${includedShare - healthyShare} point gap`,
    },
  ];

  // The three tests a useful answer has to meet, each with the figure that shows IMBONIX meets it.
  const requirements: Requirement[] = [
    {
      name: "A real gap",
      figure: `${includedShare}% against ${healthyShare}%`,
      body: `${includedShare}% of adults use a financial service, yet only ${healthyShare}% are financially healthy, and ${bankedRow.in2024}% are banked, the same share as in 2020.`,
      href: "/focus/exclusion",
      linkLabel: "See the gap",
    },
    {
      name: "Evidence from NISR data",
      figure: `${indicatorCount} indicators`,
      body: `From ${publicationCount} NISR and partner publications, for all ${DISTRICTS.length} districts and ${sectorCount} sectors. Every figure names its table and how far to trust it.`,
      href: "/data",
      linkLabel: "See the sources",
    },
    {
      name: "Practical impact",
      figure: `${LEVERS.length} policy levers`,
      body: "Each lever is flagged district by district by one published figure and a rule anyone can check, so support can go where the need is greatest.",
      href: "/priorities",
      linkLabel: "See where to act first",
    },
  ];

  const contributions: Contribution[] = [
    {
      title: "It brings the evidence together",
      body: "Figures from separate NISR surveys, censuses and reports, side by side for every district and, where NISR publishes them, every sector.",
    },
    {
      title: "It says how far to trust each number",
      body: "Every value is labelled: an official estimate, an IMBONIX calculation, a model estimate, a projection, a scenario or a policy target.",
    },
    {
      title: "It points to what can be done",
      body: `${LEVERS.length} policy levers show which districts stand out on each need, with the rule behind every flag in the open.`,
    },
  ];

  const keyFigures: KeyFigure[] = [
    {
      value: EXCLUDED_ADULTS.toLocaleString("en-US"),
      label: "adults use no financial service at all, formal or informal",
      source: FINSCOPE_2024_SOURCE,
      accent: BRAND.navy,
    },
    {
      value: `${povertyIn2024.povertyRate}%`,
      label: `of people live in poverty, down from ${povertyIn2017.povertyRate}% in 2017`,
      source: EICV7_PROFILE_SOURCE,
      accent: DIMENSION_COLORS.poverty.accent,
    },
    {
      value: `${poorestWomen.either}%`,
      label: "of women in the poorest fifth used a bank account or mobile money in the past year",
      source: DHS_SOURCE,
      accent: CORE.cyan,
    },
    {
      value: `${directSupportOnTime}%`,
      label: "of Direct Support households were paid on time",
      source: VUP_TIMELINESS_SOURCE,
      accent: BRAND.blue,
    },
  ];

  // The three focus areas, each an image card whose picture is a district map of a related measure.
  const focusCards: ChallengePart[] = [
    {
      area: "Financial exclusion",
      title:
        bankedRow.in2024 === bankedRow.in2020
          ? `Only ${bankedRow.in2024}% of adults are banked, the same share as in 2020`
          : `${bankedRow.in2024}% of adults are banked, against ${bankedRow.in2020}% in 2020`,
      source: "NISR, FinScope 2020 and 2024",
      indicatorId: "finscope_not_formally_included",
      ramp: "cyan",
      href: "/focus/exclusion",
      linkLabel: "Read the evidence on financial exclusion",
    },
    {
      area: "Poverty dynamics",
      title: `Poverty fell from ${povertyIn2017.povertyRate}% to ${povertyIn2024.povertyRate}% in seven years`,
      source: "NISR, EICV7 2023/24 (Poverty Profile and Main Indicators)",
      indicatorId: "eicv7_poverty_rate",
      ramp: "blue",
      href: "/focus/poverty",
      linkLabel: "Read the evidence on poverty",
    },
    {
      area: "Social protection impact",
      title: `VUP reaches poorer people, but at best ${bestOnTimeShare}% are paid on time`,
      source: "NISR, EICV7 2023/24 (VUP survey and Main Indicators)",
      indicatorId: "eicv7_health_insurance",
      ramp: "navy",
      href: "/focus/protection",
      linkLabel: "Read the evidence on social protection",
    },
  ];

  const beneficiaries: Audience[] = [
    {
      title: "Vulnerable households",
      body: "Shows where payments arrive late and formal finance is far, so support can reach people sooner.",
      href: "/social-protection",
      linkLabel: "See how VUP support arrives",
    },
    {
      title: "Policymakers",
      body: `${LEVERS.length} policy levers, each flagged district by district by one published figure and a rule anyone can check.`,
      href: "/priorities",
      linkLabel: "See where to act first",
    },
    {
      title: "Researchers",
      body: "Every figure with its table, year and trust label, a JSON API that serves the same figures, and scripts that rebuild the data.",
      href: "/data",
      linkLabel: "Use the data and methods",
    },
    {
      title: "Civil society",
      body: "Open figures with their sources, to follow programmes and speak up for the places left behind.",
      href: "/districts",
      linkLabel: "Find your district",
    },
    {
      title: "Development organisations",
      body: "See where poverty, financial exclusion, poor nutrition and shocks overlap, to aim programmes at the districts that need them most.",
      href: "/vulnerability",
      linkLabel: "See where needs overlap",
    },
  ];

  const journey: JourneyStep[] = [
    {
      name: "Data",
      body: `${indicatorCount} indicators transcribed from ${publicationCount} publications, each with its table and year.`,
    },
    {
      name: "Analysis",
      body: `All ${DISTRICTS.length} districts compared side by side, with confidence intervals where NISR publishes them.`,
    },
    {
      name: "Evidence",
      body: "Each figure labelled by how far to trust it, and every chart with a plain statement of what it shows.",
    },
    {
      name: "Intervention",
      body: `${LEVERS.length} policy levers, each flagged district by district by one figure and a stated rule.`,
    },
    {
      name: "Impact",
      body: "Support aimed where needs overlap, and progress followed against Rwanda's 2030 targets.",
    },
  ];

  const finderProvinces: FinderProvince[] = PROVINCES.map((province) => ({
    label: PROVINCE_LABEL[province],
    districts: DISTRICTS.filter((district) => district.province === province)
      .map((district) => ({ name: district.name, slug: district.slug }))
      .sort((first, second) => first.name.localeCompare(second.name)),
  }));

  return (
    <>
      <HomeHero
        districtCount={DISTRICTS.length}
        sectorCount={sectorCount}
        chart={
          <GapChart
            title="Access is high. Financial health is not."
            note="Share of adults aged 16 and over, 2024. Each bar is a separate FinScope measure, so an adult can count in several."
            rows={gapRows}
            takeaway={`${includedShare - healthyShare} points separate using a financial service from being financially healthy.`}
            source={`${FINSCOPE_2024_SOURCE}; financial health from section 5.2`}
          />
        }
      />

      <ChallengeStatement requirements={requirements} />

      <WhySection contributions={contributions} />

      <DataEvidence
        figures={keyFigures}
        indicatorCount={indicatorCount}
        districtCount={DISTRICTS.length}
        sectorCount={sectorCount}
      />

      <ChallengeSection parts={focusCards} />

      <AudienceSection audiences={beneficiaries} />

      <MethodologyJourney steps={journey} />

      <PovertyMapSection />

      <section className="bg-white py-16 sm:py-20" aria-labelledby="find-district-heading">
        <div className="container-page">
          <div className="grid gap-8 rounded-3xl bg-royal p-7 text-white sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div>
              <p className="eyebrow text-white/80">Start with a place</p>
              <h2
                id="find-district-heading"
                className="mt-3 text-balance font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl"
              >
                Explore Rwanda through evidence
              </h2>
              <p className="mt-3 max-w-lg text-[15px] leading-7 text-white/85">
                Choose a district to see its four dimensions, every published indicator and a map of its sectors, with sources.
              </p>
              <Link
                href="/map"
                className="group mt-5 inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Or open the map of every district
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            <DistrictFinder provinces={finderProvinces} />
          </div>
        </div>
      </section>
    </>
  );
}
