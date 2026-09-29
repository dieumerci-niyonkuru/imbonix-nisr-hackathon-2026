import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { MEN, WOMEN } from "@/components/charts/dumbbell";
import { Callout, PageHero, SectionHeader } from "@/components/ui/section";
import { usageRows, usageTotal } from "@/lib/surveys";
import { UsageExplorer } from "@/components/usage/usage-explorer";
import { Button } from "@/components/ui/button";
import { HowToRead } from "@/components/ui/chart-card";

export const metadata: Metadata = {
  title: "Who uses financial services",
  description:
    "FinScope 2024 counts 96% of adults as financially included. DHS 2025 shows how many actually used a bank account or mobile money.",
};

export default function AccessVsUsePage() {
  const women = usageTotal("women");
  const men = usageTotal("men");
  const poorestWomen = usageRows("Wealth quintile", "women").find((r) => r.category === "Lowest")!;
  const richestWomen = usageRows("Wealth quintile", "women").find((r) => r.category === "Highest")!;
  const ruralWomen = usageRows("Residence", "women").find((r) => r.category === "Rural")!;
  const girls = usageRows("Age", "women").find((r) => r.category === "15-19")!;
  const noEducation = usageRows("Education", "women").find((r) => r.category === "No education")!;

  const tiles = [
    { value: women.either, label: "of women aged 15 to 49 used a bank account or mobile money in the past year", color: WOMEN },
    { value: men.either, label: "of men aged 15 to 49 did the same", color: MEN },
    { value: poorestWomen.either, label: "of women in the poorest fifth of households", color: WOMEN },
    { value: girls.either, label: "of girls aged 15 to 19", color: WOMEN },
  ];

  return (
    <>
      <PageHero
        eyebrow="Who uses financial services"
        title="96% are included. Far fewer actually use an account."
        intro="FinScope 2024 counts an adult as financially included if they use any financial product, formal or informal, including savings groups. DHS 2025 asks a stricter question: did you personally use a bank account or your phone for a financial transaction in the past 12 months? Both surveys can be right. The gap between them shows who has access on paper but little active use."
      />

      <section className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label}>
              <div className="card h-full p-6">
                <span className="block h-1 w-10 rounded-full" style={{ background: t.color }} />
                <p className="mt-4 font-display text-5xl font-bold tracking-[-0.04em] text-ink">{t.value.toFixed(1)}%</p>
                <p className="mt-2 text-[14px] leading-6 text-ink/80">{t.label}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-muted">Source: NISR Rwanda DHS 2025 final report, Tables 15.5.1 and 15.5.2.</p>
      </section>

      <section className="border-y border-line bg-white py-14">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-line p-6">
            <p className="eyebrow text-dim-finance">FinScope 2024</p>
            <p className="mt-2 font-display text-xl font-bold text-ink">Any product, formal or informal</p>
            <ul className="mt-4 space-y-2 text-[14px] leading-6 text-muted">
              <li>
                <strong>Who:</strong> adults aged 16 and over, about 14,000 interviewed.
              </li>
              <li>
                <strong>Counts as included:</strong> using any formal service (bank, mobile money, SACCO, insurance, pension) or
                an informal one (savings group, tontine).
              </li>
              <li>
                <strong>Result:</strong> 96% included, 92% formally, 22% banked, 4% excluded. The report puts the gender gap in
                overall inclusion at about one point.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-line p-6">
            <p className="eyebrow text-dim-nutrition">DHS 2025</p>
            <p className="mt-2 font-display text-xl font-bold text-ink">Personal, active use in the past year</p>
            <ul className="mt-4 space-y-2 text-[14px] leading-6 text-muted">
              <li>
                <strong>Who:</strong> {women.n.toLocaleString("en-US")} women and {men.n.toLocaleString("en-US")} men aged 15 to
                49 (weighted).
              </li>
              <li>
                <strong>Counts as using:</strong> has and uses a bank account, or used a mobile phone for a financial transaction,
                in the last 12 months.
              </li>
              <li>
                <strong>Result:</strong> {women.either.toFixed(1)}% of women and {men.either.toFixed(1)}% of men, a{" "}
                {(men.either - women.either).toFixed(1)}-point gap. From {poorestWomen.either.toFixed(1)}% of the poorest women to{" "}
                {richestWomen.either.toFixed(1)}% of the richest.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <SectionHeader
          eyebrow="Explore the gap"
          accent="text-dim-nutrition"
          title="Who uses financial services, and who does not"
          intro={`Pick a measure. Each line joins women (cyan) and men (dark cyan) in the same group. Use is lowest among the poorest, the least educated and the youngest: only ${noEducation.either.toFixed(1)}% of women with no schooling and ${ruralWomen.either.toFixed(1)}% of rural women used an account or mobile money. The gap between women and men is widest after age 40, at about 15 points.`}
        />
        <HowToRead className="mt-4 max-w-3xl">
          Each row is one group of people. The cyan dot is women and the dark cyan dot is men; the further right, the higher the
          share, and the longer the line between the dots, the wider the gap between them.
        </HowToRead>
        <div id="chart-usage-explorer" className="mt-8 scroll-mt-36">
          <UsageExplorer />
        </div>
      </section>

      <section className="container-page grid gap-4 pb-16 md:grid-cols-3">
        <Callout title="Different ages, different questions">
          FinScope covers adults 16+; the DHS figures here cover ages 15 to 49. Treat them as two lenses on the same system, not
          as a trend or a correction of each other.
        </Callout>
        <Callout title="Why it matters for policy">
          The National Financial Inclusion Roadmap now targets financial health and active use, not just account ownership. Poor,
          rural and young women are where active use lags most.
        </Callout>
        <Callout title="Next step: districts">
          The published DHS tables stop at province level. The DHS 2025 microdata has a district code, so the team plans to
          estimate this gap for every district once access is granted.
        </Callout>
      </section>

      <section className="container-page pb-20">
        <Button asChild variant="default">
          <Link href="/poverty-dynamics/district-map?layer=finscope_not_formally_included">
            See formal inclusion by district on the map <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </>
  );
}
