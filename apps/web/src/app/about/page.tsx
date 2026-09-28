import type { Metadata } from "next";
import { AudienceSection, type Audience } from "@/components/home/audience-section";
import { MethodologyJourney, type JourneyStep } from "@/components/home/methodology-journey";
import { WhySection, type Contribution } from "@/components/home/why-section";
import { PageHero } from "@/components/ui/section";
import { SITE_FACTS } from "@/lib/site-facts";

export const metadata: Metadata = {
  title: "About",
  description: "Why IMBONIX exists, who it serves, and how it gets from NISR's published tables to evidence people can act on.",
};

const CONTRIBUTIONS: Contribution[] = [
  {
    title: "It brings the evidence together",
    body: "Figures from separate NISR surveys, censuses and reports, side by side for every district and, where NISR publishes them, every sector.",
  },
  {
    title: "It says how far to trust each number",
    body: "Every value is labelled: an official estimate, an IMBONIX calculation, a model estimate, a projection, a scenario or a policy target.",
  },
  {
    title: "It points to what can be done",
    body: `${SITE_FACTS.levers} policy levers show which districts stand out on each need, with the rule behind every flag in the open.`,
  },
];

const BENEFICIARIES: Audience[] = [
  {
    title: "Vulnerable households",
    body: "Shows where payments arrive late and formal finance is far, so support can reach people sooner.",
    href: "/social-protection",
    linkLabel: "See how VUP support arrives",
  },
  {
    title: "Policymakers",
    body: `${SITE_FACTS.levers} policy levers, each flagged district by district by one published figure and a rule anyone can check.`,
    href: "/priorities",
    linkLabel: "See where to act first",
  },
  {
    title: "Researchers",
    body: "Every figure with its table, year and trust label, a JSON API that serves the same figures, and scripts that rebuild the data.",
    href: "/data",
    linkLabel: "Use the data and methods",
  },
  {
    title: "Civil society",
    body: "Open figures with their sources, to follow programmes and speak up for the places left behind.",
    href: "/districts",
    linkLabel: "Find your district",
  },
  {
    title: "Development organisations",
    body: "See where poverty, financial exclusion, poor nutrition and shocks overlap, to aim programmes at the districts that need them most.",
    href: "/vulnerability",
    linkLabel: "See where needs overlap",
  },
];

const JOURNEY: JourneyStep[] = [
  {
    name: "Data",
    body: `${SITE_FACTS.indicators} indicators transcribed from ${SITE_FACTS.publications} publications, each with its table and year.`,
  },
  {
    name: "Analysis",
    body: `All ${SITE_FACTS.districts} districts compared side by side, with confidence intervals where NISR publishes them.`,
  },
  {
    name: "Evidence",
    body: "Each figure labelled by how far to trust it, and every chart with a plain line on how to read it.",
  },
  {
    name: "Intervention",
    body: `${SITE_FACTS.levers} policy levers, each flagged district by district by one figure and a stated rule.`,
  },
  {
    name: "Impact",
    body: "Support aimed where needs overlap, and progress followed against Rwanda's 2030 targets.",
  },
];

/** About IMBONIX: why it exists, who benefits, and the method from data to impact. */
export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About IMBONIX"
        title="Evidence for financial inclusion and poverty reduction in Rwanda"
        intro={`An independent project that brings NISR's published statistics together for all ${SITE_FACTS.districts} districts and ${SITE_FACTS.sectors} sectors, and says how far to trust every figure. It is not an official NISR product.`}
      />
      <WhySection contributions={CONTRIBUTIONS} />
      <AudienceSection audiences={BENEFICIARIES} />
      <MethodologyJourney steps={JOURNEY} />
    </>
  );
}
