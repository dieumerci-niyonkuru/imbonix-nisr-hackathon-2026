"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  HomeIcon as HomeSolidIcon,
  ShieldCheckIcon,
} from "@heroicons/react/20/solid";
import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { BrandLogo } from "@/components/layout/logo";
import { NAV_GROUPS, NAV_LINKS, UTILITY_LINKS } from "@/components/layout/nav";
import { SiteSearch, type SearchDistrict, type SearchMeasure } from "@/components/layout/site-search";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** One coverage figure for the utility bar, counted from the site's data. */
export type CoverageFigure = { value: number; label: string };
export type HeaderData = {
  coverage: CoverageFigure[];
  search: { districts: SearchDistrict[]; measures: SearchMeasure[] };
};

type MenuItem = {
  href: string;
  label: string;
  /** Set for homepage tabs, which switch in place when the homepage is already open. */
  focusId?: string;
};
type MenuGroup = { id: string; label: string; items: MenuItem[] };

/** One menu per focus area: its homepage overview, then the pages that go deeper. */
const MENU_GROUPS: MenuGroup[] = NAV_GROUPS.map((group) => ({
  id: group.focusId,
  label: group.label,
  items: [
    { href: `/#${group.focusId}`, label: "At a glance", focusId: group.focusId },
    ...group.items.map((item) => ({ href: item.href, label: item.label })),
  ],
}));

/** How long the pointer may leave a menu before it closes, so moving diagonally into the panel keeps it open. */
const HOVER_CLOSE_DELAY = 160;

// Top level items, as on the NISR site: bold navy text that turns into a solid block on hover and when open or current.
const TOP_LINK_STYLE =
  "inline-flex h-12 items-center gap-1 whitespace-nowrap rounded-md px-2.5 text-[14.5px] font-bold text-navy-900 transition-colors hover:bg-cyan hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:ring-offset-2 xl:px-3.5 xl:text-[15.5px]";
const TOP_ACTIVE_STYLE = "bg-cyan text-navy-900";
// Links inside a menu panel or the phone menu keep a light highlight, so the text stays readable.
const ACTIVE_STYLE = "bg-paper text-ink";
const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal";

/**
 * The header: a thin bar with project links, then the logo, a home link, one dropdown menu per focus area,
 * the methods page and search, from 1280px wide. The menus are disclosure buttons: they open on click, Enter or the down
 * arrow, and on hover with a mouse; Escape, a click outside or moving focus away closes them. Narrower screens get a menu
 * sheet with the same links.
 */
