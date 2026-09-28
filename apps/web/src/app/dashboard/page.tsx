import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { DistrictStrip } from "@/components/charts/district-strip";
import { AccessStrandChart } from "@/components/charts/recharts/access-strand-chart";
import { FinancialHealthChart } from "@/components/charts/recharts/financial-health-chart";
import { PovertyProvinceChart, PovertyTrendChart } from "@/components/charts/recharts/poverty-charts";
import { TargetTracker } from "@/components/charts/target-tracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HowToRead } from "@/components/ui/chart-card";
import { PageHero, SectionHeader } from "@/components/ui/section";
import { StatTile } from "@/components/ui/stat-tile";
import { RESILIENCE_FACTS, TARGETS } from "@/lib/national";
import { timeliness, usageTotal } from "@/lib/surveys";
import { BRAND, CORE, RAMPS } from "@/lib/palette";

export const metadata: Metadata = {
  title: "Rwanda in figures",
  description:
    "Rwanda's financial inclusion, financial health, poverty and social protection at a glance, with progress toward official targets.",
};

function Source({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 border-t border-line pt-3 text-[11.5px] leading-5 text-muted">{children}</p>;
}

export default function DashboardPage() {
  const women = usageTotal("women");
  const dsOnTime = timeliness("Direct Support")[0];

  return (
    <>
      <PageHero
        eyebrow="Rwanda in figures"
        title="Financial inclusion and poverty in Rwanda, at a glance"
        intro="The national picture from NISR's latest surveys, and how far Rwanda still is from its 2030 targets. Every figure links back to its published source; district detail is one click away on the map."
      />

      <section className="container-page py-10" aria-labelledby="headline-figures">
        <h2 id="headline-figures" className="sr-only">
          Headline figures
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatTile
            value="27.4%"
            label="of people live below the poverty line"
            detail="95% CI 26.4 to 28.4"
            source="EICV7 2023/24"
            accent={CORE.navy}
          />
          <StatTile value="5.4%" label="live in extreme poverty" source="EICV7 2023/24" accent={RAMPS.navy[3]} />
          <StatTile
            value="92%"
            label="of adults use at least one formal financial service"
            source="FinScope 2024"
            accent={BRAND.blue}
          />
          <StatTile
            value="10%"
            label="of adults are financially healthy"
            detail="Roadmap target: 20% by 2030"
            source="FinScope 2024"
            accent={CORE.cyan}
          />
          <StatTile
            value={`${women.either.toFixed(1)}%`}
            label="of women aged 15 to 49 used a bank account or mobile money in the past year"
            source="DHS 2025"
            accent={BRAND.blue}
          />
          <StatTile
            value={`${dsOnTime.all!.toFixed(1)}%`}
            label="of VUP Direct Support households were paid on time"
            source="EICV7 VUP 2023/24"
            accent={CORE.navy}
          />
        </div>
      </section>

      <section className="container-page grid gap-6 pb-12 lg:grid-cols-2" aria-labelledby="inclusion-heading">
        <h2 id="inclusion-heading" className="sr-only">
          Financial inclusion
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Access has deepened, but banking has not</CardTitle>
            <CardDescription>
              Each adult is counted once, by the most formal service they use. Mobile money and SACCOs drove the shift out of
              informal only use; the banked share stayed at 22%.
            </CardDescription>
            <HowToRead className="mt-2">
              Each bar is all adults in one year, split by the most formal service they use. Compare the slices between 2020 and
              2024: the cyan slice, informal only, shrank.
            </HowToRead>
          </CardHeader>
          <CardContent>
            <AccessStrandChart />
            <Source>
              FinScope 2024 report (NISR and Access to Finance Rwanda), access strand; 2020 as restated in the 2024 report.
            </Source>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Included, but not yet financially healthy</CardTitle>
            <CardDescription>
              Only one adult in ten is financially healthy. The Roadmap aims to cut the vulnerable share from 31% to 10% by 2030.
            </CardDescription>
            <HowToRead className="mt-2">
              For each group, one bar is the share of adults in 2024 and the other the 2030 target. Where the target bar is
              longer, the group should grow; where it is shorter, the group should shrink.
            </HowToRead>
          </CardHeader>
          <CardContent>
            <FinancialHealthChart />
            <Source>
              FinScope 2024 financial health segments; targets from the National Financial Inclusion Roadmap 2025 to 2030, Annex
              2.
            </Source>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
          {RESILIENCE_FACTS.map((fact) => (
            <div key={fact.label} className="rounded-2xl border border-line bg-white p-5">
              <p className="font-display text-3xl font-semibold text-ink">{fact.value}</p>
              <p className="mt-2 text-[13.5px] leading-5 text-ink/80">{fact.label}</p>
              <p className="mt-2 text-[11.5px] text-muted">{fact.source.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white py-14" aria-labelledby="targets-heading">
        <div className="container-page grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <SectionHeader
              eyebrow="Official targets"
              title={<span id="targets-heading">How far is there still to go?</span>}
              intro="Measured baselines against the targets in the National Financial Inclusion Roadmap, NST2 and the Social Protection Sector Strategic Plan. The dot is where Rwanda is; the ring is where it aims to be."
            />
            <p className="mt-4 text-[12.5px] leading-5 text-muted">
              IMBONIX does not forecast whether targets will be met. District baselines for these targets need the FinScope 2024
              microdata.
            </p>
          </div>
          <TargetTracker targets={TARGETS} />
        </div>
      </section>

      <section className="container-page grid gap-6 py-14 lg:grid-cols-2" aria-labelledby="poverty-heading">
        <div className="lg:col-span-2">
          <SectionHeader
            eyebrow="Poverty"
            accent="text-dim-poverty"
            title={<span id="poverty-heading">Poverty has fallen, unevenly</span>}
            intro="Measured on the same EICV7 method, poverty fell by 12 points in seven years. The Western and Southern provinces remain far above the national rate."
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>National poverty, 2016/17 and 2023/24</CardTitle>
            <CardDescription>
              2016/17 is NISR&apos;s estimate recalculated on the EICV7 method, so the two periods compare directly.
            </CardDescription>
            <HowToRead className="mt-2">
              Each pair of bars is one survey period: the first bar is poverty, the second extreme poverty. Lower is better.
            </HowToRead>
          </CardHeader>
          <CardContent>
            <PovertyTrendChart />
            <Source>NISR EICV7 Poverty Profile, 2023/24.</Source>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Poverty by province, 2023/24</CardTitle>
            <CardDescription>Share of people below the poverty line.</CardDescription>
            <HowToRead className="mt-2">Each bar is one province, from the highest poverty rate to the lowest.</HowToRead>
          </CardHeader>
          <CardContent>
            <PovertyProvinceChart />
            <Source>NISR EICV7 Poverty Profile, 2023/24.</Source>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-line bg-white py-14" aria-labelledby="spread-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="District spread"
            title={<span id="spread-heading">What the national averages hide</span>}
            intro="Each dot is a district; the vertical line is the national figure (or the district median where NISR publishes none). Select a measure name to open it on the map."
          />
          <div className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {[
              "eicv7_poverty_rate",
              "finscope_not_formally_included",
              "dhs_stunting",
              "cfsva_hazard_any",
              "eicv7_hh_smartphone",
              "lfs_neet_youth",
            ].map((id) => (
              <DistrictStrip key={id} id={id} />
            ))}
          </div>
          <Button asChild variant="outline" className="mt-10">
            <Link href="/map">
              Open the map of every district <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
