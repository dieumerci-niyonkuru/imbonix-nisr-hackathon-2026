import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { BuildingLibraryIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { ComparisonBars, type ComparisonSeries } from "@/components/charts/recharts/comparison-bars";
import { StackedShareChart } from "@/components/charts/recharts/stacked-share-chart";
import { ValueBars } from "@/components/charts/recharts/value-bars";
import { ShareBars } from "@/components/charts/share-bars";
import { Finding } from "@/components/focus/finding";
import { paymentTimelinessByProgramme, TIMELINESS_SERIES } from "@/components/focus/focus-shared";
import { FigureTiles, type FigureTile } from "@/components/home/figure-tiles";
import { ChartCard } from "@/components/ui/chart-card";
import { SectionHeader } from "@/components/ui/section";
import { SectionNav, type PageSection } from "@/components/ui/section-nav";
import { describeShares } from "@/lib/format";
import { TARGET_PROGRESS, TARGETS_SOURCE } from "@/lib/national-targets";
import { COMPARE, CORE, DEEP_CYAN, LIGHT_GREY, MID_GREY, RAMPS } from "@/lib/palette";
import {
  POVERTY_AMONG_VUP_BENEFICIARIES,
  SOCIAL_PROTECTION_SOURCE,
  VUP_BENEFICIARIES,
  VUP_BENEFICIARIES_BY_PROGRAMME,
  VUP_SHARE_BY_SEX,
} from "@/lib/poverty-social-protection";
import { LEVERS } from "@/lib/priorities";
import { usageRows } from "@/lib/surveys";

const VUP_TIMELINESS_SOURCE = "NISR, EICV7 VUP thematic report 2023/24, Tables 4.2, 4.5, 4.8 and 4.11";

const TARGET_SERIES: ComparisonSeries = [
  { key: "baseline", label: "Baseline", color: COMPARE.before },
  { key: "target", label: "Target", color: COMPARE.after },
];

const VUP_SEX_SERIES: ComparisonSeries = [
  { key: "population", label: "Share of the population", color: COMPARE.before },
  { key: "beneficiaries", label: "Share of VUP beneficiaries", color: COMPARE.after },
];

const VUP_PROGRAMME_COLORS = [CORE.cyan, LIGHT_GREY, DEEP_CYAN, MID_GREY];

const SECTIONS: PageSection[] = [
  { id: "key-figures", label: "Key figures" },
  { id: "reach", label: "Who VUP reaches" },
  { id: "payments", label: "How payments arrive" },
  { id: "targets", label: "National targets" },
  { id: "act", label: "Who can act" },
  { id: "deeper", label: "Go deeper" },
];

/**
 * The social protection overview, as one story in sections with a menu under the header: the key figures, who VUP
 * reaches, how late its payments arrive, how far Rwanda is from its targets and what each actor can do with the
 * evidence. Headings and figures are worked out from the published tables.
 */
export function ProtectionFocus() {
  const [nationally, amongBeneficiaries] = POVERTY_AMONG_VUP_BENEFICIARIES;
  const women = VUP_SHARE_BY_SEX.find((row) => row.sex === "Women")!;
  const payments = paymentTimelinessByProgramme();
  const directSupport = payments.find((row) => row.programme === "Direct Support")!;
  const bestOnTime = [...payments].sort((first, second) => second.onTime - first.onTime)[0];
  const worstLate = [...payments].sort((first, second) => second.lateOverTwentyDays - first.lateOverTwentyDays)[0];
  const allUnderOneInFive = payments.every((row) => row.onTime < 20);
  const coverage = TARGET_PROGRESS.find((row) => row.measure === "Poor and vulnerable people with social protection")!;
  const poorestWomen = usageRows("Wealth quintile", "women").find((row) => row.category === "Lowest")!;

  const tiles: FigureTile[] = [
    {
      value: VUP_BENEFICIARIES.toLocaleString("en-US"),
      label: "VUP beneficiaries in 2023/24",
      source: SOCIAL_PROTECTION_SOURCE,
    },
    {
      value: `${amongBeneficiaries.povertyRate}%`,
      label: `of VUP beneficiaries are poor, against ${nationally.povertyRate}% of all Rwandans`,
      source: SOCIAL_PROTECTION_SOURCE,
    },
    {
      value: `${women.beneficiaries}%`,
      label: `of VUP beneficiaries are women, who are ${women.population}% of the population`,
      source: SOCIAL_PROTECTION_SOURCE,
    },
    {
      value: `${directSupport.onTime}%`,
      label: "of Direct Support households received their last payment on time",
      source: VUP_TIMELINESS_SOURCE,
    },
  ];

  const audiences = [
    {
      icon: HomeIcon,
      audience: "Vulnerable households",
      value: `${directSupport.onTime}%`,
      text: "of Direct Support households received their last payment on time.",
      href: "/social-protection/vup-payments",
      cta: "VUP payments",
    },
    {
      icon: BuildingLibraryIcon,
      audience: "Policymakers",
      value: String(LEVERS.length),
      text: "policy levers, each flagged district by district by one figure and a rule anyone can check.",
      href: "/social-protection/priority-districts",
      cta: "Priority districts",
    },
    {
      icon: UserGroupIcon,
      audience: "Civil society",
      value: `${poorestWomen.either}%`,
      text: "of women aged 15 to 49 in the poorest fifth used a bank account or mobile money in the past year.",
      href: "/financial-exclusion/access-and-use",
      cta: "Access and use",
    },
  ];

  return (
    <>
      <SectionNav label="Social protection" sections={SECTIONS} />

      <div id="key-figures" className="scroll-mt-36">
        <FigureTiles
          id="key-figures-heading"
          eyebrow="Key figures"
          title="VUP reaches poorer people, but its payments arrive late"
          intro={`The Vision 2020 Umurenge Programme reaches ${VUP_BENEFICIARIES.toLocaleString("en-US")} beneficiaries, who are far poorer than the average Rwandan. Most of them are women. Yet in every programme, most last payments arrived late.`}
          tiles={tiles}
          columns={4}
        />
      </div>

      <section id="reach" className="scroll-mt-36 bg-paper py-16 sm:py-20" aria-labelledby="reach-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Who VUP reaches"
            title={<span id="reach-heading">Support goes to poorer households, and mostly to women</span>}
            intro={`${amongBeneficiaries.povertyRate}% of VUP beneficiaries are poor, against ${nationally.povertyRate}% nationally, and ${women.beneficiaries}% are women. Nutrition sensitive Direct Support is the largest of its programmes.`}
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <ChartCard
              id="chart-vup-poverty"
              title="VUP reaches poorer people"
              note={`Poverty rate among the ${VUP_BENEFICIARIES.toLocaleString("en-US")} VUP beneficiaries and nationally.`}
              howToRead="The first bar is the poverty rate for all Rwandans, the second for VUP beneficiaries. The taller second bar shows VUP reaches poorer people."
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
              title={`${women.beneficiaries}% of VUP beneficiaries are women`}
              note={`Women's share of the population is 100% minus the published ${VUP_SHARE_BY_SEX.find((row) => row.sex === "Men")!.population}% men.`}
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
      </section>

      <section id="payments" className="scroll-mt-36 bg-white py-16 sm:py-20" aria-label="How payments arrive">
        <div className="container-page">
          <Finding
            title={allUnderOneInFive ? "Fewer than one in five last payments arrived on time" : "Many last payments arrived late"}
            body={`In every VUP programme, most beneficiaries received their last payment late. The best on time record is ${bestOnTime.onTime}%, in ${bestOnTime.programme}; in ${worstLate.programme}, ${worstLate.lateOverTwentyDays}% of last payments were more than 20 days late.`}
            stats={[
              { value: `${bestOnTime.onTime}%`, label: `on time at best, in ${bestOnTime.programme}`, color: RAMPS.cyan[0] },
              {
                value: `${worstLate.lateOverTwentyDays}%`,
                label: `more than 20 days late in ${worstLate.programme}`,
                color: DEEP_CYAN,
              },
            ]}
            links={[{ href: "/social-protection/vup-payments", label: "VUP payments" }]}
          >
            <ChartCard
              id="chart-payment-timeliness"
              title={
                allUnderOneInFive ? "Fewer than one in five last payments arrived on time" : "How late the last payment arrived"
              }
              note="VUP beneficiaries by how late their last payment was, for each programme."
              howToRead="Each bar is one VUP programme, split by how late the last payment arrived. The lightest slice is on time; the darker the slice, the later the payment."
              source={VUP_TIMELINESS_SOURCE}
            >
              <StackedShareChart
                rows={payments}
                categoryKey="programme"
                series={TIMELINESS_SERIES}
                description={`Timeliness of the last payment by programme. ${describeShares(payments, "programme", TIMELINESS_SERIES)}.`}
              />
            </ChartCard>
          </Finding>
        </div>
      </section>

      <section id="targets" className="scroll-mt-36 bg-paper py-16 sm:py-20" aria-label="National targets">
        <div className="container-page">
          <Finding
            title="How far Rwanda is from its targets"
            body={`The National Financial Inclusion Roadmap sets 2030 targets for financial health, mobile money use and formal credit; NST2 sets a 2028/29 target for social protection. Coverage of poor and vulnerable people would need to rise from ${coverage.baseline}% to ${coverage.target}%.`}
            stats={[
              {
                value: `${coverage.baseline}% to ${coverage.target}%`,
                label: "of poor and vulnerable people with social protection, from the baseline to the 2028/29 target",
                color: CORE.cyan,
              },
            ]}
            links={[{ href: "/social-protection/policy-scenarios", label: "Policy scenarios" }]}
          >
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
          </Finding>
        </div>
      </section>

      <section id="act" className="scroll-mt-36 bg-white py-16 sm:py-20" aria-labelledby="act-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Who can act"
            title={<span id="act-heading">Evidence each actor can act on</span>}
            intro="The same figures give clear starting points to the people who can change them, with every rule and source in the open. IMBONIX describes places, not households, so it points to where to look rather than who should receive support."
          />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {audiences.map((audience) => (
              <li
                key={audience.audience}
                className="flex flex-col border border-t-4 border-line border-t-cyan bg-white p-6 sm:p-7"
              >
                <p className="flex items-center gap-2 text-[14px] font-bold text-ink">
                  <audience.icon className="h-5 w-5 text-cyan-ink" aria-hidden="true" />
                  {audience.audience}
                </p>
                <p className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-cyan-ink">{audience.value}</p>
                <p className="mt-2 flex-1 text-pretty text-[15px] leading-6 text-muted">{audience.text}</p>
                <Link
                  href={audience.href}
                  className="group mt-5 inline-flex items-center gap-1.5 rounded text-[14.5px] font-bold text-ink underline-offset-4 hover:text-cyan-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                >
                  {audience.cta}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
