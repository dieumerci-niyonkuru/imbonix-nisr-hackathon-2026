import Link from "next/link";
import { ArrowTopRightOnSquareIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import pkg from "../../../package.json";
import { BrandLogo } from "@/components/layout/logo";
import { FOCUS_AREAS, NAV_GROUPS, NISR_CATALOG_URL } from "@/components/layout/nav";

const REPOSITORY_URL = "https://github.com/dieumerci-niyonkuru/imbonix-nisr-hackathon-2026";

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
  "inline-flex items-center gap-1.5 rounded text-[14px] leading-6 text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun";

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
 * The site footer: what IMBONIX is and who stands behind it, every page grouped as in the menu, the NISR studies the
 * figures come from, and the credits the data licences ask for.
 */
export function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <div className="max-w-md">
            <Link
              href="/"
              aria-label="IMBONIX home"
              className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
            >
              <BrandLogo onDark />
            </Link>
            <p className="mt-6 text-[15px] leading-7 text-white/85">
              Rwanda&apos;s published statistics, turned into evidence for financial inclusion and poverty reduction, district by
              district.
            </p>
            <p className="mt-4 text-[13px] leading-6 text-white/65">
              An independent team project for the NISR 2026 Big Data Hackathon, Track 2: Financial Inclusion and Poverty
              Reduction. It is not an official NISR product and does not imply NISR endorsement.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="eyebrow text-sun">{column.heading}</h2>
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
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="eyebrow text-sun">Built on NISR data</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SOURCE_STUDIES.map((study) => (
              <li key={study.studyId}>
                <a
                  href={`${NISR_CATALOG_URL}/${study.studyId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[12.5px] font-semibold text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
                >
                  {study.label}
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
                  <span className="sr-only">(study page in the NISR microdata catalog, opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-3xl text-[12.5px] leading-6 text-white/65">
            Statistics come from the National Institute of Statistics of Rwanda and its partners, cited beside every chart.
            District and sector boundaries: geoBoundaries (CC BY 4.0), from NISR open geodata. Background map: OpenFreeMap, ©
            OpenMapTiles, data from OpenStreetMap contributors.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-[12.5px] text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 IMBONIX team · Version {pkg.version}</p>
          <a
            href="#main"
            className="inline-flex items-center gap-1.5 self-start rounded font-semibold text-white/80 transition-colors hover:text-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun sm:self-auto"
          >
            Back to top
            <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
