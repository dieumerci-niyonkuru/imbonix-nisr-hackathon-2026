"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ArrowTopRightOnSquareIcon, ChevronDownIcon, HomeIcon as HomeSolidIcon } from "@heroicons/react/20/solid";
import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { BrandLogo } from "@/components/layout/logo";
import { MENU_SECTIONS, NAV_LINKS, UTILITY_LINKS } from "@/components/layout/nav";
import {
  SiteSearch,
  type SearchChart,
  type SearchDistrict,
  type SearchLever,
  type SearchMeasure,
} from "@/components/layout/site-search";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type HeaderData = {
  search: { districts: SearchDistrict[]; measures: SearchMeasure[]; charts: SearchChart[]; levers: SearchLever[] };
};

type MenuItem = { href: string; label: string };
type MenuGroup = { id: string; label: string; items: MenuItem[] };

/** One menu per focus area, then the data: its landing page first, then the pages under it. */
const MENU_GROUPS: MenuGroup[] = MENU_SECTIONS.map((section) => ({
  id: section.id,
  label: section.label,
  items: [
    { href: section.href, label: section.landingLabel },
    ...section.items.map((item) => ({ href: item.href, label: item.label })),
  ],
}));

/** How long the pointer may leave a menu before it closes, so moving diagonally into the panel keeps it open. */
const HOVER_CLOSE_DELAY = 160;

// Top level items, as on the government's sites: plain capitals that take a cyan underline on hover, when open and
// for the section you are in.
const TOP_LINK_STYLE =
  "inline-flex h-12 items-center gap-1 whitespace-nowrap px-2 text-[13px] font-semibold uppercase tracking-[0.03em] text-ink transition-colors hover:text-cyan-ink hover:shadow-[inset_0_-3px_0_var(--cyan)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink focus-visible:ring-offset-2";
const TOP_ACTIVE_STYLE = "text-ink shadow-[inset_0_-3px_0_var(--cyan)]";
// Links inside a menu panel or the phone menu keep a light highlight, so the text stays readable.
const ACTIVE_STYLE = "bg-paper text-ink";
const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink";

/**
 * The header: a cyan bar holding the site search, then the logo, a home link, one dropdown menu per focus area and
 * the project pages, from 1280px wide. The search bar scrolls away with the page; once it is out of view, a search
 * button appears in the sticky header so search is always one click away. The menus are disclosure buttons: they open on click, Enter or the down
 * arrow, and on hover with a mouse; inside, the arrow keys move between links; Escape, a click outside or moving focus
 * away closes them. Each menu is a plain list of page names. Narrower screens get a menu sheet with the same links.
 */
