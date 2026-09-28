import type { Metadata } from "next";
import { AudienceSection, type Audience } from "@/components/home/audience-section";
import { MethodologyJourney, type JourneyStep } from "@/components/home/methodology-journey";
import { WhySection, type Contribution } from "@/components/home/why-section";
import { ReadMoreSection } from "@/components/ui/read-more";
import { PageHero } from "@/components/ui/section";
import { STATUS_DESCRIPTION } from "@/components/ui/status-badge";
import { STATUS_LABEL } from "@/lib/format";
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
    details: (
      <>
        <ReadMoreSection title="Where the figures come from">
          <p>
            Every figure is transcribed from a named table in a report NISR or its partners published: EICV7, FinScope, the DHS,
            the CFSVA, the Labour Force Survey, the 2022 census and the Establishment Census, with the VUP thematic report, the
            Statistical Yearbook and the population projections.
          </p>
        </ReadMoreSection>
        <ReadMoreSection title="What is kept with each figure">
          <p>
            Its publication, table, year and trust label, and, where the report publishes them, its standard error and confidence
            interval.
          </p>
        </ReadMoreSection>
        <ReadMoreSection title="Repeatable">
          <p>
            Scripts in the repository download the public files, extract the tables and rebuild the site&apos;s data, and
            automated checks rerun them. Microdata is never committed or published.
          </p>
        </ReadMoreSection>
      </>
    ),
  },
  {
    name: "Analysis",
    body: `All ${SITE_FACTS.districts} districts compared side by side, with confidence intervals where NISR publishes them.`,
    details: (
      <>
        <ReadMoreSection title="Ranks">
          <p>
            Districts are ranked on each measure, 1 being the most affected of the 30. Where confidence intervals overlap, two
            districts may not really differ.
          </p>
        </ReadMoreSection>
        <ReadMoreSection title="Province and national figures">
          <p>
            Where NISR publishes a national figure, it is used. Otherwise province and national figures are weighted from the
            district figures, by population or by adults, and labelled as calculations.
          </p>
        </ReadMoreSection>
        <ReadMoreSection title="Sectors">
          <p>
            Sector poverty rates are NISR small area estimates, a model. They are compared within a district, not across the
            country.
          </p>
        </ReadMoreSection>
      </>
    ),
  },
  {
    name: "Evidence",
    body: "Each figure labelled by how far to trust it, and every chart with a plain line on how to read it.",
    details: (
      <ReadMoreSection title="The six trust labels">
        <dl className="grid gap-2">
          {Object.entries(STATUS_LABEL).map(([status, label]) => (
            <div key={status}>
              <dt className="inline font-semibold text-ink">{label}: </dt>
              <dd className="inline">{STATUS_DESCRIPTION[status]}</dd>
            </div>
          ))}
        </dl>
      </ReadMoreSection>
    ),
  },
  {
    name: "Intervention",
    body: `${SITE_FACTS.levers} policy levers, each flagged district by district by one figure and a stated rule.`,
    details: (
      <>
        <ReadMoreSection title="Policy levers">
          <p>
            A lever flags a district when one published figure puts it among the 10 most affected of the 30, for example the
            poverty rate for income support. Each lever names the programmes that already exist for it.
          </p>
        </ReadMoreSection>
        <ReadMoreSection title="Priority">
          <p>
            A district is a high priority when it is among the 10 most affected on at least 2 of the 4 core dimensions (poverty,
            financial access, child stunting, natural hazards), moderate on 1 and lower on none.
          </p>
        </ReadMoreSection>
        <ReadMoreSection title="What they are not">
          <p>Flags and priorities point to where to look first. They are not budgets, eligibility rules or forecasts.</p>
        </ReadMoreSection>
      </>
    ),
  },
  {
    name: "Impact",
    body: "Support aimed where needs overlap, and progress followed against Rwanda's 2030 targets.",
    details: (
      <>
        <ReadMoreSection title="What IMBONIX does">
          <p>
            It shows where needs overlap so support can be aimed there, and follows progress against the targets in the National
            Financial Inclusion Roadmap 2025 to 2030, NST2 and the Social Protection Sector Strategic Plan, each shown with its
            baseline.
          </p>
        </ReadMoreSection>
        <ReadMoreSection title="What it does not do">
          <p>
            It does not measure the impact of any programme: that needs household microdata over time and a comparison group.
            Everything on the site describes places and groups, and relationships are associations, not causes.
          </p>
        </ReadMoreSection>
      </>
    ),
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
