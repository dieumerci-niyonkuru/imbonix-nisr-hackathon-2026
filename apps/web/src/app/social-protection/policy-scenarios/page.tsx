import type { Metadata } from "next";
import { PriorityWeights } from "@/components/scenarios/priority-weights";
import { ReachCalculator } from "@/components/scenarios/reach-calculator";
import { Callout, PageHero, SectionHeader } from "@/components/ui/section";
import { HowToRead } from "@/components/ui/chart-card";

export const metadata: Metadata = {
  title: "Policy scenarios",
  description:
    "Scenario tools on published NISR figures: how many adults to reach for an inclusion target, and how priorities shift with weights.",
};

export default function ScenariosPage() {
  return (
    <>
      <PageHero
        eyebrow="Policy scenarios"
        title="What if? Test targets and priorities on real district data"
        intro="Two tools for planning conversations. Both do transparent arithmetic on published NISR figures and label every output as a scenario: they help compare options, they do not forecast what a policy would achieve."
      />

      <section id="chart-reach-scenario" className="container-page scroll-mt-36 py-12" aria-labelledby="reach-heading">
        <SectionHeader
          eyebrow="Scenario 1"
          accent="text-dim-finance"
          title={<span id="reach-heading">How many adults would a target mean, and where?</span>}
          intro="Set a ceiling for the share of adults outside formal finance in every district. The calculator shows how many adults that means reaching, and how concentrated the effort would be."
        />
        <HowToRead className="mt-4 max-w-3xl">
          Choose a measure and move the slider to set the target. The totals show how many adults that means reaching, and the
          bars show the districts with the most adults to reach.
        </HowToRead>
        <div className="mt-8">
          <ReachCalculator />
        </div>
      </section>

      <section
        id="chart-priority-weights"
        className="scroll-mt-36 border-y border-line bg-white py-12"
        aria-labelledby="weights-heading"
      >
        <div className="container-page">
          <SectionHeader
            eyebrow="Scenario 2"
            title={<span id="weights-heading">Whose priority list? It depends on the weights</span>}
            intro="Any single priority ranking weighs poverty, financial access, nutrition and shocks somehow. Choose the weights yourself and watch which districts move."
          />
          <HowToRead className="mt-4 max-w-3xl">
            Move a slider to give a dimension more or less weight. The list shows the ten districts that rank highest under your
            weights, and the arrows show how each moved against equal weights.
          </HowToRead>
          <div className="mt-8">
            <PriorityWeights />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-4 py-12 md:grid-cols-3">
        <Callout title="Not a forecast">
          The tools do not model how people respond to a policy, how long reaching them takes, or what it costs. They show the
          size and location of a gap under a stated target.
        </Callout>
        <Callout title="Uncertainty carries through">
          FinScope district rates carry roughly ±3 points of sampling error, so the number of adults to reach in a single district
          are approximate. Compare orders of magnitude, not exact counts.
        </Callout>
        <Callout title="Built to be checked">
          Every formula is written next to its result and in the open source code (src/lib/scenarios.ts), so anyone can reproduce
          or challenge it.
        </Callout>
      </section>
    </>
  );
}
