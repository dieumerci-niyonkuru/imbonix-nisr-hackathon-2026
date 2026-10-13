"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowTopRightOnSquareIcon, HomeIcon as HomeSolidIcon } from "@heroicons/react/20/solid";
import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { BrandLogo } from "@/components/layout/logo";
import { MENU_SECTIONS, UTILITY_LINKS } from "@/components/layout/nav";
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

/**
 * The four main tabs: the three parts of the challenge — financial inclusion, poverty & vulnerability and the priority
 * areas for social protection — and the data behind them. Each goes straight to its section's overview; the pages inside
 * a section are reached from that section's own sub-navigation, so the header stays to four strong tabs with no
 * dropdowns. About lives in the footer.
 */
const TABS = MENU_SECTIONS.map((section) => ({ id: section.id, label: section.label, href: section.href }));

// A top-level tab: bold capitals that take a thick cyan underline on hover, when it is the section you are in.
const TAB_STYLE =
  "inline-flex h-11 items-center whitespace-nowrap rounded px-3.5 text-[13.5px] font-bold uppercase tracking-[0.045em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
/** Tab colours on the solid white header: the brand blue, the current section (or a hovered tab) a solid blue box. */
const TAB_SOLID = "text-cyan-ink hover:bg-cyan-ink hover:text-white focus-visible:ring-cyan-ink";
const TAB_ACTIVE_SOLID = "bg-cyan-ink text-white";
/** Tab colours when the header sits over the hero photo: white, the current or hovered tab filling with a white box. */
const TAB_OVER = "text-white hover:bg-white hover:text-cyan-ink focus-visible:ring-white";
const TAB_ACTIVE_OVER = "bg-white text-cyan-ink";
const ACTIVE_STYLE = "bg-cyan text-ink";
const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink";

/**
 * The header: one sticky row with the logo, a home tab, the four section tabs (from 1280px wide) and a search button
 * that opens the search dialog (or Ctrl/Cmd K). At the top of the homepage it sits over the hero photo (transparent,
 * white text) and turns solid white on scroll. Narrower screens get a menu sheet with the same tabs.
 */
export function SiteHeaderNav({ data }: { data: HeaderData }) {
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcutLabel("Cmd K");
  }, []);

  // Once the page has scrolled, the sticky header lifts off the content with a soft shadow.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The home tab is current only on "/"; a section tab is current on its overview and on any page under it.
  const isCurrent = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  const openSearch = () => {
    setSheetOpen(false);
    setSearchOpen(true);
  };

  // At the top of the homepage the header sits over the hero photo (transparent, white text); on scroll it turns solid.
  const overlay = isHome && !scrolled;
  const tabLink = cn(TAB_STYLE, overlay ? TAB_OVER : TAB_SOLID);
  const tabActive = overlay ? TAB_ACTIVE_OVER : TAB_ACTIVE_SOLID;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-shadow duration-200",
          overlay ? "border-transparent bg-transparent" : "border-line bg-white",
          scrolled && "shadow-[0_6px_20px_-12px_rgba(26,31,33,0.35)]",
        )}
      >
        {/* Over the hero photo a dark scrim keeps the white logo and tabs clearly readable. */}
        {overlay && <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink/50" />}
        <div className="container-page relative flex h-[76px] items-center gap-4">
          <Link href="/" aria-label="IMBONIX home" className={cn("shrink-0 rounded-xl", FOCUS_RING)}>
            <BrandLogo onDark={overlay} />
          </Link>

          <nav aria-label="Main" className="ml-auto hidden xl:block">
            <ul className="flex items-center gap-1">
              <li>
                <Link
                  href="/"
                  aria-label="Home"
                  aria-current={isCurrent("/") ? "page" : undefined}
                  className={cn(tabLink, "w-12 justify-center px-0", isCurrent("/") && tabActive)}
                >
                  <HomeSolidIcon className="h-6 w-6" aria-hidden="true" />
                </Link>
              </li>
              {TABS.map((tab) => (
                <li key={tab.id}>
                  <Link
                    href={tab.href}
                    aria-current={isCurrent(tab.href) ? "page" : undefined}
                    className={cn(tabLink, isCurrent(tab.href) && tabActive)}
                  >
                    {tab.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 xl:ml-3">
            {/* Search as a blue "Search" label with a magnifier, like the tabs: the word shows on all but the narrowest
                phones (from 480px), where the logo and two labels would crowd, and drops to the icon alone below that. */}
            <button
              type="button"
              onClick={openSearch}
              aria-haspopup="dialog"
              aria-label={`Search the site (${shortcutLabel})`}
              title={`Search the site (${shortcutLabel})`}
              className={cn(tabLink, "gap-1.5")}
            >
              <span className="hidden min-[480px]:inline">Search</span>
              <MagnifyingGlassIcon className="h-[18px] w-[18px] stroke-2" aria-hidden="true" />
            </button>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                {/* The menu button matches Search: a "Menu" label with the three-lines icon, icon-only on the narrowest
                    phones. Shown below the point where the full tab bar appears. */}
                <button type="button" aria-label="Open menu" className={cn(tabLink, "gap-1.5 xl:hidden")}>
                  <span className="hidden min-[480px]:inline">Menu</span>
                  <Bars3Icon className="h-[18px] w-[18px] stroke-2" aria-hidden="true" />
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
                  <nav aria-label="Main" className="mt-4 grid gap-1.5">
                    <SheetLink href="/" current={isCurrent("/")} onNavigate={() => setSheetOpen(false)}>
                      Home
                    </SheetLink>
                    {TABS.map((tab) => (
                      <SheetLink
                        key={tab.id}
                        href={tab.href}
                        current={isCurrent(tab.href)}
                        onNavigate={() => setSheetOpen(false)}
                      >
                        {tab.label}
                      </SheetLink>
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

/** One tab in the phone menu: a big tappable row, solid cyan when it is the section you are in. */
function SheetLink({
  href,
  current,
  onNavigate,
  children,
}: {
  href: string;
  current: boolean;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={cn(
        "rounded-xl px-4 py-3 text-[15.5px] font-bold text-ink transition-colors hover:bg-cyan-soft hover:text-cyan-ink",
        FOCUS_RING,
        current && ACTIVE_STYLE,
      )}
    >
      {children}
    </Link>
  );
}
