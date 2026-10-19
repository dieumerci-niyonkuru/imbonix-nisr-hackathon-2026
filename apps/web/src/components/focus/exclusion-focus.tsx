import { ComparisonBars, type ComparisonSeries } from "@/components/charts/recharts/comparison-bars";
import { FinancialHealthChart } from "@/components/charts/recharts/financial-health-chart";
import { StackedShareChart } from "@/components/charts/recharts/stacked-share-chart";
import { ValueBars } from "@/components/charts/recharts/value-bars";
import { ShareBars } from "@/components/charts/share-bars";
import { DistrictStrip } from "@/components/charts/district-strip";
import { DistrictFinanceLookup } from "@/components/focus/district-finance-lookup";
import { Finding } from "@/components/focus/finding";
import { ACCESS_SERIES } from "@/components/focus/focus-shared";
import { FigureTiles, type FigureTile } from "@/components/home/figure-tiles";
import { ChartCard } from "@/components/ui/chart-card";
import { Callout, type HeroStat, SectionHeader } from "@/components/ui/section";
import { SectionNav, type PageSection } from "@/components/ui/section-nav";
import {
  BANK_ACCOUNT_BARRIERS,
  BANK_BARRIERS_SOURCE,
  EXCLUDED_ADULTS,
  FINANCIAL_HEALTH_SEGMENTS,
  FINANCIAL_INCLUSION_TREND,
  FINANCIAL_INCLUSION_TREND_SOURCE,
  FINSCOPE_2024_SOURCE,
  INCLUDED_ADULTS_MILLIONS,
  INCLUSION_BY_ROUND,
  INSURANCE_UPTAKE,
  MOBILE_MONEY_BY_ROUND,
  MOBILE_MONEY_EVER_USED,
} from "@/lib/finscope-2024";
import { describeShares } from "@/lib/format";
import { ACCESS_STRAND, FINANCIAL_HEALTH } from "@/lib/national";
import { TARGETS_SOURCE } from "@/lib/national-targets";
import { COMPARE, CORE, DEEP_CYAN, LIGHT_GREY, MID_GREY } from "@/lib/palette";
import {
  BANK_ACCOUNT_BY_SEX,
  CREDIT_SOURCES,
  HOUSEHOLD_SURVEY_SOURCE,
  HOUSEHOLDS_WITH_A_BANK_ACCOUNT,
} from "@/lib/poverty-social-protection";
import { usageRows } from "@/lib/surveys";

const FINSCOPE_ROUND_SERIES: ComparisonSeries = [
  { key: "in2020", label: "2020", color: COMPARE.before },
  { key: "in2024", label: "2024", color: COMPARE.after },
];

/** The long-run trend: formal inclusion catching up to total inclusion across the FinScope rounds. */
const INCLUSION_TREND_SERIES: ComparisonSeries = [
  { key: "included", label: "Financially included (any)", color: CORE.cyan },
  { key: "formal", label: "Formally included", color: DEEP_CYAN },
];

/** Healthy in cyan, then coping, vulnerable and extremely vulnerable from light grey to deep cyan: darker is worse. */
const HEALTH_COLORS = [CORE.cyan, LIGHT_GREY, MID_GREY, DEEP_CYAN];

/** Informal sources in cyan (the story), formal finance in deep cyan, government schemes in grey. */
const CREDIT_SOURCE_COLORS: Record<string, string> = {
  informal: CORE.cyan,
  formal: DEEP_CYAN,
  government: MID_GREY,
  other: LIGHT_GREY,
};

const SECTIONS: PageSection[] = [
  { id: "key-figures", label: "Key figures" },
  { id: "access", label: "Access" },
  { id: "districts", label: "Across districts" },
  { id: "health", label: "Financial health" },
  { id: "money", label: "Mobile money and credit" },
  { id: "who", label: "Who is left out" },
  { id: "deeper", label: "Go deeper" },
];

/**
 * The page's answer in three headline figures for the hero strip — almost everyone included, few resilient, a minority
 * still shut out. Read from the same published tables as the charts below, so the snapshot and the detail never disagree.
 */
