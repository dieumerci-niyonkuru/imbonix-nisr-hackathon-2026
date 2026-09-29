import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowUpIcon, CircleStackIcon, CodeBracketIcon, FlagIcon } from "@heroicons/react/24/solid";
import { StackedBrandLogo } from "@/components/layout/logo";
import { DATA_SECTION, NAV_GROUPS, NISR_CATALOG_URL, REPOSITORY_URL } from "@/components/layout/nav";

type FooterLink = { href: string; label: string; external?: boolean };
type FooterColumn = { heading: string; links: FooterLink[] };
type IconLink = { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; external: boolean };

const DATA_ISSUE_URL = `${REPOSITORY_URL}/issues/new?template=data_issue.md`;

/** One column per focus area, each opening with its overview, then the data and the project links. */
const COLUMNS: FooterColumn[] = [
  ...NAV_GROUPS.map((group) => ({
    heading: group.label,
    links: [{ href: group.href, label: "Overview" }, ...group.items.map((item) => ({ href: item.href, label: item.label }))],
  })),
  {
    heading: "Data and project",
    links: [
      { href: DATA_SECTION.href, label: DATA_SECTION.landingLabel },
      ...DATA_SECTION.items.map((item) => ({ href: item.href, label: item.label })),
      { href: "/about", label: "About IMBONIX" },
      { href: REPOSITORY_URL, label: "Source code", external: true },
      { href: `${REPOSITORY_URL}/blob/main/SECURITY.md`, label: "Security policy", external: true },
      { href: DATA_ISSUE_URL, label: "Report a data issue", external: true },
    ],
  },
];

/** The icon row in the bottom right, where a university footer puts its social links. */
const ICON_LINKS: IconLink[] = [
  { href: REPOSITORY_URL, label: "Source code", icon: CodeBracketIcon, external: true },
  { href: NISR_CATALOG_URL, label: "NISR microdata catalog", icon: CircleStackIcon, external: true },
  { href: DATA_ISSUE_URL, label: "Report a data issue", icon: FlagIcon, external: true },
  { href: "#main", label: "Back to top", icon: ArrowUpIcon, external: false },
];

const LINK_STYLE =
  "rounded text-[15px] leading-7 text-ink transition-colors hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink sm:text-[17px]";

function FooterAnchor({ link }: { link: FooterLink }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={LINK_STYLE}>
        {link.label}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={link.href} className={LINK_STYLE}>
      {link.label}
    </Link>
  );
}

/**
 * The site footer, in the site's two colours: a cyan band of link columns under headings in capitals, then a white
 * row with the copyright on the left, the stacked logo in the middle and a row of icon links on the right. Data and
 * map credits live beside the charts, on the map and on the methods page.
 */
export function SiteFooter() {
  return (
    <footer>
      <div className="bg-cyan text-ink">
        <nav aria-label="Footer" className="container-page grid grid-cols-2 gap-x-6 gap-y-12 py-16 sm:py-20 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h2 className="font-display text-[15px] font-bold uppercase tracking-[0.03em] text-ink sm:text-[18px]">
                {column.heading}
              </h2>
              <ul className="mt-5 space-y-3 sm:mt-6 sm:space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="bg-white">
        <div className="container-page grid items-center gap-8 py-10 md:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            aria-label="IMBONIX home"
            className="justify-self-center rounded-xl p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink md:order-2"
          >
            <StackedBrandLogo />
          </Link>

          <div className="text-center text-[15px] leading-7 text-muted sm:text-[16px] md:order-1 md:text-left">
            <p>Copyright © 2026 IMBONIX team.</p>
            <p>Built on NISR data. Not an official NISR product.</p>
          </div>

          <ul className="flex items-center justify-center gap-4 sm:gap-6 md:order-3 md:justify-end">
            {ICON_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  title={link.label}
                  {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-ink transition-colors hover:bg-cyan-soft hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                >
                  <link.icon className="h-8 w-8" aria-hidden="true" />
                  <span className="sr-only">
                    {link.label}
                    {link.external ? " (opens in a new tab)" : ""}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
