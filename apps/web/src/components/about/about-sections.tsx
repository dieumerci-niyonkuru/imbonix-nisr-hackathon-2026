import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowRightIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { NAV_GROUPS } from "@/components/layout/nav";

/** The heading block every About section opens with: a short label, the heading and one paragraph. */
function SectionIntro({ eyebrow, title, id, children }: { eyebrow: string; title: string; id: string; children?: ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow text-cyan-ink">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-balance font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl">
        {title}
      </h2>
      {children && (
        <div className="mt-4 text-pretty text-[16px] leading-7 text-muted sm:text-[17px] sm:leading-8">{children}</div>
      )}
    </div>
  );
}

/** One line of the overview table, and one count beside it. */
export type OverviewRow = { term: string; detail: string };
export type OverviewTile = { value: string; label: string };

/** IMBONIX in brief, as on the government's About pages: a table of facts beside a grid of counts. */
export function AboutOverview({ lead, rows, tiles }: { lead: string; rows: OverviewRow[]; tiles: OverviewTile[] }) {
  return (
    <section id="overview" className="scroll-mt-36 bg-white py-14 sm:py-20" aria-labelledby="overview-heading">
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div>
          <h2 id="overview-heading" className="font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl">
            Overview
          </h2>
          <p className="mt-5 text-pretty text-[16px] leading-8 text-ink/85 sm:text-[17px]">{lead}</p>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {rows.map((row) => (
              <div key={row.term} className="grid gap-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
                <dt className="text-[16px] font-bold text-ink">{row.term}</dt>
                <dd className="text-pretty text-[16px] leading-7 text-ink/80">{row.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
        <dl className="grid grid-cols-2 content-start border-l border-t border-line">
          {tiles.map((tile) => (
            <div key={tile.label} className="flex flex-col border-b border-r border-line px-5 py-6 sm:px-7 sm:py-8">
              <dt className="order-2 mt-2 text-pretty text-[14.5px] leading-5 text-ink">{tile.label}</dt>
              <dd className="order-1 font-display text-[32px] font-bold leading-none tracking-[-0.02em] text-cyan-ink sm:text-[38px]">
                {tile.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/**
 * A guide to the site: one column per focus area, each listing its pages with what they answer, so a first time
 * visitor can go straight to the page for their question.
 */
export function ToolGuide() {
  return (
    <section id="tools" className="scroll-mt-36 bg-white py-16 sm:py-24" aria-labelledby="tools-heading">
      <div className="container-page">
        <SectionIntro eyebrow="Using IMBONIX" title="What you can do here" id="tools-heading">
          Every page answers one question. Start from the focus area that matches yours, or search any place, indicator or chart
          from the bar at the top of every page.
        </SectionIntro>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.focusId} className="flex flex-col border border-t-4 border-line border-t-cyan bg-white p-6 sm:p-7">
              <h3 className="font-display text-[21px] font-bold tracking-[-0.01em] text-ink">{group.label}</h3>
              <p className="mt-2 text-pretty text-[15px] leading-6 text-muted">{group.intro}</p>
              <ul className="mt-5 divide-y divide-line border-t border-line">
                {[{ href: group.href, label: "Overview", description: "The key evidence on one page" }, ...group.items].map(
                  (item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex items-start justify-between gap-4 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-ink"
                      >
                        <span className="min-w-0">
                          <span className="block text-[15.5px] font-bold text-ink group-hover:text-cyan-ink">{item.label}</span>
                          <span className="mt-0.5 block text-pretty text-[14px] leading-6 text-muted">{item.description}</span>
                        </span>
                        <ArrowRightIcon
                          className="mt-1 h-4 w-4 shrink-0 text-cyan-ink transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** One publication behind the figures, with how many indicators it gives and on which topics. */
export type SourceRow = { publication: string; year: string; topics: string; indicators: number; catalogUrl?: string };

/** The publications behind every figure, counted from the site's own data. */
export function SourcesTable({ rows, intro }: { rows: SourceRow[]; intro: ReactNode }) {
  return (
    <section id="sources" className="scroll-mt-36 border-t border-line bg-white py-16 sm:py-24" aria-labelledby="sources-heading">
      <div className="container-page">
        <SectionIntro eyebrow="The evidence" title="The publications behind every figure" id="sources-heading">
          {intro}
        </SectionIntro>
        <div className="scrollbar-thin mt-10 overflow-x-auto border border-line">
          <table className="w-full min-w-[680px] text-left text-[14.5px]">
            <caption className="sr-only">
              Publications, their year, topics and the number of district indicators each gives
            </caption>
            <thead className="bg-paper text-[13px] text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Publication
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Year
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Topics
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Indicators
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.publication} className="border-t border-line align-top">
                  <th scope="row" className="px-5 py-3.5 font-semibold text-ink">
                    {row.publication}
                    {row.catalogUrl && (
                      <a
                        href={row.catalogUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex w-fit items-center gap-1 rounded text-[13px] font-semibold text-cyan-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                      >
                        In the NISR microdata catalog
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                  </th>
                  <td className="tabular px-5 py-3.5 text-ink/85">{row.year}</td>
                  <td className="px-5 py-3.5 text-ink/85">{row.topics}</td>
                  <td className="tabular px-5 py-3.5 text-right font-bold text-ink">{row.indicators}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          href="/data"
          className="group mt-6 inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-ink underline-offset-4 hover:text-cyan-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
        >
          See every indicator with its table and year
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

/** A short statement with a heading, used for the principles and the limits. */
export type Statement = { title: string; body: ReactNode };

/** How IMBONIX works with the evidence: numbered principles in a ruled grid. */
export function Principles({ items }: { items: Statement[] }) {
  return (
    <section id="principles" className="scroll-mt-36 bg-paper py-16 sm:py-24" aria-labelledby="principles-heading">
      <div className="container-page">
        <SectionIntro eyebrow="How we work" title="Principles" id="principles-heading">
          The rules every page follows, so that anyone can check what they read and use it with confidence.
        </SectionIntro>
        <ol className="mt-10 grid border-l border-t border-line bg-white md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.title} className="border-b border-r border-line px-6 py-7 sm:px-8 sm:py-9">
              <p className="font-display text-[15px] font-bold text-cyan-ink">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-display text-[20px] font-bold tracking-[-0.01em] text-ink">{item.title}</h3>
              <div className="mt-2 text-pretty text-[15px] leading-7 text-muted">{item.body}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** What the evidence cannot yet say, stated plainly. */
export function Limits({ items }: { items: Statement[] }) {
  return (
    <section id="limits" className="scroll-mt-36 bg-white py-16 sm:py-24" aria-labelledby="limits-heading">
      <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <SectionIntro eyebrow="Read with care" title="What IMBONIX cannot tell you yet" id="limits-heading">
          Published tables answer many questions, but not all. These are the limits to keep in mind.
        </SectionIntro>
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.title} className="grid gap-1 py-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-8">
              <h3 className="text-[16px] font-bold text-ink">{item.title}</h3>
              <div className="text-pretty text-[15.5px] leading-7 text-ink/80">{item.body}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** One way to reach the project or its sources. */
export type ContactLink = {
  title: string;
  body: string;
  href: string;
  linkLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/** Ways to reach the project, report a problem or go to the sources. */
export function ContactSection({ links }: { links: ContactLink[] }) {
  return (
    <section id="contact" className="scroll-mt-36 bg-paper py-16 text-ink sm:py-24" aria-labelledby="contact-heading">
      <div className="container-page">
        <div className="max-w-3xl">
          <p className="eyebrow text-cyan-ink">Get in touch</p>
          <h2 id="contact-heading" className="mt-3 text-balance font-display text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
            Found something to fix, or want to build on it?
          </h2>
          <p className="mt-4 text-pretty text-[16px] leading-7 text-muted sm:text-[17px] sm:leading-8">
            IMBONIX is open. Tell us when a figure does not match its source, reuse the code and data, or go straight to the NISR
            studies behind the figures.
          </p>
        </div>
        <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <li key={link.title} className="bg-white">
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-ink sm:p-7"
              >
                <link.icon className="h-7 w-7 text-cyan-ink" aria-hidden="true" />
                <h3 className="mt-4 font-display text-[19px] font-bold text-ink">{link.title}</h3>
                <p className="mt-2 text-pretty text-[14.5px] leading-6 text-muted">{link.body}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[14px] font-bold text-ink group-hover:text-cyan-ink">
                  {link.linkLabel}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
