import Link from "next/link";
import { ArrowTopRightOnSquareIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import pkg from "../../../package.json";
import { BrandLogo } from "@/components/layout/logo";
import { FOCUS_AREAS, NAV_GROUPS, NISR_CATALOG_URL, REPOSITORY_URL } from "@/components/layout/nav";

/** The surveys and censuses behind the figures, each linked to its study page in the NISR microdata catalog. */
const SOURCE_STUDIES = [
  { label: "EICV7 2023/24", studyId: 119 },
  { label: "FinScope 2024", studyId: 120 },
  { label: "DHS 2025", studyId: 126 },
  { label: "CFSVA 2024", studyId: 122 },
  { label: "Census 2022", studyId: 109 },
  { label: "LFS 2025", studyId: 125 },
  { label: "Establishment Census 2023", studyId: 112 },
];

/** `hashLink` marks homepage tab links, which need a plain anchor so the tabs see the hash change. */
type FooterLink = { href: string; label: string; external?: boolean; hashLink?: boolean };
type FooterColumn = { heading: string; links: FooterLink[] };

const COLUMNS: FooterColumn[] = [
  {
    heading: "Focus areas",
    links: FOCUS_AREAS.map((area) => ({ href: `/#${area.id}`, label: area.label, hashLink: true })),
  },
  ...NAV_GROUPS.map((group) => ({
    heading: group.label,
    links: group.items.map((item) => ({ href: item.href, label: item.label })),
  })),
  {
    heading: "Project",
    links: [
      { href: "/data", label: "Data & methods" },
      { href: REPOSITORY_URL, label: "Source code", external: true },
      { href: `${REPOSITORY_URL}/blob/main/SECURITY.md`, label: "Security policy", external: true },
      { href: `${REPOSITORY_URL}/issues/new?template=data_issue.md`, label: "Report a data issue", external: true },
    ],
  },
];

const LINK_STYLE =
  "inline-flex items-center gap-1.5 rounded text-[14px] leading-6 text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan";

function FooterAnchor({ link }: { link: FooterLink }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={LINK_STYLE}>
        {link.label}
        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  if (link.hashLink) {
    return (
      <a href={link.href} className={LINK_STYLE}>
        {link.label}
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
 * The site footer, laid out like a university footer: centred link columns with bold headings, the NISR studies
 * behind the figures, then a bottom row with the copyright and independence statement, the logo and a link back to
 * the top, and the credits the data licences ask for.
 */
export function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container-page pb-8 pt-12 sm:pt-14">
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 text-center sm:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((column) => (
            // On phones the fifth column spans both columns, so it sits centred instead of alone on the left.
            <div key={column.heading} className="last:col-span-2 sm:last:col-span-1">
              <h2 className="font-display text-[15px] font-bold text-white">{column.heading}</h2>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <h2 className="font-display text-[15px] font-bold text-white">Built on NISR data</h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {SOURCE_STUDIES.map((study) => (
              <li key={study.studyId}>
                <a
                  href={`${NISR_CATALOG_URL}/${study.studyId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-[12.5px] font-semibold text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                >
                  {study.label}
                  <ArrowTopRightOnSquareIcon className="h-3 w-3 text-white/50" aria-hidden="true" />
                  <span className="sr-only">(study page in the NISR microdata catalog, opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid items-center gap-6 border-t border-white/10 pt-8 md:grid-cols-3">
          <div className="text-center text-[13px] leading-6 text-white/65 md:text-left">
            <p className="text-white/85">© 2026 IMBONIX team · Version {pkg.version}</p>
            <p>An independent hackathon project. Not an official NISR product.</p>
          </div>
          <Link
            href="/"
            aria-label="IMBONIX home"
            className="justify-self-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <BrandLogo onDark />
          </Link>
          <a
            href="#main"
            className="inline-flex items-center gap-1.5 justify-self-center rounded text-[13.5px] font-semibold text-white/80 transition-colors hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan md:justify-self-end"
          >
            Back to top
            <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-[12px] leading-5 text-white/50">
          Statistics from the National Institute of Statistics of Rwanda and its partners, cited beside every chart. Boundaries:
          geoBoundaries (CC BY 4.0). Background map: OpenFreeMap, © OpenMapTiles, OpenStreetMap contributors.
        </p>
      </div>
    </footer>
  );
}
