import { paymentTimelinessByProgramme } from "@/components/focus/focus-shared";
import { ChallengeSection, type ChallengePart } from "@/components/home/challenge-section";
import { ChallengeStatement, type Requirement } from "@/components/home/challenge-statement";
import { FeaturedInsight } from "@/components/home/featured-insight";
import { GapChart, type GapRow } from "@/components/home/gap-chart";
import { FigureTiles, type FigureTile } from "@/components/home/figure-tiles";
import { HomeHero, type HeroCard } from "@/components/home/home-hero";
import { PlaceSection } from "@/components/home/place-section";
import { NISR_CATALOG_URL, SOURCE_STUDIES } from "@/components/layout/nav";
import { ReadMoreSection } from "@/components/ui/read-more";
import { STATUS_DESCRIPTION } from "@/components/ui/status-badge";
import { DISTRICTS, PROVINCE_LABEL } from "@/lib/data";
import { POVERTY_RATE_BY_YEAR } from "@/lib/eicv7-poverty-profile";
import {
  EXCLUDED_ADULTS,
  FINANCIAL_HEALTH_SEGMENTS,
  FINSCOPE_2024_SOURCE,
  INCLUSION_BY_ROUND,
  MOBILE_MONEY_BY_ROUND,
} from "@/lib/finscope-2024";
import { STATUS_LABEL } from "@/lib/format";
import { LEVERS } from "@/lib/priorities";
import { usageRows } from "@/lib/surveys";
import { CHART_CYAN, DEEP_CYAN } from "@/lib/palette";
import { SITE_FACTS } from "@/lib/site-facts";

