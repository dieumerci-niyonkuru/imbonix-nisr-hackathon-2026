import type { Metadata } from "next";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { NISR_CATALOG_URL } from "@/components/layout/nav";
import { Callout, SectionHeader } from "@/components/ui/section";
import { STATUS_DESCRIPTION, StatusBadge } from "@/components/ui/status-badge";
import { SOURCES } from "@/lib/data";
import { DIMENSIONS, INDICATORS, type Dimension } from "@/lib/indicators";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BarsMotif, HeroRings } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Data & methods",
  description:
    "Every source behind IMBONIX, how values are labelled, the datasets still to request from NISR, and the caveats that matter.",
};

const MICRODATA = [
  {
    priority: 1,
    id: 120,
    name: "FinScope 2024",
    unlocks: "Financial health, usage and barriers for 13,994 adults, with a district code and Ubudehe category",
  },
  {
    priority: 1,
    id: 119,
    name: "EICV7 2023/24 cross-section",
    unlocks: "Household poverty, savings, credit and VUP delays, district-representative",
  },
  {
    priority: 1,
    id: 121,
    name: "EICV7 2023/24 VUP sample",
    unlocks: "Delivery of each VUP programme: delays for the last three payments, channel, entitlement",
  },
  {
    priority: 2,
    id: 109,
    name: "Census 2022 public sample (10%)",
    unlocks: "Sector-level digital readiness, insurance and disability; covariates for sector estimates",
  },
  {
    priority: 2,
    id: 89,
    name: "FinScope 2020",
    unlocks: "A like-for-like 2020 to 2024 district trend (the published 2020 district figure is not comparable)",
  },
  { priority: 2, id: 126, name: "DHS 2025", unlocks: "Women's and men's account and mobile-money use by district and wealth" },
  { priority: 2, id: 122, name: "CFSVA 2024", unlocks: "Shocks, coping and VUP coverage by district" },
];

const PUBLISHED = [
  {
    name: "EICV7 Main Indicators tables (district annexes with standard errors)",
    url: "https://statistics.gov.rw/sites/default/files/documents/2025-04/EICV7_Tables_MainIndicatorReport.xlsx",
  },
  {
    name: "EICV7 VUP thematic report and tables",
    url: "https://statistics.gov.rw/sites/default/files/documents/2025-07/Final_EICV7_VUP_Thematic_Report_Tables.xlsx",
  },
  {
    name: "EICV7 district presentations (sector poverty maps)",
    url: "https://statistics.gov.rw/data-sources/surveys/EICV/integrated-household-living-conditions-survey-7-eicv-7/eicv7-district-disseminations-powerpoint",
  },
  {
    name: "FinScope 2024 report",
    url: "https://statistics.gov.rw/sites/default/files/documents/2024-09/Rwanda-Finscope-2024-Report_compressed.pdf",
  },
  { name: "FinScope 2020 main report", url: "https://microdata.statistics.gov.rw/index.php/catalog/89/download/832" },
  { name: "Rwanda DHS 2025 final report", url: "https://microdata.statistics.gov.rw/index.php/catalog/126/download/1133" },
  {
    name: "CFSVA 2024 report (WFP, MINAGRI, NISR)",
    url: "https://statistics.gov.rw/sites/default/files/documents/2025-07/Rwanda%20CFSVA%202024.pdf",
  },
  {
    name: "Census 2022 (RPHC5) Main Indicators and Non-Monetary Poverty tables",
    url: "https://statistics.gov.rw/sites/default/files/documents/2025-02/PHC5-2022_Main_Indicators.xlsx",
  },
  {
    name: "Labour Force Survey 2025 annual tables and standard errors",
    url: "https://statistics.gov.rw/sites/default/files/documents/2026-05/RWLFS_Annual_Tables_LFS2025.xlsx",
  },
  {
    name: "Establishment Census 2023 tables",
    url: "https://statistics.gov.rw/data-sources/censuses/Establishment-Census/establishment-census-2023",
  },
  {
    name: "Rwanda Statistical Yearbook 2025 (RSSB, Mutuelle)",
    url: "https://statistics.gov.rw/sites/default/files/documents/2026-01/Rwanda_Statistical_Yearbook_2025.xlsx",
  },
  {
    name: "NISR subnational population projections 2023–2032",
    url: "https://statistics.gov.rw/district-statistics/southern-province",
  },
  {
    name: "EICV4 (2013/14) and EICV5 (2016/17) VUP reports",
    url: "https://microdata.statistics.gov.rw/index.php/catalog/85/download/802",
  },
  {
    name: "District and sector boundaries: geoBoundaries, from NISR open geodata (CC BY 4.0)",
    url: "https://www.geoboundaries.org/",
  },
];

