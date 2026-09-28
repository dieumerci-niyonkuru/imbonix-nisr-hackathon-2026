import type { Metadata } from "next";
import { PriorityWeights } from "@/components/scenarios/priority-weights";
import { ReachCalculator } from "@/components/scenarios/reach-calculator";
import { Callout, PageHero, SectionHeader } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Test a policy target",
  description:
    "Scenario tools on published NISR figures: how many adults to reach for an inclusion target, and how priorities shift with weights.",
};

export default function ScenariosPage() {
  return (
    <>
      <PageHero
        eyebrow="Test a policy target"
        title="What if? Test targets and priorities on real district data"
        intro="Two tools for planning conversations. Both do transparent arithmetic on published NISR figures and label every output as a scenario: they help compare options, they do not forecast what a policy would achieve."
      />

      <section className="container-page py-12" aria-labelledby="reach-heading">
        <SectionHeader
          eyebrow="Scenario 1"
          accent="text-dim-finance"
          title={<span id="reach-heading">How many adults would a target mean, and where?</span>}
          intro="Set a ceiling for the share of adults outside formal finance in every district. The calculator shows how many adults that means reaching, and how concentrated the effort would be."
        />
        <div className="mt-8">
          <ReachCalculator />
        </div>
      </section>

      <section className="border-y border-line bg-white py-12" aria-labelledby="weights-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Scenario 2"
            title={<span id="weights-heading">Whose priority list? It depends on the weights</span>}
            intro="Any single priority ranking weighs poverty, financial access, nutrition and shocks somehow. Choose the weights yourself and watch which districts move."
          />
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
