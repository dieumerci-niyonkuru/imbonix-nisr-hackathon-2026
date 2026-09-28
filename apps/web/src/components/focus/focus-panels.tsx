import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { BuildingLibraryIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { MEN, WOMEN } from "@/components/charts/dumbbell";
import { ComparisonBars, type ComparisonSeries } from "@/components/charts/recharts/comparison-bars";
import { ShareDonut } from "@/components/charts/recharts/share-donut";
import { StackedShareChart, type ShareSeries } from "@/components/charts/recharts/stacked-share-chart";
import { ValueBars } from "@/components/charts/recharts/value-bars";
import { FocusPanel } from "@/components/home/focus-panel";
import type { FocusAreaId } from "@/components/layout/nav";
import { ChartCard } from "@/components/ui/chart-card";
import { PROVINCE_LABEL, PROVINCES, reference, weightedRate } from "@/lib/data";
import {
  COOKING_FUELS,
  EICV7_PROFILE_SOURCE,
  ELECTRICITY_SOURCES,
  LITERACY_BY_QUINTILE,
  LIVING_STANDARDS_BY_YEAR,
  POVERTY_RATE_BY_YEAR,
  SETTLEMENT_TYPES,
} from "@/lib/eicv7-poverty-profile";
import {
  EXCLUDED_ADULTS,
  FINANCIAL_HEALTH_SEGMENTS,
  FINSCOPE_2024_SOURCE,
  INCLUDED_ADULTS_MILLIONS,
  INCLUSION_BY_ROUND,
  MOBILE_MONEY_BY_ROUND,
  MOBILE_MONEY_EVER_USED,
} from "@/lib/finscope-2024";
import { ACCESS_STRAND } from "@/lib/national";
import {
  BANK_ACCOUNT_BY_SEX,
  CREDIT_SOURCES,
  HOUSEHOLD_SURVEY_SOURCE,
  HOUSEHOLDS_WITH_A_BANK_ACCOUNT,
  PEOPLE_OUT_OF_POVERTY_MILLIONS,
  PEOPLE_OUT_OF_POVERTY_PER_YEAR,
  POVERTY_AMONG_VUP_BENEFICIARIES,
  SOCIAL_PROTECTION_SOURCE,
  VUP_BENEFICIARIES,
  VUP_BENEFICIARIES_BY_PROGRAMME,
  VUP_SHARE_BY_SEX,
} from "@/lib/poverty-social-protection";
import { BRAND, CORE, DIMENSION_COLORS, NO_DATA, RAMPS, STRAND } from "@/lib/palette";
import { LEVERS } from "@/lib/priorities";
import { DELAY_RAMP, timeliness, usagePairs, usageRows, VUP_COMPONENTS } from "@/lib/surveys";
import { TARGET_PROGRESS, TARGETS_SOURCE } from "@/lib/national-targets";

export const VUP_TIMELINESS_SOURCE = "NISR, EICV7 VUP thematic report 2023/24, Tables 4.2, 4.5, 4.8 and 4.11";
export const DHS_SOURCE = "NISR, Rwanda DHS 2025, Tables 15.5.1 and 15.5.2";
const PROVINCE_SOURCE = "IMBONIX calculation from the NISR EICV7 2023/24 and FinScope 2024 district tables";

const ACCESS_SERIES: ShareSeries = [
  { key: "banked", label: "Banked", color: STRAND.banked },
  { key: "otherFormal", label: "Other formal (non bank)", color: STRAND.otherFormal },
  { key: "informalOnly", label: "Informal only", color: STRAND.informalOnly },
  { key: "excluded", label: "Excluded", color: STRAND.excluded },
];

const TIMELINESS_SERIES: ShareSeries = [
  { key: "onTime", label: "On time", color: DELAY_RAMP[0] },
  { key: "lateUpToTenDays", label: "1 to 10 days late", color: DELAY_RAMP[1] },
  { key: "lateUpToTwentyDays", label: "11 to 20 days late", color: DELAY_RAMP[2] },
  { key: "lateOverTwentyDays", label: "More than 20 days late", color: DELAY_RAMP[3] },
];

const PROVINCE_SERIES: ComparisonSeries = [
  { key: "povertyRate", label: "Poverty rate", color: DIMENSION_COLORS.poverty.accent },
  { key: "notFormallyIncluded", label: "Not formally included", color: DIMENSION_COLORS.finance.accent },
];

const SEX_SERIES: ComparisonSeries = [
  { key: "women", label: "Women", color: WOMEN },
  { key: "men", label: "Men", color: MEN },
];

/** DHS wealth fifths, poorest first, with the two ends named so they read without a legend. */
const WEALTH_LABEL: Record<string, string> = {
  Lowest: "Poorest",
  Second: "Second",
  Middle: "Middle",
  Fourth: "Fourth",
  Highest: "Richest",
};

/** Healthy in cyan, then coping, vulnerable and extremely vulnerable in darker blues: darker is worse. */
const HEALTH_COLORS = [CORE.cyan, RAMPS.blue[0], BRAND.blue, BRAND.navy];

const TARGET_SERIES: ComparisonSeries = [
  { key: "baseline", label: "Baseline", color: RAMPS.steel[0] },
  { key: "target", label: "Target", color: BRAND.blue },
];

const oneDecimal = (value: number) => Math.round(value * 10) / 10;

const FINSCOPE_ROUND_SERIES: ComparisonSeries = [
  { key: "in2020", label: "2020", color: RAMPS.steel[0] },
  { key: "in2024", label: "2024", color: BRAND.blue },
];

/** Informal sources in cyan (the story), formal finance in blue, government schemes in navy. */
const CREDIT_SOURCE_COLORS: Record<string, string> = {
  informal: CORE.cyan,
  formal: BRAND.blue,
  government: BRAND.navy,
  other: RAMPS.steel[1],
};

const VUP_SEX_SERIES: ComparisonSeries = [
  { key: "population", label: "Share of the population", color: RAMPS.steel[0] },
  { key: "beneficiaries", label: "Share of VUP beneficiaries", color: BRAND.blue },
];

const VUP_PROGRAMME_COLORS = [CORE.cyan, BRAND.blue, BRAND.navy, RAMPS.steel[0]];

const SURVEY_YEAR_SERIES: ComparisonSeries = [
  { key: "in2017", label: "2017", color: RAMPS.steel[0] },
  { key: "in2024", label: "2024", color: BRAND.blue },
];

const ELECTRICITY_COLORS: Record<string, string> = {
  "National grid": BRAND.navy,
  Solar: CORE.cyan,
  "No electricity": NO_DATA,
};

/** Wood and straw in navy, cleaner fuels in cyan. */
const COOKING_FUEL_COLORS: Record<string, string> = {
  Firewood: BRAND.navy,
  "Straw or sticks": BRAND.navy,
  Charcoal: CORE.cyan,
  "Gas and other": CORE.cyan,
};

const SETTLEMENT_COLORS = [BRAND.navy, BRAND.blue, CORE.cyan, RAMPS.steel[0]];

/** A screen reader summary of 100% bars: each category with its shares. */
function describeShares(rows: Record<string, string | number>[], categoryKey: string, series: ShareSeries) {
  return rows
    .map((row) => `${row[categoryKey]}: ${series.map((segment) => `${segment.label} ${row[segment.key]}%`).join(", ")}`)
    .join("; ");
}

/** How late each VUP programme's last payment was: on time, then up to 10, 20 and more than 20 days late. */
export function paymentTimelinessByProgramme() {
  return VUP_COMPONENTS.map((component) => {
    const [onTime, lateUpToTenDays, lateUpToTwentyDays, lateOverTwentyDays] = timeliness(component.id).map((row) =>
      oneDecimal(row.all!),
    );
    return { programme: component.short, onTime, lateUpToTenDays, lateUpToTwentyDays, lateOverTwentyDays };
  });
}

/**
 * The evidence for each focus area: the claim with its key numbers, and the charts that back it. Each focus area
 * page shows one of these panels.
 */
export function buildFocusPanels(): Record<FocusAreaId, ReactNode> {
  const healthyShare = FINANCIAL_HEALTH_SEGMENTS.find((segment) => segment.segment === "Financially healthy")!.share;
  const inclusionOf = (measure: string) => INCLUSION_BY_ROUND.find((row) => row.measure === measure)!;
  const includedShare = inclusionOf("Financially included").in2024;
  const bankedRow = inclusionOf("Banked");
  const excludedShare = inclusionOf("Excluded").in2024;
  const [strandIn2020, strandIn2024] = ACCESS_STRAND;
  const dailyMobileMoney = MOBILE_MONEY_BY_ROUND.find((row) => row.measure === "Use it daily")!;

  // Province rates weighted from the 30 district rates: poverty by people, finance by adults.
  const povertyIn = (province?: string) => oneDecimal(weightedRate("eicv7_poverty_rate", "census_population", province)!);
  const notFormallyIncludedIn = (province?: string) =>
    oneDecimal(weightedRate("finscope_not_formally_included", "proj_adults_16plus_2024", province)!);
  const provinceRows = PROVINCES.map((province) => ({
    // Short names, so the five labels fit under the bars on a phone.
    province: PROVINCE_LABEL[province].replace(" Province", "").replace("City of ", ""),
    povertyRate: povertyIn(province),
    notFormallyIncluded: notFormallyIncludedIn(province),
  }));
  const poorestProvince = [...provinceRows].sort((first, second) => second.povertyRate - first.povertyRate)[0];

  const womenByWealth = usageRows("Wealth quintile", "women");
  const poorestWomen = womenByWealth.find((row) => row.category === "Lowest")!;
  const richestWomen = womenByWealth.find((row) => row.category === "Highest")!;
  const useByWealth = usagePairs("Wealth quintile", "either").map((row) => ({
    wealth: WEALTH_LABEL[row.label],
    women: row.women,
    men: row.men!,
  }));

  const paymentTimeliness = paymentTimelinessByProgramme();
  const directSupportOnTime = paymentTimeliness.find((row) => row.programme === "Direct Support")!.onTime;

  const [povertyIn2017, povertyIn2024] = POVERTY_RATE_BY_YEAR;
  const povertyDrop = (povertyIn2017.povertyRate - povertyIn2024.povertyRate).toFixed(1);
  const householdsWithElectricity = ELECTRICITY_SOURCES.filter((row) => row.source !== "No electricity").reduce(
    (sum, row) => sum + row.share,
    0,
  );
  const plannedVillageShare = SETTLEMENT_TYPES[0].share;

  const audiences = [
    {
      icon: HomeIcon,
      audience: "Vulnerable households",
      value: `${directSupportOnTime}%`,
      text: "of Direct Support households received their last payment on time.",
      href: "/social-protection",
      cta: "VUP support and payments",
    },
    {
      icon: BuildingLibraryIcon,
      audience: "Policymakers",
      value: String(LEVERS.length),
      text: "policy levers, each flagged district by district by one figure and a rule anyone can check.",
      href: "/priorities",
      cta: "Where to act first",
    },
    {
      icon: UserGroupIcon,
      audience: "Civil society",
      value: `${poorestWomen.either}%`,
      text: "of women aged 15 to 49 in the poorest fifth used a bank account or mobile money in the past year.",
      href: "/access-vs-use",
      cta: "Who uses financial services",
    },
  ];

  const panels: Record<FocusAreaId, ReactNode> = {
    exclusion: (
      <div className="grid gap-6">
        <FocusPanel
          kicker="A real gap"
          title={`${includedShare}% are included. Only ${bankedRow.in2024}% are banked.`}
          body="Almost every adult now uses some financial service, but using it to save, borrow and absorb a shock has not followed. Bank use has barely moved."
          stats={[
            {
              value: `${includedShare}%`,
              label: `of adults are included, ${INCLUDED_ADULTS_MILLIONS} million people`,
              color: BRAND.blue,
            },
            { value: `${bankedRow.in2024}%`, label: `are banked, the same share as in 2020`, color: STRAND.banked },
            {
              value: `${excludedShare}%`,
              label: `are excluded, ${EXCLUDED_ADULTS.toLocaleString("en-US")} adults`,
              color: CORE.cyan,
            },
          ]}
          links={[{ href: "/dashboard", label: "Rwanda in figures" }]}
        >
          <ChartCard
            title="Inclusion rose, bank use did not"
            note="Share of adults using each kind of service. One adult can use several, so rows overlap."
            howToRead="Each pair of bars is one kind of service: grey is 2020, blue is 2024. A longer blue bar means more adults used it in 2024."
            source={FINSCOPE_2024_SOURCE}
          >
            <ComparisonBars
              rows={INCLUSION_BY_ROUND}
              categoryKey="measure"
              series={FINSCOPE_ROUND_SERIES}
              description={`Adults using financial services in 2020 and 2024. ${INCLUSION_BY_ROUND.map((row) => `${row.measure}: ${row.in2020}% then ${row.in2024}%`).join("; ")}.`}
            />
          </ChartCard>
          <ChartCard
            title={`Only ${healthyShare}% of adults are financially healthy`}
            note="Adults by financial health segment. The published shares are rounded, so they add up to 101%."
            howToRead="The ring splits all adults into four groups; the bigger the slice, the more adults in it. The number in the middle is the financially healthy share."
            source={`${FINSCOPE_2024_SOURCE}, section 5.2`}
          >
            <ShareDonut
              segments={FINANCIAL_HEALTH_SEGMENTS.map((row, index) => ({
                label: row.segment,
                share: row.share,
                color: HEALTH_COLORS[index],
              }))}
              centerValue={`${healthyShare}%`}
              centerLabel="financially healthy"
              description={`Adults by financial health: ${FINANCIAL_HEALTH_SEGMENTS.map((row) => `${row.segment} ${row.share}%`).join(", ")}.`}
            />
          </ChartCard>
        </FocusPanel>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            className="lg:col-span-2"
            title={`Adults relying only on informal services fell from ${strandIn2020.informalOnly}% to ${strandIn2024.informalOnly}%`}
            note="Every adult counted once, by the most formal service they use. Other formal only is formally served minus banked."
            howToRead="Each bar is all adults in one year, split by the most formal service they use. Compare the cyan slice, informal only, between the two years."
            source={FINSCOPE_2024_SOURCE}
          >
            <StackedShareChart
              rows={ACCESS_STRAND}
              categoryKey="year"
              series={ACCESS_SERIES}
              labelWidth={40}
              description={`Adults by the most formal service they use. ${describeShares(ACCESS_STRAND, "year", ACCESS_SERIES)}.`}
            />
          </ChartCard>
          <ChartCard
            title={`Daily mobile money use rose from ${dailyMobileMoney.in2020}% to ${dailyMobileMoney.in2024}%`}
            note={`${MOBILE_MONEY_EVER_USED}% of adults own or have used mobile money.`}
            howToRead="Grey is 2020, blue is 2024. Each pair shows the share of adults who own a wallet, or use one weekly or daily."
            source={FINSCOPE_2024_SOURCE}
          >
            <ComparisonBars
              rows={MOBILE_MONEY_BY_ROUND}
              categoryKey="measure"
              series={FINSCOPE_ROUND_SERIES}
              description={`Mobile money in 2020 and 2024. ${MOBILE_MONEY_BY_ROUND.map((row) => `${row.measure}: ${row.in2020}% then ${row.in2024}%`).join("; ")}.`}
            />
          </ChartCard>
          <ChartCard
            className="lg:row-span-2"
            title="Households borrow from tontines and relatives, not banks"
            note="Households with credit, by source. Cyan is informal, blue is formal finance, navy is a government scheme. A household can use several sources."
            howToRead="Each bar is one source of credit; the longer the bar, the more households with credit borrowed from it."
            source={HOUSEHOLD_SURVEY_SOURCE}
          >
            <ValueBars
              orientation="row"
              seriesName="Households with credit"
              bars={CREDIT_SOURCES.map((row) => ({ label: row.source, value: row.share, color: CREDIT_SOURCE_COLORS[row.kind] }))}
              description={`Sources of credit for households: ${CREDIT_SOURCES.map((row) => `${row.source} ${row.share}%`).join(", ")}.`}
            />
          </ChartCard>
          <ChartCard
            title="Women are less likely to have a bank account"
            note={`Adults aged 18 and over. ${HOUSEHOLDS_WITH_A_BANK_ACCOUNT}% of households have at least one member with an account.`}
            howToRead="Each bar is the share with a bank account: all adults first, then men and women."
            source={HOUSEHOLD_SURVEY_SOURCE}
          >
            <ValueBars
              seriesName="Adults with a bank account"
              bars={BANK_ACCOUNT_BY_SEX.map((row) => ({
                label: row.group,
                value: row.share,
                color: row.group === "Women" ? CORE.cyan : row.group === "Men" ? BRAND.navy : RAMPS.steel[1],
              }))}
              description={`Adults with a bank account: ${BANK_ACCOUNT_BY_SEX.map((row) => `${row.group} ${row.share}%`).join(", ")}.`}
            />
          </ChartCard>
        </div>
      </div>
    ),
    poverty: (
      <div className="grid gap-6">
        <FocusPanel
          title="Poverty and exclusion mostly overlap. The North is the exception."
          body="The Western and Southern provinces have the most poverty and the most adults outside formal finance. The Northern Province is the second least poor, yet almost as many of its adults are outside formal finance as in the West. Wealth matters too: use of a bank account or mobile money rises with every wealth fifth, for women and for men."
          stats={[
            {
              value: `${poorestProvince.povertyRate}%`,
              label: `of people are poor in the ${poorestProvince.province} Province, the highest rate (district rates weighted by population)`,
              color: DIMENSION_COLORS.poverty.accent,
            },
            {
              value: `${poorestWomen.bank}%`,
              label: `of women in the poorest fifth have and use a bank account, against ${richestWomen.bank}% in the richest`,
              color: STRAND.banked,
            },
          ]}
          links={[
            { href: "/map", label: "Map of every district" },
            { href: "/districts", label: "Find your district" },
          ]}
        >
          <ChartCard
            title="Poverty and adults outside formal finance, by province"
            note={`Each district's published rate, weighted by its 2022 population for poverty and its projected 2024 adults for finance. Nationally this gives ${povertyIn()}% and ${notFormallyIncludedIn()}%, against the published ${reference("eicv7_poverty_rate").value}% and ${reference("finscope_not_formally_included").value}%.`}
            howToRead="For each province, one bar is the poverty rate and the other the share of adults outside formal finance. Where both are long, the two needs overlap."
            source={PROVINCE_SOURCE}
            status="calculated"
          >
            <ComparisonBars
              rows={provinceRows}
              categoryKey="province"
              series={PROVINCE_SERIES}
              labelWidth={64}
              description={`Poverty rate and adults not formally included, by province. ${provinceRows.map((row) => `${row.province}: poverty ${row.povertyRate}%, not formally included ${row.notFormallyIncluded}%`).join("; ")}.`}
            />
          </ChartCard>
          <ChartCard
            title="Account or mobile money use rises with wealth"
            note="Women and men aged 15 to 49 who used a bank account or mobile money in the past year, by household wealth fifth."
            howToRead="Groups run from the poorest fifth of households to the richest. In each, one bar is women and one is men; longer means more used an account or mobile money."
            source={DHS_SOURCE}
          >
            <ComparisonBars
              rows={useByWealth}
              categoryKey="wealth"
              series={SEX_SERIES}
              description={`Used a bank account or mobile money in the past year, by wealth fifth. ${useByWealth.map((row) => `${row.wealth}: women ${row.women}%, men ${row.men}%`).join("; ")}.`}
            />
          </ChartCard>
        </FocusPanel>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard
            title={`Poverty fell ${povertyDrop} points in seven years`}
            note={`About ${PEOPLE_OUT_OF_POVERTY_MILLIONS} million people left poverty, around ${PEOPLE_OUT_OF_POVERTY_PER_YEAR.toLocaleString("en-US")} a year.`}
            howToRead="Each bar is the national poverty rate in one survey; the difference between them is the fall in seven years."
            source={EICV7_PROFILE_SOURCE}
          >
            <ValueBars
              seriesName="Poverty rate"
              bars={POVERTY_RATE_BY_YEAR.map((row, index) => ({
                label: row.year,
                value: row.povertyRate,
                color: index === 0 ? RAMPS.navy[1] : CORE.navy,
              }))}
              description={`Poverty rate: ${POVERTY_RATE_BY_YEAR.map((row) => `${row.year} ${row.povertyRate}%`).join(", ")}.`}
            />
          </ChartCard>
          <ChartCard
            title="Living conditions improved"
            note="Improved drinking water is at least 90% in 2024."
            howToRead="Grey is 2017, blue is 2024. A longer blue bar means more households had that condition in 2024."
            source={EICV7_PROFILE_SOURCE}
          >
            <ComparisonBars
              rows={LIVING_STANDARDS_BY_YEAR}
              categoryKey="measure"
              series={SURVEY_YEAR_SERIES}
              description={`Living conditions in 2017 and 2024. ${LIVING_STANDARDS_BY_YEAR.map((row) => `${row.measure}: ${row.in2017}% then ${row.in2024}%`).join("; ")}.`}
            />
          </ChartCard>
          <ChartCard
            title={`${householdsWithElectricity}% of households have electricity`}
            note={`No electricity is 100% minus the ${householdsWithElectricity}% with access.`}
            howToRead="The ring splits all households by their main source of electricity; the light grey slice has none."
            source={EICV7_PROFILE_SOURCE}
          >
            <ShareDonut
              segments={ELECTRICITY_SOURCES.map((row) => ({
                label: row.source,
                share: row.share,
                color: ELECTRICITY_COLORS[row.source],
              }))}
              centerValue={`${householdsWithElectricity}%`}
              centerLabel="with electricity"
              stacked
              description={`Households by source of electricity: ${ELECTRICITY_SOURCES.map((row) => `${row.source} ${row.share}%`).join(", ")}.`}
            />
          </ChartCard>
          <ChartCard
            title="Three in four households cook with firewood or straw"
            note="Gas and other is the 24% using improved methods, minus 19% charcoal."
            howToRead="Each bar is the share of households cooking mainly with that fuel. Navy is wood or straw, cyan is cleaner fuel."
            source={EICV7_PROFILE_SOURCE}
          >
            <ValueBars
              orientation="row"
              seriesName="Households"
              bars={COOKING_FUELS.map((row) => ({ label: row.fuel, value: row.share, color: COOKING_FUEL_COLORS[row.fuel] }))}
              description={`Main cooking fuel: ${COOKING_FUELS.map((row) => `${row.fuel} ${row.share}%`).join(", ")}.`}
            />
          </ChartCard>
          <ChartCard
            title="The poorest are least literate"
            note="Literacy rate by fifth of consumption per adult."
            howToRead="Bars run from the poorest fifth of people to the richest; the longer the bar, the higher the share who can read and write."
            source={EICV7_PROFILE_SOURCE}
          >
            <ValueBars
              seriesName="Literacy rate"
              bars={LITERACY_BY_QUINTILE.map((row, index) => ({
                label: row.quintile,
                value: row.literacyRate,
                color: index === 0 ? CORE.cyan : BRAND.navy,
              }))}
              description={`Literacy rate: ${LITERACY_BY_QUINTILE.map((row) => `${row.quintile} ${row.literacyRate}%`).join(", ")}.`}
            />
          </ChartCard>
          <ChartCard
            title={`${plannedVillageShare}% of households live in planned villages`}
            note="Households by type of settlement, 2023/24."
            howToRead="The ring splits all households by the kind of place they live in; the largest slice is planned rural villages (umudugudu)."
            source={EICV7_PROFILE_SOURCE}
          >
            <ShareDonut
              segments={SETTLEMENT_TYPES.map((row, index) => ({
                label: row.settlement,
                share: row.share,
                color: SETTLEMENT_COLORS[index],
              }))}
              centerValue={`${plannedVillageShare}%`}
              centerLabel="planned rural villages"
              stacked
              description={`Households by settlement: ${SETTLEMENT_TYPES.map((row) => `${row.settlement} ${row.share}%`).join(", ")}.`}
            />
          </ChartCard>
        </div>
      </div>
    ),
    protection: (
      <div className="grid gap-6">
        <FocusPanel
          kicker="Practical use"
          title="Evidence each actor can act on."
          body="IMBONIX turns the same figures into clear starting points for the people who can change them, with every rule and source in the open. It describes places, not households, so it points to where to look rather than who should receive support."
          links={[{ href: "/scenarios", label: "Test a policy target" }]}
        >
          <ul className="grid gap-4 md:grid-cols-3">
            {audiences.map((audience) => (
              <li key={audience.audience} className="flex flex-col rounded-3xl border border-line bg-white p-5">
                <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
                  <audience.icon className="h-5 w-5 text-royal" aria-hidden="true" />
                  {audience.audience}
                </p>
                <p className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-ink">{audience.value}</p>
                <p className="mt-1 flex-1 text-[13.5px] leading-5 text-muted">{audience.text}</p>
                <Link
                  href={audience.href}
                  className="group mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold text-royal"
                >
                  {audience.cta}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <ChartCard
            title="Fewer than one in five last payments arrived on time"
            note="VUP beneficiaries by how late their last payment was, for each programme."
            howToRead="Each bar is one VUP programme, split by how late the last payment arrived. The lightest slice is on time; the darker the slice, the later the payment."
            source={VUP_TIMELINESS_SOURCE}
          >
            <StackedShareChart
              rows={paymentTimeliness}
              categoryKey="programme"
              series={TIMELINESS_SERIES}
              description={`Timeliness of the last payment by programme. ${describeShares(paymentTimeliness, "programme", TIMELINESS_SERIES)}.`}
            />
          </ChartCard>
          <ChartCard
            title="Where Rwanda stands against its national targets"
            note="Financial inclusion targets are for 2030; the social protection target is for 2028/29."
            howToRead="For each measure, grey is where Rwanda started and blue is the target. The gap between the two bars is the distance still to go."
            source={TARGETS_SOURCE}
            status="target"
          >
            <ComparisonBars
              rows={TARGET_PROGRESS}
              categoryKey="measure"
              series={TARGET_SERIES}
              description={`Baselines and targets. ${TARGET_PROGRESS.map((row) => `${row.measure}: ${row.baseline}% at baseline, target ${row.target}%`).join("; ")}.`}
            />
          </ChartCard>
        </FocusPanel>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard
            title="VUP reaches poorer people"
            note={`Poverty rate among the ${VUP_BENEFICIARIES.toLocaleString("en-US")} VUP beneficiaries and nationally.`}
            howToRead="The first bar is the poverty rate for all Rwandans, the second for VUP beneficiaries. The longer second bar shows VUP reaches poorer people."
            source={SOCIAL_PROTECTION_SOURCE}
          >
            <ValueBars
              seriesName="Poverty rate"
              bars={POVERTY_AMONG_VUP_BENEFICIARIES.map((row, index) => ({
                label: row.group,
                value: row.povertyRate,
                color: index === 0 ? RAMPS.navy[1] : CORE.navy,
              }))}
              description={`Poverty rate: ${POVERTY_AMONG_VUP_BENEFICIARIES.map((row) => `${row.group} ${row.povertyRate}%`).join(", ")}.`}
            />
          </ChartCard>
          <ChartCard
            title="Three in four VUP beneficiaries are women"
            note="Women's share of the population is 100% minus the published 47.9% men."
            howToRead="For women and for men, grey is their share of the population and blue their share of VUP beneficiaries."
            source={SOCIAL_PROTECTION_SOURCE}
          >
            <ComparisonBars
              rows={VUP_SHARE_BY_SEX}
              categoryKey="sex"
              series={VUP_SEX_SERIES}
              labelWidth={52}
              description={`Share of the population and of VUP beneficiaries. ${VUP_SHARE_BY_SEX.map((row) => `${row.sex}: ${row.population}% of the population, ${row.beneficiaries}% of beneficiaries`).join("; ")}.`}
            />
          </ChartCard>
          <ChartCard
            className="lg:col-span-2 xl:col-span-1"
            title="Nutrition sensitive Direct Support is the largest VUP programme"
            note="Other programmes is 100% minus the three published shares."
            howToRead="The ring splits VUP beneficiaries by programme; the number in the middle is the share in nutrition sensitive Direct Support (NSDS)."
            source={SOCIAL_PROTECTION_SOURCE}
          >
            <ShareDonut
              segments={VUP_BENEFICIARIES_BY_PROGRAMME.map((row, index) => ({
                label: row.programme,
                share: row.share,
                color: VUP_PROGRAMME_COLORS[index],
              }))}
              centerValue={`${VUP_BENEFICIARIES_BY_PROGRAMME[0].share}%`}
              centerLabel="in NSDS"
              stacked
              description={`VUP beneficiaries by programme: ${VUP_BENEFICIARIES_BY_PROGRAMME.map((row) => `${row.programme} ${row.share}%`).join(", ")}.`}
            />
          </ChartCard>
        </div>
      </div>
    ),
  };

  return panels;
}