export function SiteHeaderNav({ data }: { data: HeaderData }) {
  const pathname = usePathname() ?? "/";
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");
  const [searchBarInView, setSearchBarInView] = useState(true);
  const searchBarRef = useRef<HTMLDivElement>(null);
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

  // The header's own search button shows only once the search bar above it has scrolled out of view.
  useEffect(() => {
    const bar = searchBarRef.current;
    if (!bar) return;
    const observer = new IntersectionObserver(([entry]) => setSearchBarInView(entry.isIntersecting));
    observer.observe(bar);
    return () => observer.disconnect();
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

  // A menu's landing page is current only on its own address; its pages sit under that address too.
  const isCurrentPage = (href: string, exact = false) =>
    href === "/" || exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const groupHasCurrentPage = (group: MenuGroup) => group.items.some((item) => isCurrentPage(item.href));
  /** Inside an open menu, the arrow keys move between its links, Home and End jump to the ends. */
  const moveInMenu = (event: ReactKeyboardEvent<HTMLDivElement>, groupId: string) => {
    const links = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>("a[href]")];
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    const focusAt = (target: number) => links[(target + links.length) % links.length]?.focus();
    if (event.key === "ArrowDown") focusAt(index + 1);
    else if (event.key === "ArrowUp") {
      if (index <= 0) triggerButtons.current[groupId]?.focus();
      else focusAt(index - 1);
    } else if (event.key === "Home") focusAt(0);
    else if (event.key === "End") focusAt(links.length - 1);
    else return;
    event.preventDefault();
  };

  const openSearch = () => {
    setSheetOpen(false);
    setOpenGroupId(null);
    setSearchOpen(true);
  };

  return (
    <>
      {/* The site search, as a field in the right corner of a cyan bar, on every screen. */}
      <div ref={searchBarRef} className="bg-cyan">
        <div className="container-page flex justify-end py-2.5 sm:py-3">
          <button
            type="button"
            onClick={openSearch}
            aria-haspopup="dialog"
            aria-label={`Search the site (${shortcutLabel})`}
            className="flex h-11 w-full items-center gap-3 rounded-md bg-white px-4 text-left shadow-card ring-1 ring-ink/10 transition-shadow hover:ring-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink sm:w-[26rem]"
          >
            <MagnifyingGlassIcon className="h-5 w-5 shrink-0 stroke-2 text-ink" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[15px] text-muted">
              <span className="sm:hidden">Search places, indicators and charts</span>
              <span className="hidden sm:inline">Search a place, indicator, chart or page</span>
            </span>
            <kbd className="hidden shrink-0 rounded border border-line bg-paper px-2 py-0.5 font-body text-[12px] font-semibold text-muted md:inline">
              {shortcutLabel}
            </kbd>
          </button>
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
                      onKeyDown={(event) => moveInMenu(event, group.id)}
                      className={cn("absolute top-full w-72 pt-2", groupIndex >= 2 ? "right-0" : "left-0")}
                    >
                      <ul className="overflow-hidden rounded-xl bg-white py-2 shadow-lift ring-1 ring-line">
                        {group.items.map((item, itemIndex) => (
                          <li key={item.href} className={cn(itemIndex === 0 && "mb-1 border-b border-line pb-1")}>
                            <MenuLink
                              item={item}
                              current={isCurrentPage(item.href, itemIndex === 0)}
                              onNavigate={() => setOpenGroupId(null)}
                              label={itemIndex === 0 && item.label === "At a glance" ? `${group.label}: At a glance` : undefined}
                            />
                          </li>
                        ))}
                      </ul>
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
                "inline-flex h-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan text-ink transition-[width,opacity,visibility,background-color] duration-200 hover:bg-cyan-ink hover:text-white",
                searchBarInView ? "invisible w-0 opacity-0" : "w-10",
                FOCUS_RING,
              )}
            >
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
                    <MagnifyingGlassIcon className="h-5 w-5 text-cyan-ink" aria-hidden="true" />
                    Search places, indicators and charts
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
                        <h2 id={`sheet-${group.id}`} className="eyebrow px-2.5 text-cyan-ink">
                          {group.label}
                        </h2>
                        <ul className="mt-1.5">
                          {group.items.map((item, itemIndex) => (
                            <li key={item.href}>
                              <MenuLink
                                item={item}
                                current={isCurrentPage(item.href, itemIndex === 0)}
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
                          "mt-5 flex items-center justify-center rounded-2xl bg-cyan px-4 py-3 text-[14.5px] font-semibold text-ink hover:bg-cyan-ink hover:text-white",
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
        charts={data.search.charts}
        levers={data.search.levers}
      />
    </>
  );
}

/**
 * One page in a menu, by name only: capitals in the desktop list, sentence case in the phone menu. The page you are on
 * is solid cyan with near black text; the others tint on hover and keyboard focus.
 */
function MenuLink({
  item,
  current,
  onNavigate,
  label,
  compact = false,
}: {
  item: MenuItem;
  current: boolean;
  onNavigate: () => void;
  /** A fuller name for screen readers, such as the focus area for At a glance. */
  label?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      aria-label={label}
      className={cn(
        "block border-l-[3px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
        compact ? "rounded-r-lg px-3 py-2.5 text-[15px]" : "px-5 py-3 text-[13px] uppercase tracking-[0.06em]",
        current
          ? "border-cyan-ink bg-cyan text-ink focus-visible:ring-cyan-ink"
          : "border-transparent text-ink hover:border-cyan hover:bg-mist hover:text-cyan-ink focus-visible:border-cyan focus-visible:bg-mist focus-visible:text-cyan-ink focus-visible:ring-cyan-ink",
      )}
    >
      {item.label}
    </Link>
  );
}
