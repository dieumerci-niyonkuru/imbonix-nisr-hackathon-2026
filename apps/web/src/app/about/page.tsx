import type { Metadata } from "next";
import { CircleStackIcon, CodeBracketIcon, FlagIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import {
  AboutOverview,
  ContactSection,
  Limits,
  Principles,
  SourcesTable,
  ToolGuide,
  type ContactLink,
  type OverviewRow,
  type OverviewTile,
  type SourceRow,
  type Statement,
} from "@/components/about/about-sections";
import { AudienceSection, type Audience } from "@/components/home/audience-section";
import { MethodologyJourney, type JourneyStep } from "@/components/home/methodology-journey";
import { WhySection, type Contribution } from "@/components/home/why-section";
import { ReadMoreSection } from "@/components/ui/read-more";
import { PageHero } from "@/components/ui/section";
import { SectionNav, type PageSection } from "@/components/ui/section-nav";
import { STATUS_DESCRIPTION } from "@/components/ui/status-badge";
import { NISR_CATALOG_URL, REPOSITORY_URL, SOURCE_STUDIES } from "@/components/layout/nav";
import { SOURCES } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/format";
import { DIMENSIONS, INDICATORS, MAP_LAYERS } from "@/lib/indicators";
import { OWN_CALCULATION, SITE_FACTS } from "@/lib/site-facts";

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
    href: "/social-protection/vup-payments",
    linkLabel: "See how VUP support arrives",
  },
  {
    title: "Policymakers",
    body: `${SITE_FACTS.levers} policy levers, each flagged district by district by one published figure and a rule anyone can check.`,
    href: "/social-protection/where-to-act-first",
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
    href: "/poverty-dynamics/where-needs-overlap",
    linkLabel: "See where needs overlap",
  },
];

