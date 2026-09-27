"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { BrandLogo } from "@/components/layout/logo";
import { FOCUS_AREAS, NAV_LINKS } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** A minimal header: the logo, the three focus areas and the methods page. */
export function SiteHeaderNav() {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  /** On the homepage, switch the tab in place (the tabs follow the hash); elsewhere, go to the homepage tab. */
  const openFocusArea = (event: MouseEvent<HTMLAnchorElement>, focusId: string) => {
    setMenuOpen(false);
    if (pathname !== "/") return;
    event.preventDefault();
    if (window.location.hash === `#${focusId}`) window.dispatchEvent(new HashChangeEvent("hashchange"));
    else window.location.hash = focusId;
  };

  const links = [
    ...FOCUS_AREAS.map((area) => ({ href: `/#${area.id}`, label: area.label, focusId: area.id as string | undefined })),
    ...NAV_LINKS.map((item) => ({ href: item.href, label: item.label, focusId: undefined })),
  ];
  const isCurrentPage = (href: string) => !href.startsWith("/#") && pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="container-page flex h-[72px] items-center gap-4">
        <Link href="/" aria-label="IMBONIX home" className="shrink-0 rounded-xl">
          <BrandLogo />
        </Link>

        <nav aria-label="Main" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={link.focusId ? (event) => openFocusArea(event, link.focusId!) : undefined}
                  aria-current={isCurrentPage(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-[14.5px] font-semibold transition-colors hover:bg-paper hover:text-ink",
                    isCurrentPage(link.href) ? "bg-paper text-ink" : "text-ink/75",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-paper md:hidden" aria-label="Open menu">
                <Bars3Icon className="!size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto p-0">
              <SheetHeader className="border-b border-line pb-4">
                <SheetTitle>
                  <BrandLogo />
                </SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <nav aria-label="Main" className="px-4 pb-8">
                <ul className="grid gap-1">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={link.focusId ? (event) => openFocusArea(event, link.focusId!) : undefined}
                        aria-current={isCurrentPage(link.href) ? "page" : undefined}
                        className={cn(
                          "block rounded-2xl px-4 py-3 font-display text-lg font-bold transition-colors hover:bg-paper",
                          isCurrentPage(link.href) ? "bg-paper text-ink" : "text-ink/85",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
