import Link from "next/link";
import type { ComponentType, CSSProperties, SVGProps } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { StackedBrandLogo } from "@/components/layout/logo";
import {
  FacebookIcon,
  FlickrIcon,
  GitHubIcon,
  InstagramGradientIcon,
  LinkedInIcon,
  TikTokIcon,
  XIcon,
} from "@/components/layout/social-icons";
import { DATA_SECTION, NAV_GROUPS, REPOSITORY_URL } from "@/components/layout/nav";
import { SOCIAL_BRAND } from "@/lib/palette";

type FooterLink = { href: string; label: string; external?: boolean };
type FooterColumn = { heading: string; links: FooterLink[] };
type IconLink = { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; external: boolean };
/** A social link, shown in the platform's own official colour. */
type SocialLink = { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; brand: string };

const DATA_ISSUE_URL = `${REPOSITORY_URL}/issues/new?template=data_issue.md`;

/**
 * IMBONIX's official social accounts, each shown in that platform's own brand colour (X black, LinkedIn and Facebook
 * their blues, Instagram its gradient). These are PLACEHOLDER handles: set each `href` to the real account before
 * launch, or remove the platforms that do not apply. Brand marks live in social-icons.tsx.
 */
const SOCIAL_LINKS: SocialLink[] = [
  { href: "https://x.com/imbonix", label: "IMBONIX on X", icon: XIcon, brand: SOCIAL_BRAND.x },
  {
    href: "https://www.linkedin.com/company/imbonix",
    label: "IMBONIX on LinkedIn",
    icon: LinkedInIcon,
    brand: SOCIAL_BRAND.linkedin,
  },
  { href: "https://www.facebook.com/imbonix", label: "IMBONIX on Facebook", icon: FacebookIcon, brand: SOCIAL_BRAND.facebook },
  {
    href: "https://www.instagram.com/imbonix",
    label: "IMBONIX on Instagram",
    icon: InstagramGradientIcon,
    brand: SOCIAL_BRAND.instagram,
  },
  { href: "https://www.flickr.com/photos/imbonix", label: "IMBONIX on Flickr", icon: FlickrIcon, brand: SOCIAL_BRAND.flickr },
  { href: "https://www.tiktok.com/@imbonix", label: "IMBONIX on TikTok", icon: TikTokIcon, brand: SOCIAL_BRAND.tiktok },
  { href: REPOSITORY_URL, label: "IMBONIX on GitHub", icon: GitHubIcon, brand: SOCIAL_BRAND.github },
];

/**
 * The footer columns mirror the three parts of the challenge — financial exclusion, poverty, social protection — plus
 * the data behind them, so the footer reads as the solution's own map. Each opens with its overview. Project and meta
 * links (source code, security, issues) sit in the bottom bar instead, so these columns stay balanced and on-topic.
 */
const COLUMNS: FooterColumn[] = [
  ...NAV_GROUPS.map((group) => ({
    heading: group.label,
    links: [{ href: group.href, label: "Overview" }, ...group.items.map((item) => ({ href: item.href, label: item.label }))],
  })),
  {
    heading: "Data & methods",
    links: [
      { href: DATA_SECTION.href, label: DATA_SECTION.landingLabel },
      ...DATA_SECTION.items.map((item) => ({ href: item.href, label: item.label })),
      { href: "/about", label: "About IMBONIX" },
    ],
  },
];

/** Project and meta links, shown as a small row in the bottom bar, out of the focus-area columns above. */
const PROJECT_LINKS: FooterLink[] = [
  { href: REPOSITORY_URL, label: "Source code", external: true },
  { href: `${REPOSITORY_URL}/blob/main/SECURITY.md`, label: "Security policy", external: true },
  { href: DATA_ISSUE_URL, label: "Report a data issue", external: true },
];

/** The utility icon beside the social links: just back to top (the project links live in the bottom bar now). */
const ICON_LINKS: IconLink[] = [{ href: "#main", label: "Back to top", icon: ArrowUpIcon, external: false }];

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

/** A round social button that shows the platform's mark in its own official colour, with a branded ring on hover. */
function BrandIconButton({ link }: { link: SocialLink }) {
  const Icon = link.icon;
  return (
    <a
      href={link.href}
      title={link.label}
      target="_blank"
      rel="noreferrer"
      style={{ color: link.brand, ["--brand"]: link.brand } as CSSProperties}
      className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-line transition-[background-color,box-shadow] hover:bg-paper hover:ring-2 hover:ring-[color:var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      <span className="sr-only">{link.label} (opens in a new tab)</span>
    </a>
  );
}

/** A round icon button for a utility link: a hairline ring, filling cyan on hover. */
function IconButton({ link }: { link: IconLink }) {
  return (
    <a
      href={link.href}
      title={link.label}
      {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="flex h-10 w-10 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-cyan hover:text-ink hover:ring-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
    >
      <link.icon className="h-[18px] w-[18px]" aria-hidden="true" />
      <span className="sr-only">
        {link.label}
        {link.external ? " (opens in a new tab)" : ""}
      </span>
    </a>
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
        <div className="container-page pt-14 sm:pt-16">
          <p className="max-w-3xl text-balance font-display text-[19px] font-bold leading-7 tracking-[-0.01em] text-ink sm:text-[22px]">
            Evidence for financial inclusion and poverty reduction in Rwanda — every figure sourced, every page a clear next step.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="container-page grid grid-cols-2 gap-x-6 gap-y-12 pb-16 pt-10 sm:pb-20 sm:pt-12 lg:grid-cols-4"
        >
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
        <div className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-b border-line py-4 sm:justify-start">
          {PROJECT_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded text-[13.5px] font-semibold text-muted transition-colors hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
            >
              {link.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
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

          <ul className="flex flex-wrap items-center justify-center gap-2 md:order-3 md:justify-end">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <BrandIconButton link={link} />
              </li>
            ))}
            <li aria-hidden="true" className="mx-0.5 h-6 w-px bg-line" />
            {ICON_LINKS.map((link) => (
              <li key={link.label}>
                <IconButton link={link} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