export function SiteHeaderNav({ data }: { data: HeaderData }) {
  const pathname = usePathname() ?? "/";
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const triggerButtons = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setSheetOpen(false);
    setOpenGroupId(null);
  }, [pathname]);

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcutLabel("Cmd K");
    return () => window.clearTimeout(closeTimer.current);
  }, []);

  // An open menu closes on a click outside the navigation, or on Escape, which returns focus to its button.
  useEffect(() => {
    if (!openGroupId) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenGroupId(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      triggerButtons.current[openGroupId]?.focus();
      setOpenGroupId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openGroupId]);

  const pointerCanHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const openOnHover = (groupId: string) => {
    if (!pointerCanHover()) return;
    window.clearTimeout(closeTimer.current);
    setOpenGroupId(groupId);
  };
  const closeAfterLeaving = () => {
    if (!pointerCanHover()) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenGroupId(null), HOVER_CLOSE_DELAY);
  };

  /** On the homepage, switch the tab in place (the tabs follow the hash); elsewhere, go to the homepage tab. */
  const openFocusArea = (event: MouseEvent<HTMLAnchorElement>, focusId: string) => {
    setSheetOpen(false);
    setOpenGroupId(null);
    if (pathname !== "/") return;
    event.preventDefault();
    if (window.location.hash === `#${focusId}`) window.dispatchEvent(new HashChangeEvent("hashchange"));
    else window.location.hash = focusId;
  };

  const isCurrentPage = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const groupHasCurrentPage = (group: MenuGroup) => group.items.some((item) => !item.focusId && isCurrentPage(item.href));
  const openSearch = () => {
    setSheetOpen(false);
    setOpenGroupId(null);
    setSearchOpen(true);
  };

  return (
    <>
      <div className="hidden border-b-2 border-cyan bg-navy-950 text-white md:block">
        <div className="container-page flex h-11 items-center justify-between gap-6 text-[13px]">
          <div className="flex min-w-0 items-center gap-4 overflow-hidden">
            <p className="flex shrink-0 items-center gap-2 font-bold tracking-[0.01em]">
              <ShieldCheckIcon className="h-4 w-4 text-cyan" aria-hidden="true" />
              Independent evidence platform
            </p>
            <span className="hidden h-4 w-px bg-white/25 xl:block" aria-hidden="true" />
            <ul aria-label="Coverage" className="hidden items-center gap-4 whitespace-nowrap text-white/75 xl:flex">
              {data.coverage.map((figure) => (
                <li key={figure.label}>
                  <span className="tabular font-bold text-cyan">{figure.value.toLocaleString("en-US")}</span> {figure.label}
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Project links" className="shrink-0">
            <ul className="flex items-center divide-x divide-white/20">
              {UTILITY_LINKS.map((link) => (
                <li key={link.href} className="px-4 last:pr-0">
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 rounded font-bold text-white transition-colors hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                  >
                    {link.label}
                    <ArrowTopRightOnSquareIcon
                      className="h-3.5 w-3.5 text-white/55 transition-colors group-hover:text-cyan"
                      aria-hidden="true"
                    />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-white">
        <div className="container-page flex h-[84px] items-center gap-4">
          <Link href="/" aria-label="IMBONIX home" className={cn("shrink-0 rounded-xl", FOCUS_RING)}>
            <BrandLogo />
          </Link>

          <nav ref={navRef} aria-label="Main" className="ml-auto hidden xl:block">
            <ul className="flex items-center gap-0.5">
              <li>
                <Link
                  href="/"
                  aria-label="Home"
                  aria-current={isCurrentPage("/") ? "page" : undefined}
                  className={cn(TOP_LINK_STYLE, "w-12 justify-center px-0 xl:px-0", isCurrentPage("/") && TOP_ACTIVE_STYLE)}
                >
                  <HomeSolidIcon className="h-6 w-6" aria-hidden="true" />
                </Link>
              </li>
              {MENU_GROUPS.map((group, groupIndex) => {
                const expanded = openGroupId === group.id;
                const panelId = `menu-panel-${group.id}`;
                return (
                  <li
                    key={group.id}
                    className="relative"
                    onMouseEnter={() => openOnHover(group.id)}
                    onMouseLeave={closeAfterLeaving}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setOpenGroupId((current) => (current === group.id ? null : current));
                      }
                    }}
                  >
                    <button
                      ref={(button) => {
                        triggerButtons.current[group.id] = button;
                      }}
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => setOpenGroupId(expanded ? null : group.id)}
                      onKeyDown={(event) => {
                        if (event.key !== "ArrowDown") return;
                        event.preventDefault();
                        setOpenGroupId(group.id);
                        window.requestAnimationFrame(() => document.getElementById(panelId)?.querySelector("a")?.focus());
                      }}
                      className={cn(TOP_LINK_STYLE, (expanded || groupHasCurrentPage(group)) && TOP_ACTIVE_STYLE)}
                    >
                      {group.label}
                      <ChevronDownIcon
                        className={cn("h-4 w-4 opacity-70 transition-transform", expanded && "rotate-180")}
                        aria-hidden="true"
                      />
                    </button>
                    {/* The top padding bridges the gap to the panel, so the pointer can move into it without closing it. */}
                    <div
                      id={panelId}
                      hidden={!expanded}
                      className={cn("absolute top-full w-64 pt-2", groupIndex >= 2 ? "right-0" : "left-0")}
                    >
                      <div className="rounded-2xl bg-white py-2 shadow-lift ring-1 ring-line">
                        <ul>
                          {group.items.map((item) => (
                            <li key={item.href}>
                              <MenuLink
                                item={item}
                                current={!item.focusId && isCurrentPage(item.href)}
                                onFocusArea={openFocusArea}
                                onNavigate={() => setOpenGroupId(null)}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrentPage(link.href) ? "page" : undefined}
                    className={cn(TOP_LINK_STYLE, isCurrentPage(link.href) && TOP_ACTIVE_STYLE)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 xl:ml-2">
            <button
              type="button"
              onClick={openSearch}
              aria-haspopup="dialog"
              aria-label={`Search the site (${shortcutLabel})`}
              title={`Search the site (${shortcutLabel})`}
              className={cn(
                "inline-flex h-12 items-center gap-2 rounded-md px-3 text-[15px] font-bold text-navy-900 transition-colors hover:bg-cyan xl:text-[15.5px]",
                FOCUS_RING,
              )}
            >
              <span className="hidden sm:inline">Search</span>
              <MagnifyingGlassIcon className="h-5 w-5 stroke-2" aria-hidden="true" />
            </button>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper xl:hidden",
                    FOCUS_RING,
                  )}
                >
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto p-0">
                <SheetHeader className="border-b border-line pb-4">
                  {/* The site header behind the sheet already shows the logo, so the sheet has a plain title. */}
                  <SheetTitle className="font-display text-xl font-bold text-ink">Menu</SheetTitle>
                  <SheetDescription className="sr-only">Site navigation</SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-8">
                  <button
                    type="button"
                    onClick={openSearch}
                    className={cn(
                      "mt-4 flex w-full items-center gap-2 rounded-2xl bg-paper px-4 py-3 text-left text-[14.5px] font-semibold text-muted ring-1 ring-line",
                      FOCUS_RING,
                    )}
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 text-royal" aria-hidden="true" />
                    Search districts and measures
                  </button>
                  <nav aria-label="Main">
                    <Link
                      href="/"
                      aria-current={isCurrentPage("/") ? "page" : undefined}
                      className={cn(
                        "mt-4 block rounded-lg px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-cyan-soft",
                        FOCUS_RING,
                        isCurrentPage("/") && ACTIVE_STYLE,
                      )}
                    >
                      Home
                    </Link>
                    {MENU_GROUPS.map((group) => (
                      <section key={group.id} aria-labelledby={`sheet-${group.id}`} className="mt-5">
                        <h2 id={`sheet-${group.id}`} className="eyebrow px-2.5 text-royal">
                          {group.label}
                        </h2>
                        <ul className="mt-1.5">
                          {group.items.map((item) => (
                            <li key={item.href}>
                              <MenuLink
                                item={item}
                                current={!item.focusId && isCurrentPage(item.href)}
                                onFocusArea={openFocusArea}
                                onNavigate={() => setSheetOpen(false)}
                                compact
                              />
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-current={isCurrentPage(link.href) ? "page" : undefined}
                        className={cn(
                          "mt-5 flex items-center justify-center rounded-2xl bg-navy-900 px-4 py-3 text-[14.5px] font-semibold text-white hover:bg-cyan hover:text-navy-900",
                          FOCUS_RING,
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <ul className="mt-6 grid gap-1 border-t border-line pt-4">
                    {UTILITY_LINKS.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[13.5px] font-semibold text-muted hover:text-ink",
                            FOCUS_RING,
                          )}
                        >
                          {link.label}
                          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SiteSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        districts={data.search.districts}
        measures={data.search.measures}
      />
    </>
  );
}

/**
 * One link in a menu, as plain text: capitals in the desktop dropdown, sentence case in the phone menu. The current
 * page is marked with a cyan bar and a light background.
 */
function MenuLink({
  item,
  current,
  onFocusArea,
  onNavigate,
  compact = false,
}: {
  item: MenuItem;
  current: boolean;
  onFocusArea: (event: MouseEvent<HTMLAnchorElement>, focusId: string) => void;
  onNavigate: () => void;
  compact?: boolean;
}) {
  const className = cn(
    "block border-l-[3px] transition-colors hover:bg-cyan-soft",
    compact
      ? "rounded-r-lg px-3 py-2.5 text-[15px] font-semibold text-ink"
      : "px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-navy-900",
    current ? "border-cyan bg-cyan-soft" : "border-transparent",
    FOCUS_RING,
  );

  if (item.focusId) {
    const focusId = item.focusId;
    return (
      <a href={item.href} onClick={(event) => onFocusArea(event, focusId)} className={className}>
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} onClick={onNavigate} aria-current={current ? "page" : undefined} className={className}>
      {item.label}
    </Link>
  );
}
