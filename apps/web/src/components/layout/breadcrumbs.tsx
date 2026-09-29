"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import { MENU_SECTIONS, NAV_LINKS } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * Home › section › page, worked out from the navigation list so it always matches the menus and the address: a
 * focus area (or the data section) links to its landing page. Sub-pages (a district profile, say) add their own
 * `extra` crumbs; the last crumb is the current page.
 */
export function Breadcrumbs({ extra = [], className }: { extra?: Crumb[]; className?: string }) {
  const pathname = usePathname() ?? "/";
  const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const landing = MENU_SECTIONS.find((section) => pathname === section.href);
  const section = MENU_SECTIONS.find((candidate) => candidate.items.some((item) => matches(item.href)));
  const page = section?.items.find((item) => matches(item.href)) ?? NAV_LINKS.find((item) => matches(item.href));
  if (!landing && !page) return null;

  const crumbs: Crumb[] = landing
    ? [{ label: landing.title }]
    : [
        ...(section ? [{ label: section.title, href: section.href }] : []),
        { label: page!.label, href: extra.length ? page!.href : undefined },
        ...extra,
      ];
  const linkClass = "rounded transition-colors hover:text-cyan-ink";

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-semibold text-muted">
        <li>
          <Link href="/" className={cn("inline-flex items-center gap-1.5", linkClass)}>
            <HomeIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Home
          </Link>
        </li>
        {crumbs.map((crumb, i) => {
          const current = i === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              <ChevronRightIcon className="h-3.5 w-3.5 text-line" aria-hidden="true" />
              {current ? (
                <span aria-current="page" className="text-ink">
                  {crumb.label}
                </span>
              ) : crumb.href ? (
                <Link href={crumb.href} className={linkClass}>
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
