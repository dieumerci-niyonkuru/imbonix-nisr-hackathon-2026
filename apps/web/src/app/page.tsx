import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { paymentTimelinessByProgramme } from "@/components/focus/focus-panels";
import { ChallengeSection, type ChallengePart } from "@/components/home/challenge-section";
import { ChallengeStatement, type Requirement } from "@/components/home/challenge-statement";
import { DistrictFinder, type FinderProvince } from "@/components/home/district-finder";
import { FeaturedInsight } from "@/components/home/featured-insight";
import { GapChart, type GapRow } from "@/components/home/gap-chart";
import { HomeHero, type HeroFigure } from "@/components/home/home-hero";
import { DISTRICTS, PROVINCE_LABEL, PROVINCES } from "@/lib/data";
import { POVERTY_RATE_BY_YEAR } from "@/lib/eicv7-poverty-profile";
import { FINANCIAL_HEALTH_SEGMENTS, FINSCOPE_2024_SOURCE, INCLUSION_BY_ROUND, MOBILE_MONEY_BY_ROUND } from "@/lib/finscope-2024";
import { BRAND, CORE } from "@/lib/palette";
import { SITE_FACTS } from "@/lib/site-facts";

/**
 * The homepage, short on purpose: the opening banner with four headline figures, the challenge and the three tests a
 * useful answer has to meet, one featured insight, the three focus areas and a way in by district. Why IMBONIX, who
 * benefits and the method are on the About page; the sources on Data & methods; the evidence on the focus area pages.
 */
export default function Home() {
  const inclusionOf = (measure: string) => INCLUSION_BY_ROUND.find((row) => row.measure === measure)!;
  const includedShare = inclusionOf("Financially included").in2024;
  const bankedRow = inclusionOf("Banked");
  const healthyShare = FINANCIAL_HEALTH_SEGMENTS.find((segment) => segment.segment === "Financially healthy")!.share;
  const registeredWallet = MOBILE_MONEY_BY_ROUND.find((row) => row.measure === "Registered wallet in own name")!.in2024;
  const [povertyIn2017, povertyIn2024] = POVERTY_RATE_BY_YEAR;
  const paymentTimeliness = paymentTimelinessByProgramme();
  const directSupportOnTime = paymentTimeliness.find((row) => row.programme === "Direct Support")!.onTime;
  const bestOnTimeShare = Math.max(...paymentTimeliness.map((row) => row.onTime));
  const gap = includedShare - healthyShare;

  const heroFigures: HeroFigure[] = [
    { value: `${includedShare}%`, label: "of adults use a financial service" },
    { value: `${healthyShare}%`, label: "are financially healthy" },
    { value: `${povertyIn2024.povertyRate}%`, label: "of people live in poverty" },
    { value: `${directSupportOnTime}%`, label: "of Direct Support households were paid on time" },
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
      figure: `${SITE_FACTS.indicators} indicators`,
      body: `From ${SITE_FACTS.publications} NISR and partner publications, for all ${SITE_FACTS.districts} districts and ${SITE_FACTS.sectors} sectors. Every figure names its table and how far to trust it.`,
      href: "/data",
      linkLabel: "See the sources",
    },
    {
      name: "Practical impact",
      figure: `${SITE_FACTS.levers} policy levers`,
      body: "Each lever is flagged district by district by one published figure and a rule anyone can check, so support can go where the need is greatest.",
      href: "/interventions",
      linkLabel: "Plan an intervention",
    },
  ];

  // The featured chart: FinScope 2024 measures from access to financial health, with the gap drawn in.
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
      gapLabel: `${gap} point gap`,
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

  const finderProvinces: FinderProvince[] = PROVINCES.map((province) => ({
    label: PROVINCE_LABEL[province],
    districts: DISTRICTS.filter((district) => district.province === province)
      .map((district) => ({ name: district.name, slug: district.slug }))
      .sort((first, second) => first.name.localeCompare(second.name)),
  }));

  return (
    <>
      <HomeHero
        figures={heroFigures}
        sources="NISR, FinScope 2024; EICV7 2023/24 and its VUP thematic report."
        districtCount={SITE_FACTS.districts}
        sectorCount={SITE_FACTS.sectors}
      />

      <ChallengeStatement requirements={requirements} />

      <FeaturedInsight
        title={`${gap} points separate using a financial service from being financially healthy`}
        body={`Almost every adult in Rwanda now uses some financial service, formal or informal. Yet only ${healthyShare}% are financially healthy as FinScope 2024 measures it, and ${bankedRow.in2024}% are banked, the same share as in 2020. The question is no longer only who has access, but who can use finance to manage, save and cope with a shock.`}
        howToRead="Each bar is a separate FinScope measure of adults in 2024. The dashed band on the last bar is the gap between using a financial service and being financially healthy."
        href="/focus/exclusion"
        linkLabel="Read the evidence on financial exclusion"
        chart={
          <GapChart
            title="Access is high. Financial health is not."
            note="Share of adults aged 16 and over, 2024. Each bar is a separate FinScope measure, so an adult can count in several."
            rows={gapRows}
            source={`${FINSCOPE_2024_SOURCE}; financial health from section 5.2`}
          />
        }
      />

      <ChallengeSection parts={focusCards} />

      <section className="bg-paper py-16 sm:py-20" aria-labelledby="find-district-heading">
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
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                <Link
                  href="/map"
                  className="group inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Open the map of every district
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  About IMBONIX
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <DistrictFinder provinces={finderProvinces} />
          </div>
        </div>
      </section>
    </>
  );
}