const CAVEATS = [
  {
    title: "Comparisons describe districts, not households",
    body: "Correlations and quadrants on this site compare district averages from different surveys and years. They cannot say what happens inside a household.",
  },
  {
    title: "Sector poverty rates are model estimates",
    body: "NISR's sector poverty rates come from small-area estimation. They are not adjusted to the district survey figures (the gap is up to 14 points), so use them to compare sectors within a district.",
  },
  {
    title: "FinScope 2020 and 2024 'banked' are not the same",
    body: "The 2020 district figure counts over-the-counter users without their own account (36% nationally); 2024 counts own accounts only (22%). Side by side they would show a false collapse, so IMBONIX never plots one against the other.",
  },
  {
    title: "Some values were read from report charts",
    body: "FinScope district figures, sector poverty rates and CFSVA food consumption were read from labelled charts. CFSVA hazard exposure was measured from an unlabelled chart and checked against 11 values quoted in the report (largest difference 0.7 points).",
  },
  {
    title: "Surveys define inclusion differently",
    body: "FinScope (adults 16+) counts any formal or informal product; DHS (ages 15–49) asks about personal, active use in the past year. Each is labelled with its own definition.",
  },
  {
    title: "Nothing here is causal or an eligibility tool",
    body: "IMBONIX supports decisions about places and programmes. It does not score households, and it does not claim that any programme caused an outcome.",
  },
];

