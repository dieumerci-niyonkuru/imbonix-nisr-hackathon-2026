import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowUpIcon, CircleStackIcon, CodeBracketIcon, FlagIcon } from "@heroicons/react/24/solid";
import { StackedBrandLogo } from "@/components/layout/logo";
import { NAV_GROUPS, NISR_CATALOG_URL, REPOSITORY_URL } from "@/components/layout/nav";

type FooterLink = { href: string; label: string; external?: boolean };
type FooterColumn = { heading: string; links: FooterLink[] };
type IconLink = { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; external: boolean };

const DATA_ISSUE_URL = `${REPOSITORY_URL}/issues/new?template=data_issue.md`;

/** One column per focus area, each opening with its page at a glance, then the project links. */
const COLUMNS: FooterColumn[] = [
  ...NAV_GROUPS.map((group) => ({
    heading: group.label,
    links: [
      { href: `/focus/${group.focusId}`, label: "At a glance" },
      ...group.items.map((item) => ({ href: item.href, label: item.label })),
    ],
  })),
  {
    heading: "Project",
    links: [
      { href: "/data", label: "Data & methods" },
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
  "rounded text-[15px] leading-7 text-white/65 transition-colors hover:text-white hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan sm:text-[18px]";

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
 * The site footer, laid out like a university footer: centred link columns with large bold headings, then a bottom
 * row with the copyright on the left, the stacked logo straight on the dark background in the middle and a row of
 * icon links on the right. Data and map credits live beside the charts, on the map and on the methods page.
 */
export function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="container-page pb-12 pt-16 sm:pb-14 sm:pt-20">
        <nav aria-label="Footer" className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-12 text-center lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h2 className="font-display text-[16px] font-bold text-white sm:text-[21px]">{column.heading}</h2>
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

        <div className="mt-20 grid items-end gap-10 sm:mt-24 md:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            aria-label="IMBONIX home"
            className="justify-self-center rounded-xl p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan md:order-2"
          >
            <StackedBrandLogo />
          </Link>

          <div className="pb-2 text-center text-[15px] leading-7 text-white/65 sm:text-[18px] sm:leading-8 md:order-1 md:text-left">
            <p>Copyright © 2026 IMBONIX team.</p>
            <p>Built on NISR data. Not an official NISR product.</p>
          </div>

          <ul className="flex items-center justify-center gap-4 pb-2 sm:gap-6 md:order-3 md:justify-end">
            {ICON_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  title={link.label}
                  {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
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
