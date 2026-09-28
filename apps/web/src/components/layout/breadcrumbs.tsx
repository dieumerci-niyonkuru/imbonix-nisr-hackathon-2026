"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import { NAV_GROUPS, NAV_LINKS } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * Home › focus area › page, worked out from the navigation list so it always matches the menus. The focus area links
 * to its page at a glance. Sub-pages (a district profile, say) add their own `extra` crumbs; the last crumb is the
 * current page.
 */
export function Breadcrumbs({
  extra = [],
  tone = "light",
  className,
}: {
  extra?: Crumb[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const pathname = usePathname() ?? "/";
  const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const focusGroup = NAV_GROUPS.find((g) => pathname === `/focus/${g.focusId}`);
  const group = NAV_GROUPS.find((g) => g.items.some((item) => matches(item.href)));
  const page = group?.items.find((item) => matches(item.href)) ?? NAV_LINKS.find((item) => matches(item.href));
  if (!focusGroup && !page) return null;

  const crumbs: Crumb[] = focusGroup
    ? [{ label: focusGroup.label }]
    : [
        ...(group ? [{ label: group.label, href: `/focus/${group.focusId}` }] : []),
        { label: page!.label, href: extra.length ? page!.href : undefined },
        ...extra,
      ];
  const dark = tone === "dark";
  const linkClass = cn("rounded transition-colors", dark ? "hover:text-white" : "hover:text-cyan-ink");

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={cn("flex flex-wrap items-center gap-1.5 text-[12.5px] font-semibold", dark ? "text-white/65" : "text-muted")}
      >
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
              <ChevronRightIcon className={cn("h-3.5 w-3.5", dark ? "text-white/30" : "text-line")} aria-hidden="true" />
              {current ? (
                <span aria-current="page" className={dark ? "text-white" : "text-ink"}>
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