export default function DataPage() {
  const grouped = (Object.keys(DIMENSIONS) as Dimension[]).map((dimension) => ({
    dimension,
    items: INDICATORS.filter((i) => i.dimension === dimension && SOURCES[i.id]),
  }));

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <HeroRings className="-right-24 -top-32 text-white/[0.08]" />
        <div className="container-page relative pb-14 pt-6 sm:pb-16 sm:pt-8">
          <Breadcrumbs tone="dark" />
          <p className="eyebrow mt-10 flex items-center gap-2.5 text-cyan sm:mt-12">
            <BarsMotif /> Data &amp; methods
          </p>
          <h1 className="mt-3 max-w-4xl text-balance font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
            Every number, where it comes from, and how far to trust it
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            All NISR publicly available datasets can be found in the NISR microdata catalog. IMBONIX currently uses published
            tables and reports. Household-level analysis starts once the team&apos;s data requests are approved.
          </p>
          <Button asChild variant="sun" className="mt-8">
            <a href={NISR_CATALOG_URL} target="_blank" rel="noreferrer">
              Open the NISR microdata catalog <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Microdata to request */}
      <section className="container-page py-14">
        <SectionHeader
          eyebrow="Microdata"
          title="Microdata the team needs from NISR"
          intro="Each study needs a free account and its own request on the NISR catalog. The first three power the core analysis; the next four add sectors, trends, gender and shocks."
        />
        <ScrollArea
          label="Microdata studies to request (scrolls sideways)"
          className="mt-8 rounded-2xl border border-line bg-white"
        >
          <table className="w-full min-w-[720px] text-left text-[13.5px]">
            <thead className="bg-paper text-[11px] uppercase tracking-[0.08em] text-muted">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Priority
                </th>
                <th scope="col" className="px-4 py-3">
                  Dataset
                </th>
                <th scope="col" className="px-4 py-3">
                  Catalog ID
                </th>
                <th scope="col" className="px-4 py-3">
                  What it unlocks
                </th>
              </tr>
            </thead>
            <tbody>
              {MICRODATA.map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${m.priority === 1 ? "bg-navy-900 text-white" : "bg-paper text-ink"}`}
                    >
                      {m.priority === 1 ? "First" : "Next"}
                    </span>
                  </td>
                  <th scope="row" className="px-4 py-3 font-semibold text-ink">
                    {m.name}
                  </th>
                  <td className="px-4 py-3">
                    <a
                      href={`https://microdata.statistics.gov.rw/index.php/catalog/${m.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="link tabular inline-flex items-center gap-1"
                    >
                      {m.id}
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted">{m.unlocks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </section>

      {/* Status labels */}
      <section className="border-y border-line bg-white py-14">
        <div className="container-page">
          <SectionHeader
            eyebrow="Labels"
            title="Every value carries a label"
            intro="The label tells you who produced the number and how much weight it can bear."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(STATUS_DESCRIPTION).map(([status, text]) => (
              <div key={status} className="rounded-2xl border border-line p-5">
                <StatusBadge status={status} />
                <p className="mt-3 text-[14px] leading-6 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Caveats */}
      <section className="container-page py-14">
        <SectionHeader eyebrow="Read before using" title="Caveats that matter" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CAVEATS.map((c) => (
            <Callout key={c.title} title={c.title} tone={c.title.startsWith("FinScope") ? "warn" : "info"}>
              {c.body}
            </Callout>
          ))}
        </div>
      </section>

      {/* Indicator catalogue */}
      <section className="border-y border-line bg-white py-14">
        <div className="container-page">
          <SectionHeader
            eyebrow="Indicator catalogue"
            title={`All ${INDICATORS.filter((i) => SOURCES[i.id]).length} district indicators`}
            intro="Grouped by dimension, with the exact table, year and label for each. The same list drives the map and the district profiles."
          />
          <div className="mt-8 space-y-8">
            {grouped
              .filter((g) => g.items.length)
              .map((g) => (
                <div key={g.dimension}>
                  <p className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                    <span className="h-3 w-3 rounded-full" style={{ background: DIMENSIONS[g.dimension].accent }} />
                    {DIMENSIONS[g.dimension].label}
                  </p>
                  <ScrollArea
                    label={`${DIMENSIONS[g.dimension].label} indicators (scrolls sideways)`}
                    className="mt-3 rounded-2xl border border-line"
                  >
                    <table className="w-full min-w-[760px] text-left text-[12.5px]">
                      <thead className="bg-paper text-[10.5px] uppercase tracking-[0.08em] text-muted">
                        <tr>
                          <th scope="col" className="w-[30%] px-4 py-2.5">
                            Indicator
                          </th>
                          <th scope="col" className="px-4 py-2.5">
                            Unit
                          </th>
                          <th scope="col" className="px-4 py-2.5">
                            Year
                          </th>
                          <th scope="col" className="px-4 py-2.5">
                            Source and table
                          </th>
                          <th scope="col" className="px-4 py-2.5">
                            Label
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.items.map((i) => {
                          const s = SOURCES[i.id];
                          return (
                            <tr key={i.id} className="border-t border-line align-top">
                              <th scope="row" className="px-4 py-2.5 font-semibold text-ink">
                                {i.short}
                                <span className="mt-0.5 block font-mono text-[10.5px] font-normal text-muted">{i.id}</span>
                              </th>
                              <td className="px-4 py-2.5 text-muted">{s.unit}</td>
                              <td className="tabular px-4 py-2.5 text-muted">{s.year}</td>
                              <td className="px-4 py-2.5 text-muted">
                                {s.source} · {s.table}
                              </td>
                              <td className="px-4 py-2.5">
                                <StatusBadge status={s.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Sources and independence */}
      <section className="container-page grid gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <SectionHeader eyebrow="Published sources" title="Reports and tables used on this site" />
          <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
            {PUBLISHED.map((p) => (
              <li key={p.name}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 px-5 py-3.5 text-[14px] text-ink transition-colors hover:bg-paper"
                >
                  {p.name}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0 text-muted" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <SectionHeader eyebrow="About this project" title="Independent, and open about how it was built" />
          <Callout title="Independence">
            IMBONIX is a team entry to the NISR 2026 Big Data Hackathon (Track 2: Financial Inclusion &amp; Poverty Reduction). It
            is not an official NISR product and does not imply NISR endorsement. Statistics remain the work of NISR and its
            partners.
          </Callout>
          <Callout title="AI assistance">
            The team used an AI assistant for research, data extraction and coding. The team is responsible for checking every
            figure against its published source.
          </Callout>
          <Callout title="Reproducible">
            Scripts in the project repository download the public files, extract the tables and rebuild this site&apos;s data.
            Microdata is never committed or published.
          </Callout>
        </div>
      </section>
    </>
  );
}
