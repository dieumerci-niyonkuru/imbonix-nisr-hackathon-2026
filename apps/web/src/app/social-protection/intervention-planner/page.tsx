import type { Metadata } from "next";
import { InterventionExplorer } from "@/components/interventions/intervention-explorer";
import { PageHero } from "@/components/ui/section";
import { GROUPS, LOCATIONS, PROBLEMS, type GroupId, type ProblemId } from "@/lib/intervention-explorer";

export const metadata: Metadata = {
  title: "Intervention planner",
  description:
    "Choose a problem, a group and a place: see the evidence, the people affected, where the problem is concentrated, options to consider and the limits of the evidence.",
};

type SearchParams = Promise<{ problem?: string; group?: string; place?: string }>;

/** The Intervention Explorer. A link can open it on a problem, group and place, for example from a district page. */
export default async function InterventionsPage({ searchParams }: { searchParams: SearchParams }) {
  const { problem, group, place } = await searchParams;
  const initialProblem = PROBLEMS.some((item) => item.id === problem) ? (problem as ProblemId) : undefined;
  const initialGroup = GROUPS.some((item) => item.id === group) ? (group as GroupId) : undefined;
  const initialLocation = LOCATIONS.some((item) => item.value === place) ? place : undefined;

  return (
    <>
      <PageHero
        eyebrow="Intervention planner"
        title="Choose a problem, a group and a place. See the evidence, and what could be done."
        intro="For policymakers and organisations: the explorer brings together what NISR data shows, who is affected, where the problem is concentrated, which options existing programmes offer, and what the evidence cannot tell you."
      />
      <section className="container-page py-10 sm:py-12">
        <InterventionExplorer
          key={`${initialProblem}:${initialGroup}:${initialLocation}`}
          initialProblem={initialProblem}
          initialGroup={initialGroup}
          initialLocation={initialLocation}
        />
      </section>
    </>
  );
}