const JOURNEY: JourneyStep[] = [
  {
    name: "Data",
    body: `${SITE_FACTS.indicators} indicators from ${SITE_FACTS.publications} publications, each with its table and year: ${SITE_FACTS.indicators - SITE_FACTS.calculated} as published, ${SITE_FACTS.calculated} calculated from them.`,
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

/** The sections of the page, in order, for the menu under the header. */
const SECTIONS: PageSection[] = [
  { id: "overview", label: "Overview" },
  { id: "why", label: "Why IMBONIX" },
  { id: "tools", label: "What you can do" },
  { id: "who-benefits", label: "Who benefits" },
  { id: "method", label: "Method" },
  { id: "sources", label: "Sources" },
  { id: "principles", label: "Principles" },
  { id: "limits", label: "Limits" },
  { id: "contact", label: "Contact" },
];

/** IMBONIX in brief, as a two column table of facts. */
const OVERVIEW: OverviewRow[] = [
  { term: "Name", detail: "IMBONIX: Data for Inclusive Prosperity" },
  {
    term: "Purpose",
    detail:
      "To understand financial exclusion, poverty dynamics and the impact of social protection programmes in Rwanda, and to show where support is needed most.",
  },
  {
    term: "Evidence",
    detail: `${SITE_FACTS.indicators} district indicators from ${SITE_FACTS.publications} NISR and partner publications, including EICV7, FinScope, the Rwanda DHS and the 2022 census.`,
  },
  {
    term: "Coverage",
    detail: `All ${SITE_FACTS.districts} districts and ${SITE_FACTS.sectors} sectors, with a search for ${SITE_FACTS.cells.toLocaleString("en-US")} cells and ${SITE_FACTS.villages.toLocaleString("en-US")} villages.`,
  },
  { term: "Built for", detail: "Vulnerable households and those who serve them, policymakers, researchers and civil society." },
  {
    term: "Status",
    detail: "Independent and open source. Not an official NISR product. Built on published tables; microdata is never published.",
  },
];

const TILES: OverviewTile[] = [
  { value: String(SITE_FACTS.districts), label: "Districts" },
  { value: String(SITE_FACTS.sectors), label: "Sectors" },
  { value: SITE_FACTS.cells.toLocaleString("en-US"), label: "Cells" },
  { value: SITE_FACTS.villages.toLocaleString("en-US"), label: "Villages" },
  { value: String(SITE_FACTS.indicators), label: "District indicators" },
  { value: String(SITE_FACTS.publications), label: "Publications" },
  { value: String(MAP_LAYERS.length), label: "Map measures" },
  { value: String(SITE_FACTS.levers), label: "Policy levers" },
];

/** Each study in the NISR microdata catalog, found by a word its publication title contains. */
const CATALOG_MATCH: [RegExp, string][] = [
  [/EICV7/, "EICV7 2023/24"],
  [/FinScope 2024/, "FinScope 2024"],
  [/DHS 2025/, "DHS 2025"],
  [/CFSVA/, "CFSVA 2024"],
  [/RPHC5/, "Census 2022"],
  [/LFS 2025/, "LFS 2025"],
  [/Establishment Census/, "Establishment Census 2023"],
];

/** The publications behind the figures, worked out from the data: years, topics and how many indicators each gives. */
function sourceRows(): SourceRow[] {
  const dimensionOf = Object.fromEntries(INDICATORS.map((indicator) => [indicator.id, indicator.dimension]));
  const byPublication = new Map<string, { years: Set<string>; topics: Set<string>; indicators: number }>();
  for (const [id, source] of Object.entries(SOURCES)) {
    if (source.source === OWN_CALCULATION) continue;
    const entry = byPublication.get(source.source) ?? { years: new Set<string>(), topics: new Set<string>(), indicators: 0 };
    entry.years.add(source.year);
    const dimension = dimensionOf[id];
    if (dimension) entry.topics.add(DIMENSIONS[dimension].label);
    entry.indicators += 1;
    byPublication.set(source.source, entry);
  }
  return [...byPublication.entries()]
    .map(([publication, entry]) => {
      const study = CATALOG_MATCH.find(([pattern]) => pattern.test(publication))?.[1];
      const studyId = SOURCE_STUDIES.find((item) => item.label === study)?.studyId;
      return {
        publication,
        year: [...entry.years].sort().join(", "),
        topics: [...entry.topics].join(", "),
        indicators: entry.indicators,
        catalogUrl: studyId ? `${NISR_CATALOG_URL}/${studyId}` : undefined,
      };
    })
    .sort((first, second) => second.indicators - first.indicators || first.publication.localeCompare(second.publication));
}

const PRINCIPLES: Statement[] = [
  {
    title: "Published figures only",
    body: "Every figure comes from a named table in a report NISR or its partners published. Nothing is typed in to fill a gap or estimated without saying so.",
  },
  {
    title: "Labelled for trust",
    body: "Each value carries one of six labels: official estimate, IMBONIX calculation, model estimate, projection, scenario or policy target, with its source, table and year.",
  },
  {
    title: "Describes, does not explain",
    body: "Charts and ranks show where needs are and how they move together. They are associations, not causes, and they do not measure the impact of any programme.",
  },
  {
    title: "Places, not people",
    body: "IMBONIX describes districts and sectors. It never scores, ranks or selects households or individuals, and it never publishes microdata.",
  },
  {
    title: "Open and repeatable",
    body: "The code, the data scripts and the checks are public. Anyone can download the same NISR files, rebuild every figure and compare.",
  },
  {
    title: "Independent",
    body: "IMBONIX is not an official NISR product. The statistics are NISR's and its partners'; any error in using them is ours, and can be reported.",
  },
];

const LIMITS: Statement[] = [
  {
    title: "Programme impact",
    body: "Measuring what VUP or any programme changes needs household microdata over time and a comparison group. The household analysis waits for NISR microdata access.",
  },
  {
    title: "Different years",
    body: "The figures come from surveys and censuses run between 2019/20 and 2025. Each figure shows its year, and figures from different years are not combined as if they were one moment.",
  },
  {
    title: "Sector estimates",
    body: "Sector poverty rates are NISR small area estimates, a model. Use them to compare sectors within a district, not across the country.",
  },
  {
    title: "Cells and villages",
    body: "NISR does not publish figures for single cells or villages, so a cell or village shows the figures of its sector. The list of cells and villages follows the 2012 boundaries.",
  },
  {
    title: "Close ranks",
    body: "Survey figures for districts carry sampling error. Where confidence intervals overlap, two districts may not really differ, however their ranks look.",
  },
];

const CONTACT_LINKS: ContactLink[] = [
  {
    title: "Report a data issue",
    body: "A figure that does not match its published table, a broken link or a chart that is hard to read.",
    href: `${REPOSITORY_URL}/issues/new?template=data_issue.md`,
    linkLabel: "Open an issue",
    icon: FlagIcon,
  },
  {
    title: "Source code",
    body: "The website, the API and the scripts that download and rebuild the data, open for review and reuse.",
    href: REPOSITORY_URL,
    linkLabel: "View the repository",
    icon: CodeBracketIcon,
  },
  {
    title: "NISR microdata catalog",
    body: "The surveys and censuses behind the figures, with their questionnaires, reports and access rules.",
    href: NISR_CATALOG_URL,
    linkLabel: "Open the catalog",
    icon: CircleStackIcon,
  },
  {
    title: "Security policy",
    body: "How to report a security problem privately, and how it will be handled.",
    href: `${REPOSITORY_URL}/blob/main/SECURITY.md`,
    linkLabel: "Read the policy",
    icon: ShieldCheckIcon,
  },
];

/**
 * About IMBONIX, set like the government's About pages: a menu of the page's sections under the header, then an
 * overview, why it exists, what you can do on the site, who benefits, the method, the sources, the principles, the
 * limits and how to get in touch.
 */
export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About IMBONIX"
        title="Evidence for financial inclusion and poverty reduction in Rwanda"
        intro={`An independent project that brings NISR's published statistics together for all ${SITE_FACTS.districts} districts and ${SITE_FACTS.sectors} sectors, and says how far to trust every figure. It is not an official NISR product.`}
      />
      <SectionNav label="About" sections={SECTIONS} />
      <AboutOverview
        lead="IMBONIX is an independent evidence platform for Rwanda. It brings NISR's published figures on financial inclusion, poverty, nutrition, shocks and social protection together for every district, says how far to trust each one, and turns them into clear starting points for action."
        rows={OVERVIEW}
        tiles={TILES}
      />
      <div id="why" className="scroll-mt-36">
        <WhySection contributions={CONTRIBUTIONS} />
      </div>
      <ToolGuide />
      <div id="who-benefits" className="scroll-mt-36">
        <AudienceSection audiences={BENEFICIARIES} />
      </div>
      <div id="method" className="scroll-mt-36">
        <MethodologyJourney steps={JOURNEY} />
      </div>
      <SourcesTable
        rows={sourceRows()}
        intro={`${SITE_FACTS.indicators} district indicators come from ${SITE_FACTS.publications} publications by NISR and its partners. ${SITE_FACTS.calculated} of them are IMBONIX arithmetic on those published figures, such as a rate multiplied by a population, and are labelled as calculations.`}
      />
      <Principles items={PRINCIPLES} />
      <Limits items={LIMITS} />
      <ContactSection links={CONTACT_LINKS} />
    </>
  );
}