/**
 * The homepage, short on purpose: the opening banner with four headline figures, the challenge and the three tests a
 * useful answer has to meet, one featured insight, the three focus areas and a way in by place, down to the village. Why IMBONIX, who
 * benefits and the method are on the About page; the sources on Sources and methods; the evidence on the focus area pages.
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
  const otherFormal = inclusionOf("Other formal (non bank)");
  const segmentShare = (name: string) => FINANCIAL_HEALTH_SEGMENTS.find((segment) => segment.segment === name)!.share;
  const womenByWealth = usageRows("Wealth quintile", "women");
  const poorestWomen = womenByWealth.find((row) => row.category === "Lowest")!;
  const richestWomen = womenByWealth.find((row) => row.category === "Highest")!;

  // The doors under the banner: the three focus areas and the planning tool.
  const heroCards: HeroCard[] = [
    {
      title: "Financial exclusion",
      body: "Who is left out of finance, and who uses it without being able to save, borrow or cope with a shock.",
      href: "/financial-exclusion",
    },
    {
      title: "Poverty dynamics",
      body: `How poverty fell from ${povertyIn2017.povertyRate}% to ${povertyIn2024.povertyRate}%, and where it is still highest.`,
      href: "/poverty-dynamics",
    },
    {
      title: "Social protection",
      body: "Whether VUP and Direct Support reach the poorest households, and how late their payments arrive.",
      href: "/social-protection",
    },
    {
      title: "Intervention planner",
      body: "Bring the evidence together for one problem, one group and one place, with the options that fit.",
      href: "/social-protection/intervention-planner",
    },
  ];

  // The headline figures, each with its source.
  const figureTiles: FigureTile[] = [
    { value: `${includedShare}%`, label: "of adults use a financial service", source: "NISR, FinScope 2024" },
    { value: `${healthyShare}%`, label: "of adults are financially healthy", source: "NISR, FinScope 2024, section 5.2" },
    {
      value: `${bankedRow.in2024}%`,
      label: bankedRow.in2024 === bankedRow.in2020 ? "of adults are banked, the same as in 2020" : "of adults are banked",
      source: "NISR, FinScope 2020 and 2024",
    },
    {
      value: EXCLUDED_ADULTS.toLocaleString("en-US"),
      label: "adults use no financial service at all",
      source: "NISR, FinScope 2024",
    },
    {
      value: `${povertyIn2024.povertyRate}%`,
      label: `of people live in poverty, down from ${povertyIn2017.povertyRate}% in 2016/17`,
      source: "NISR, EICV7 Poverty Profile 2023/24",
    },
    {
      value: `${directSupportOnTime}%`,
      label: "of Direct Support households were paid on time the last time",
      source: "NISR, EICV7 VUP thematic report 2023/24",
    },
  ];

  // The three tests a useful answer has to meet, each with the figure that shows IMBONIX meets it.
  const requirements: Requirement[] = [
    {
      name: "A real gap",
      figure: `${includedShare}% against ${healthyShare}%`,
      body: `${includedShare}% of adults use a financial service, yet only ${healthyShare}% are financially healthy, and ${bankedRow.in2024}% are banked, the same share as in 2020.`,
      details: (
        <>
          <ReadMoreSection title="Access is almost universal">
            <p>
              {includedShare}% of adults aged 16 and over used at least one financial service in 2024, formal or informal: a bank,
              a SACCO, mobile money, insurance, or a savings group.
            </p>
          </ReadMoreSection>
          <ReadMoreSection title="Financial health is not">
            <p>
              FinScope 2024 also groups adults by financial health, from healthy to extremely vulnerable. Only {healthyShare}% are
              financially healthy; {segmentShare("Coping")}% are coping, {segmentShare("Vulnerable")}% are vulnerable and{" "}
              {segmentShare("Extremely vulnerable")}% are extremely vulnerable.
            </p>
          </ReadMoreSection>
          <ReadMoreSection title="Banking has not moved">
            <p>
              {bankedRow.in2024}% of adults are banked in 2024, against {bankedRow.in2020}% in 2020. Adults using other formal
              services, such as mobile money and SACCOs, rose from {otherFormal.in2020}% to {otherFormal.in2024}%.
            </p>
          </ReadMoreSection>
          <ReadMoreSection title="Who is furthest behind">
            <p>
              {poorestWomen.either}% of women in the poorest fifth of households used a bank account or mobile money in the past
              year, against {richestWomen.either}% in the richest fifth.
            </p>
          </ReadMoreSection>
          <p className="mt-5 text-[13px] text-muted">
            Sources: {FINSCOPE_2024_SOURCE}, including section 5.2 on financial health; NISR, Rwanda DHS 2025, Tables 15.5.1 and
            15.5.2.
          </p>
        </>
      ),
      href: "/financial-exclusion",
      linkLabel: "See the gap",
    },
    {
      name: "Evidence from NISR data",
      figure: `${SITE_FACTS.indicators} indicators`,
      body: `From ${SITE_FACTS.publications} NISR and partner publications, for all ${SITE_FACTS.districts} districts and ${SITE_FACTS.sectors} sectors. Every figure names its table and how far to trust it.`,
      details: (
        <>
          <ReadMoreSection title="The NISR studies behind the figures">
            <ul className="flex flex-wrap gap-2">
              {SOURCE_STUDIES.map((study) => (
                <li key={study.studyId}>
                  <a
                    href={`${NISR_CATALOG_URL}/${study.studyId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded border border-line bg-paper px-2.5 py-1 text-[13.5px] font-semibold text-ink hover:border-cyan-ink hover:text-cyan-ink"
                  >
                    {study.label}
                    <span className="sr-only"> (NISR microdata catalog, opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
            <p>
              With the EICV7 VUP thematic report, the Statistical Yearbook 2025 and NISR&apos;s population projections:{" "}
              {SITE_FACTS.indicators} indicators from {SITE_FACTS.publications} publications in all.
            </p>
          </ReadMoreSection>
          <ReadMoreSection title="How far to trust each figure">
            <p>Every value carries one of these labels:</p>
            <dl className="grid gap-2">
              {Object.entries(STATUS_LABEL).map(([status, label]) => (
                <div key={status}>
                  <dt className="inline font-semibold text-ink">{label}: </dt>
                  <dd className="inline">{STATUS_DESCRIPTION[status]}</dd>
                </div>
              ))}
            </dl>
          </ReadMoreSection>
          <ReadMoreSection title="Open and repeatable">
            <p>
              Scripts in the project repository download the public files, extract the tables and rebuild the data, and automated
              checks rerun them. Microdata is never committed or published.
            </p>
          </ReadMoreSection>
        </>
      ),
      href: "/data",
      linkLabel: "See the sources",
    },
    {
      name: "Practical impact",
      figure: `${SITE_FACTS.levers} policy levers`,
      body: "Each lever is flagged district by district by one published figure and a rule anyone can check, so support can go where the need is greatest.",
      details: (
        <>
          <ReadMoreSection title="The policy levers">
            <p>
              Each lever flags the districts where one published figure is among the 10 highest (or lowest) of the 30. The rule is
              stated, so anyone can check it or change it.
            </p>
            <ul className="divide-y divide-line rounded-lg border border-line">
              {LEVERS.map((lever) => (
                <li key={lever.id} className="px-4 py-3">
                  <p className="font-semibold text-ink">{lever.title}</p>
                  <p className="text-[14px] leading-6 text-muted">{lever.rule}</p>
                </li>
              ))}
            </ul>
          </ReadMoreSection>
          <ReadMoreSection title="How to use them">
            <p>
              Each district page shows the levers flagged for it, with the figure and the programmes that already exist. The
              Intervention Explorer brings the evidence together for a problem, a group and a place.
            </p>
          </ReadMoreSection>
          <ReadMoreSection title="What they are not">
            <p>
              The flags point to where the evidence suggests a lever deserves attention. They are not budget allocations,
              eligibility decisions or predictions of impact.
            </p>
          </ReadMoreSection>
        </>
      ),
      href: "/social-protection/intervention-planner",
      linkLabel: "Intervention planner",
    },
  ];

  // The featured chart: FinScope 2024 measures from access to financial health, with the gap drawn in.
  // Five separate FinScope measures, highest access first down to financial health. The access measures share one
  // cyan; the small financial-health bar is the deepest cyan, the hard truth the title points to, with the gap up to
  // the highest measure drawn beside it.
  const gapRows: GapRow[] = [
    { label: "Use a financial service", value: includedShare, color: CHART_CYAN },
    { label: "Are formally served", value: inclusionOf("Formally served").in2024, color: CHART_CYAN },
    { label: "Have a mobile money wallet", value: registeredWallet, color: CHART_CYAN },
    { label: "Are banked", value: bankedRow.in2024, color: CHART_CYAN },
    {
      label: "Are financially healthy",
      value: healthyShare,
      color: DEEP_CYAN,
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
      summary:
        "Who uses which services, how financial health compares with access, and which districts have most adults outside formal finance.",
      source: "NISR, FinScope 2020 and 2024",
      indicatorId: "finscope_not_formally_included",
      caption: "Map: adults not formally included, by district, 2024. Darker is higher.",
      ramp: "cyan",
      href: "/financial-exclusion",
    },
    {
      area: "Poverty dynamics",
      title: `Poverty fell from ${povertyIn2017.povertyRate}% to ${povertyIn2024.povertyRate}% in seven years`,
      summary:
        "How poverty and living conditions changed since 2016/17, who is poorest and where poverty and financial exclusion overlap.",
      source: "NISR, EICV7 2023/24 (Poverty Profile and Main Indicators)",
      indicatorId: "eicv7_poverty_rate",
      caption: "Map: poverty rate by district, 2023/24. Darker is higher.",
      ramp: "cyan",
      href: "/poverty-dynamics",
    },
    {
      area: "Social protection impact",
      title: `VUP reaches poorer people, but at best ${bestOnTimeShare}% are paid on time`,
      summary:
        "Who VUP reaches, how its payments are made and how late they arrive, and how far Rwanda is from its protection targets.",
      source: "NISR, EICV7 2023/24 (VUP survey and Main Indicators)",
      indicatorId: "eicv7_health_insurance",
      caption: "Map: health insurance coverage by district, 2023/24. Darker is higher.",
      ramp: "cyan",
      href: "/social-protection",
    },
  ];

  const finderDistricts = DISTRICTS.map((district) => ({
    name: district.name,
    slug: district.slug,
    province: PROVINCE_LABEL[district.province],
  }));

  return (
    <>
      <HomeHero cards={heroCards} districtCount={SITE_FACTS.districts} sectorCount={SITE_FACTS.sectors} />

      <FigureTiles
        id="figures-heading"
        eyebrow="What the NISR data shows"
        title="Included, but not yet financially healthy"
        intro="Six published figures frame the challenge: access to finance is almost universal, but financial health, banking and timely social protection payments lag far behind."
        tiles={figureTiles}
      />

      <FeaturedInsight
        title={`${gap} points separate using a financial service from being financially healthy`}
        body={`Almost every adult in Rwanda now uses some financial service, formal or informal. Yet only ${healthyShare}% are financially healthy as FinScope 2024 measures it, and ${bankedRow.in2024}% are banked, the same share as in 2020. The question is no longer only who has access, but who can use finance to manage, save and cope with a shock.`}
        howToRead="Each bar is a separate FinScope measure of adults in 2024. The dashed band on the last bar is the gap between using a financial service and being financially healthy."
        href="/financial-exclusion"
        linkLabel="Read the evidence on financial exclusion"
        chart={
          <GapChart
            title="Access is high. Financial health is not."
            note="Share of adults aged 16 and over, 2024. Each bar is a separate FinScope measure, so an adult can count in several."
            rows={gapRows}
            takeaway={`Financial health means being able to manage daily money, save for the future and cope with a shock, not just holding an account. Only ${healthyShare}% of adults reach it.`}
            source={`${FINSCOPE_2024_SOURCE}; financial health from section 5.2`}
          />
        }
      />

      <ChallengeSection parts={focusCards} />

      <ChallengeStatement requirements={requirements} />

      <PlaceSection
        units={[
          { value: 5, label: "Provinces and the City of Kigali" },
          { value: SITE_FACTS.districts, label: "Districts" },
          { value: SITE_FACTS.sectors, label: "Sectors" },
          { value: SITE_FACTS.cells, label: "Cells" },
          { value: SITE_FACTS.villages, label: "Villages" },
          { value: SITE_FACTS.indicators, label: "District indicators" },
        ]}
        districts={finderDistricts}
        counts={{ sectors: SITE_FACTS.sectors, cells: SITE_FACTS.cells, villages: SITE_FACTS.villages }}
      />
    </>
  );
}
