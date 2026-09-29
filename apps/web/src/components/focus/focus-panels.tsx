import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { BuildingLibraryIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { ComparisonBars, type ComparisonSeries } from "@/components/charts/recharts/comparison-bars";
import { StackedShareChart, type ShareSeries } from "@/components/charts/recharts/stacked-share-chart";
import { ShareBars } from "@/components/charts/share-bars";
import { ValueBars } from "@/components/charts/recharts/value-bars";
import { FocusPanel } from "@/components/home/focus-panel";
import type { FocusAreaId } from "@/components/layout/nav";
import { ChartCard } from "@/components/ui/chart-card";
import {
  EXCLUDED_ADULTS,
  FINANCIAL_HEALTH_SEGMENTS,
  FINSCOPE_2024_SOURCE,
  INCLUDED_ADULTS_MILLIONS,
  INCLUSION_BY_ROUND,
  MOBILE_MONEY_BY_ROUND,
  MOBILE_MONEY_EVER_USED,
} from "@/lib/finscope-2024";
import { describeShares } from "@/lib/format";
import { ACCESS_STRAND } from "@/lib/national";
import {
  BANK_ACCOUNT_BY_SEX,
  CREDIT_SOURCES,
  HOUSEHOLD_SURVEY_SOURCE,
  HOUSEHOLDS_WITH_A_BANK_ACCOUNT,
  POVERTY_AMONG_VUP_BENEFICIARIES,
  SOCIAL_PROTECTION_SOURCE,
  VUP_BENEFICIARIES,
  VUP_BENEFICIARIES_BY_PROGRAMME,
  VUP_SHARE_BY_SEX,
} from "@/lib/poverty-social-protection";
import { COMPARE, CORE, DEEP_CYAN, LIGHT_GREY, MID_GREY, RAMPS, STRAND } from "@/lib/palette";
import { LEVERS } from "@/lib/priorities";
import { DELAY_RAMP, timeliness, usageRows, VUP_COMPONENTS } from "@/lib/surveys";
import { TARGET_PROGRESS, TARGETS_SOURCE } from "@/lib/national-targets";

const VUP_TIMELINESS_SOURCE = "NISR, EICV7 VUP thematic report 2023/24, Tables 4.2, 4.5, 4.8 and 4.11";

/** The FinScope access strand: every adult once, by the most formal service they use. */
export const ACCESS_SERIES: ShareSeries = [
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

/** Healthy in cyan, then coping, vulnerable and extremely vulnerable from light grey to deep cyan: darker is worse. */
const HEALTH_COLORS = [CORE.cyan, LIGHT_GREY, MID_GREY, DEEP_CYAN];

const TARGET_SERIES: ComparisonSeries = [
  { key: "baseline", label: "Baseline", color: COMPARE.before },
  { key: "target", label: "Target", color: COMPARE.after },
];

const oneDecimal = (value: number) => Math.round(value * 10) / 10;

const FINSCOPE_ROUND_SERIES: ComparisonSeries = [
  { key: "in2020", label: "2020", color: COMPARE.before },
  { key: "in2024", label: "2024", color: COMPARE.after },
];

/** Informal sources in cyan (the story), formal finance in deep cyan, government schemes in grey. */
const CREDIT_SOURCE_COLORS: Record<string, string> = {
  informal: CORE.cyan,
  formal: DEEP_CYAN,
  government: MID_GREY,
  other: LIGHT_GREY,
};

const VUP_SEX_SERIES: ComparisonSeries = [
  { key: "population", label: "Share of the population", color: COMPARE.before },
  { key: "beneficiaries", label: "Share of VUP beneficiaries", color: COMPARE.after },
];

const VUP_PROGRAMME_COLORS = [CORE.cyan, LIGHT_GREY, DEEP_CYAN, MID_GREY];

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
export function buildFocusPanels(): Record<Exclude<FocusAreaId, "poverty">, ReactNode> {
  const healthyShare = FINANCIAL_HEALTH_SEGMENTS.find((segment) => segment.segment === "Financially healthy")!.share;
  const inclusionOf = (measure: string) => INCLUSION_BY_ROUND.find((row) => row.measure === measure)!;
  const includedShare = inclusionOf("Financially included").in2024;
  const bankedRow = inclusionOf("Banked");
  const excludedShare = inclusionOf("Excluded").in2024;
  const [strandIn2020, strandIn2024] = ACCESS_STRAND;
  const dailyMobileMoney = MOBILE_MONEY_BY_ROUND.find((row) => row.measure === "Use it daily")!;

  const womenByWealth = usageRows("Wealth quintile", "women");
  const poorestWomen = womenByWealth.find((row) => row.category === "Lowest")!;

  const paymentTimeliness = paymentTimelinessByProgramme();
  const directSupportOnTime = paymentTimeliness.find((row) => row.programme === "Direct Support")!.onTime;

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

  const panels: Record<Exclude<FocusAreaId, "poverty">, ReactNode> = {
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
              color: CORE.cyan,
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
            id="chart-inclusion-by-service"
            title="Inclusion rose, bank use did not"
            note="Share of adults using each kind of service. One adult can use several, so rows overlap."
            howToRead="Each pair of bars is one kind of service: grey is 2020, cyan is 2024. A longer cyan bar means more adults used it in 2024."
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
            id="chart-financial-health"
            title={`Only ${healthyShare}% of adults are financially healthy`}
            note="Adults by financial health segment. The published shares are rounded, so they add up to 101%."
            howToRead="The strip at the top is all adults, split into four groups. Below it, each bar is one group on a scale of 0 to 100%: the longer the bar, the more adults in that group."
            source={`${FINSCOPE_2024_SOURCE}, section 5.2`}
          >
            <ShareBars
              segments={FINANCIAL_HEALTH_SEGMENTS.map((row, index) => ({
                label: row.segment,
                share: row.share,
                color: HEALTH_COLORS[index],
              }))}
              highlight="Financially healthy"
            />
          </ChartCard>
        </FocusPanel>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            className="lg:col-span-2"
            id="chart-access-strand"
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
            id="chart-mobile-money"
            title={`Daily mobile money use rose from ${dailyMobileMoney.in2020}% to ${dailyMobileMoney.in2024}%`}
            note={`${MOBILE_MONEY_EVER_USED}% of adults own or have used mobile money.`}
            howToRead="Grey is 2020, cyan is 2024. Each pair shows the share of adults who own a wallet, or use one weekly or daily."
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
            id="chart-credit-sources"
            title="Households borrow from tontines and relatives, not banks"
            note="Households with credit, by source. Cyan is informal, dark cyan is formal finance, grey is a government scheme. A household can use several sources."
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
            id="chart-bank-account-by-sex"
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
                color: row.group === "Women" ? CORE.cyan : row.group === "Men" ? DEEP_CYAN : MID_GREY,
              }))}
              description={`Adults with a bank account: ${BANK_ACCOUNT_BY_SEX.map((row) => `${row.group} ${row.share}%`).join(", ")}.`}
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
                  <audience.icon className="h-5 w-5 text-cyan-ink" aria-hidden="true" />
                  {audience.audience}
                </p>
                <p className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-ink">{audience.value}</p>
                <p className="mt-1 flex-1 text-[13.5px] leading-5 text-muted">{audience.text}</p>
                <Link
                  href={audience.href}
                  className="group mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold text-cyan-ink"
                >
                  {audience.cta}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <ChartCard
            id="chart-payment-timeliness"
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
            id="chart-national-targets"
            title="Where Rwanda stands against its national targets"
            note="Financial inclusion targets are for 2030; the social protection target is for 2028/29."
            howToRead="For each measure, grey is where Rwanda started and cyan is the target. The gap between the two bars is the distance still to go."
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
            id="chart-vup-poverty"
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
                color: index === 0 ? RAMPS.cyan[1] : CORE.deep,
              }))}
              description={`Poverty rate: ${POVERTY_AMONG_VUP_BENEFICIARIES.map((row) => `${row.group} ${row.povertyRate}%`).join(", ")}.`}
            />
          </ChartCard>
          <ChartCard
            id="chart-vup-by-sex"
            title="Three in four VUP beneficiaries are women"
            note="Women's share of the population is 100% minus the published 47.9% men."
            howToRead="For women and for men, grey is their share of the population and cyan their share of VUP beneficiaries."
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
            id="chart-vup-programmes"
            title="Nutrition sensitive Direct Support is the largest VUP programme"
            note="Other programmes is 100% minus the three published shares."
            howToRead="The strip at the top is all VUP beneficiaries, split by programme. Below it, each bar is one programme; the longest is nutrition sensitive Direct Support (NSDS)."
            source={SOCIAL_PROTECTION_SOURCE}
          >
            <ShareBars
              segments={VUP_BENEFICIARIES_BY_PROGRAMME.map((row, index) => ({
                label: row.programme,
                share: row.share,
                color: VUP_PROGRAMME_COLORS[index],
              }))}
              highlight={VUP_BENEFICIARIES_BY_PROGRAMME[0].programme}
            />
          </ChartCard>
        </div>
      </div>
    ),
  };

  return panels;
}