export function exclusionHeroStats(): HeroStat[] {
  const shareOf = (measure: string) => INCLUSION_BY_ROUND.find((row) => row.measure === measure)!.in2024;
  const healthy = FINANCIAL_HEALTH_SEGMENTS.find((row) => row.segment === "Financially healthy")!.share;
  return [
    { value: `${shareOf("Financially included")}%`, label: "use a financial service" },
    { value: `${healthy}%`, label: "are financially healthy" },
    { value: `${shareOf("Excluded")}%`, label: `fully excluded (${EXCLUDED_ADULTS.toLocaleString("en-US")} adults)` },
  ];
}

/**
 * The financial exclusion overview, as one story in sections with a menu under the header: the key figures, how access
 * grew, why access is not financial health, how people pay and borrow, and who is left out. Headings and figures are
 * worked out from the published FinScope and household survey tables.
 */
export function ExclusionFocus() {
  const inclusionOf = (measure: string) => INCLUSION_BY_ROUND.find((row) => row.measure === measure)!;
  const included = inclusionOf("Financially included");
  const formallyServed = inclusionOf("Formally served");
  const banked = inclusionOf("Banked");
  const segmentShare = (name: string) => FINANCIAL_HEALTH_SEGMENTS.find((row) => row.segment === name)!.share;
  const healthyShare = segmentShare("Financially healthy");
  const vulnerableShare = segmentShare("Vulnerable") + segmentShare("Extremely vulnerable");
  const healthyTarget = FINANCIAL_HEALTH.find((row) => row.segment === "Financially healthy")!.target;
  const [strandIn2020, strandIn2024] = ACCESS_STRAND;
  const dailyMobileMoney = MOBILE_MONEY_BY_ROUND.find((row) => row.measure === "Use it daily")!;
  const creditShare = (source: string) => CREDIT_SOURCES.find((row) => row.source === source)!.share;
  const accountShare = (group: string) => BANK_ACCOUNT_BY_SEX.find((row) => row.group === group)!.share;
  const womenByWealth = usageRows("Wealth quintile", "women");
  const poorestWomen = womenByWealth.find((row) => row.category === "Lowest")!;
  const richestWomen = womenByWealth.find((row) => row.category === "Highest")!;

  const tiles: FigureTile[] = [
    {
      value: `${included.in2024}%`,
      label: `of adults use a financial service — up from ${included.in2020}% in 2020`,
      source: FINSCOPE_2024_SOURCE,
    },
    {
      value: `${banked.in2024}%`,
      label:
        banked.in2024 === banked.in2020
          ? "are banked — the same share as in 2020"
          : `are banked — against ${banked.in2020}% in 2020`,
      source: `NISR, FinScope 2020 and 2024`,
    },
    {
      value: `${healthyShare}%`,
      label: "are financially healthy — can save and absorb a shock, not just hold an account",
      source: `${FINSCOPE_2024_SOURCE}, section 5.2`,
    },
    {
      value: EXCLUDED_ADULTS.toLocaleString("en-US"),
      label: `use no financial service at all — ${inclusionOf("Excluded").in2024}% of adults`,
      source: FINSCOPE_2024_SOURCE,
    },
  ];

  return (
    <>
      <SectionNav label="Financial inclusion" sections={SECTIONS} />

      <div id="key-figures" className="scroll-mt-36">
        <FigureTiles
          id="key-figures-heading"
          eyebrow="Key figures"
          title="Almost every adult is included. Few are financially healthy."
          intro={`${INCLUDED_ADULTS_MILLIONS} million adults use some financial service, yet the share who are banked has not moved since 2020, and only one adult in ten is financially healthy.`}
          tiles={tiles}
          columns={4}
        />
      </div>

      <section id="access" className="scroll-mt-36 bg-paper py-10 sm:py-12" aria-labelledby="access-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Access"
            title={<span id="access-heading">Inclusion grew through mobile money and SACCOs, not banks</span>}
            intro={`Adults served by a formal provider rose from ${formallyServed.in2020}% to ${formallyServed.in2024}% between 2020 and 2024, while the banked share stayed at ${banked.in2024}%. Relying only on informal services fell from ${strandIn2020.informalOnly}% to ${strandIn2024.informalOnly}% of adults.`}
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
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
          </div>
          <div className="mt-6">
            <ChartCard
              id="chart-inclusion-trend"
              title="Inclusion is now almost all formal — a 16-year shift"
              note="Adults financially included (any formal or informal service) and formally included (a bank, mobile money, a SACCO, insurance or a pension), across the FinScope rounds."
              howToRead="Each pair is one survey year: light cyan is included at all, dark cyan is formally included. Formal access has climbed from 21% to 92% and nearly closed the gap — the growth came from people moving into formal finance. Survey methods changed between rounds, so read this as the overall trend."
              source={FINANCIAL_INCLUSION_TREND_SOURCE}
            >
              <ComparisonBars
                rows={FINANCIAL_INCLUSION_TREND}
                categoryKey="year"
                series={INCLUSION_TREND_SERIES}
                description={`Formal and total financial inclusion by FinScope round. ${FINANCIAL_INCLUSION_TREND.map((row) => `${row.year}: formally ${row.formal}%, included ${row.included}%`).join("; ")}.`}
              />
            </ChartCard>
          </div>
        </div>
      </section>

      <section id="districts" className="scroll-mt-36 bg-white py-10 sm:py-12" aria-labelledby="districts-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Across districts"
            title={<span id="districts-heading">Inclusion looks very different district by district</span>}
            intro="National averages hide wide gaps. Search any district, sector, cell or village to see where it stands, or scan all 30 at once. The city districts have the widest formal access; the most rural districts have the most people left out."
          />
          <div className="mt-10 grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
            <DistrictFinanceLookup />
            <div className="rounded-2xl border border-line bg-white p-6 sm:p-7">
              <p className="eyebrow text-cyan-ink">The spread</p>
              <h3 className="mt-2 font-display text-xl font-bold tracking-[-0.02em] text-ink sm:text-2xl">
                All 30 districts at a glance
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-muted">
                Each dot is a district; the upright line marks the national figure. The distance between the ends is how much the
                average hides.
              </p>
              <div className="mt-7 space-y-8">
                <DistrictStrip id="finscope_not_formally_included" />
                <DistrictStrip id="finscope_banked" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="health" className="scroll-mt-36 bg-white py-10 sm:py-12" aria-label="Financial health">
        <div className="container-page">
          <Finding
            title="Being included is not the same as being financially healthy"
            body={`FinScope 2024 rates how well each adult manages money day to day, copes with a shock and plans ahead. Only ${healthyShare}% are financially healthy, and ${vulnerableShare}% are vulnerable or extremely vulnerable. The National Financial Inclusion Roadmap aims for ${healthyTarget}% healthy by 2030.`}
            stats={[
              { value: `${healthyShare}%`, label: "of adults are financially healthy", color: CORE.cyan },
              { value: `${vulnerableShare}%`, label: "are vulnerable or extremely vulnerable", color: DEEP_CYAN },
            ]}
          >
            <ChartCard
              id="chart-financial-health"
              title={`Only ${healthyShare}% of adults are financially healthy`}
              note="Adults by financial health segment, 2024. The published shares are rounded, so they add up to 101%."
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
            <ChartCard
              title="The 2030 targets ask for twice as many healthy adults"
              note="Each financial health group in 2024, beside the share the Roadmap sets for 2030."
              howToRead="For each group, the dark bar is 2024 and the light bar the 2030 target. Where the target bar is longer, the group should grow; where it is shorter, the group should shrink."
              source={`${FINSCOPE_2024_SOURCE}, section 5.2; ${TARGETS_SOURCE}`}
              status="target"
            >
              <FinancialHealthChart />
            </ChartCard>
          </Finding>
          <div className="mt-8">
            <Callout title="Most households have no cushion against a shock" tone="warn">
              Only {INSURANCE_UPTAKE.in2024}% of adults were covered by any insurance in 2024, up from {INSURANCE_UPTAKE.in2020}%
              in 2020 — so most meet a shock, an illness or a bad harvest, with no formal protection. That thin cushion is a big
              part of why financial health lags behind inclusion. Source: {FINSCOPE_2024_SOURCE}, Figure 49.
            </Callout>
          </div>
        </div>
      </section>

      <section id="money" className="scroll-mt-36 bg-paper py-10 sm:py-12" aria-labelledby="money-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Mobile money and credit"
            title={<span id="money-heading">People pay by phone, but still borrow from each other</span>}
            intro={`Daily mobile money use rose from ${dailyMobileMoney.in2020}% to ${dailyMobileMoney.in2024}% of adults between 2020 and 2024, and ${MOBILE_MONEY_EVER_USED}% own or have used mobile money. Yet in 2019/20, ${creditShare("Tontine")}% of households with credit borrowed from a tontine and ${creditShare("Relative")}% from a relative, against ${creditShare("Commercial bank")}% from a commercial bank.`}
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
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
              id="chart-credit-sources"
              title="Households borrow from tontines and relatives, not banks"
              note="Households with credit, by source, 2019/20. Cyan is informal, dark cyan is formal finance, grey is a government scheme. A household can use several sources."
              howToRead="Each bar is one source of credit; the longer the bar, the more households with credit borrowed from it."
              source={HOUSEHOLD_SURVEY_SOURCE}
            >
              <ValueBars
                orientation="row"
                seriesName="Households with credit"
                bars={CREDIT_SOURCES.map((row) => ({
                  label: row.source,
                  value: row.share,
                  color: CREDIT_SOURCE_COLORS[row.kind],
                }))}
                description={`Sources of credit for households: ${CREDIT_SOURCES.map((row) => `${row.source} ${row.share}%`).join(", ")}.`}
              />
            </ChartCard>
          </div>
        </div>
      </section>

      <section id="who" className="scroll-mt-36 bg-white py-10 sm:py-12" aria-label="Who is left out">
        <div className="container-page">
          <Finding
            title="Women and the poorest are furthest behind"
            body={`In 2019/20, ${accountShare("Women")}% of women aged 18 and over had a bank account, against ${accountShare("Men")}% of men. In 2025, ${poorestWomen.either}% of women aged 15 to 49 in the poorest fifth of households used a bank account or mobile money, against ${richestWomen.either}% in the richest.`}
            stats={[
              { value: `${accountShare("Women")}%`, label: "of women had a bank account in 2019/20", color: CORE.cyan },
              {
                value: `${poorestWomen.either}%`,
                label: "of women in the poorest fifth used an account or mobile money in 2025",
                color: DEEP_CYAN,
              },
            ]}
            links={[
              { href: "/financial-exclusion/access-and-use", label: "Access and use" },
              { href: "/data/key-figures", label: "Key figures" },
            ]}
          >
            <ChartCard
              id="chart-bank-account-by-sex"
              title="Women are less likely to have a bank account"
              note={`Adults aged 18 and over, 2019/20. ${HOUSEHOLDS_WITH_A_BANK_ACCOUNT}% of households have at least one member with an account.`}
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
            <ChartCard
              id="chart-bank-barriers"
              title="The main barrier to a bank account is income, not access"
              note="Why unbanked adults do not open a bank account, 2024 — one main reason each."
              howToRead="Each bar is a reason unbanked adults give; the longer the bar, the more cite it. Distance, cost and documents barely register — not earning enough does."
              source={BANK_BARRIERS_SOURCE}
            >
              <ValueBars
                orientation="row"
                seriesName="Unbanked adults"
                bars={BANK_ACCOUNT_BARRIERS.map((row) => ({
                  label: row.reason,
                  value: row.share,
                  color: row.share >= 50 ? CORE.cyan : MID_GREY,
                }))}
                description={`Barriers to a bank account: ${BANK_ACCOUNT_BARRIERS.map((row) => `${row.reason} ${row.share}%`).join(", ")}.`}
              />
            </ChartCard>
          </Finding>
        </div>
      </section>
    </>
  );
}
