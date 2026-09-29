"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type PageSection = { id: string; label: string };

/**
 * A long page's own menu, as on the government's About pages: the page's name, then its sections in capitals, in a
 * bar that stays under the header while you read, with the section in view underlined in cyan. On phones the row
 * scrolls sideways and keeps the current section in view. Each section needs an id and `scroll-mt-36`.
 */
export function SectionNav({ label, sections }: { label: string; sections: PageSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));
    // A section counts as in view once it reaches the band just under the header and this bar.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-150px 0px -55% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  // On narrow screens the row scrolls sideways; keep the current section's tab in view.
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLAnchorElement>('[aria-current="location"]');
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2, behavior: "smooth" });
  }, [activeId]);

  return (
    <nav aria-label="On this page" className="sticky top-[85px] z-40 border-b border-line bg-white">
      <div className="container-page flex items-center gap-6">
        <p className="hidden shrink-0 font-display text-[16px] font-bold uppercase tracking-[0.04em] text-ink lg:block">
          {label}
        </p>
        <ul
          ref={listRef}
          className="scrollbar-none -mx-4 flex flex-1 items-center overflow-x-auto px-2 sm:-mx-6 sm:px-4 lg:mx-0 lg:justify-end lg:px-0"
        >
          {sections.map((section) => {
            const active = activeId === section.id;
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "inline-flex h-12 items-center whitespace-nowrap px-2.5 text-[12.5px] font-semibold uppercase tracking-[0.05em] transition-colors hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-ink",
                    active ? "text-ink shadow-[inset_0_-3px_0_var(--cyan)]" : "text-muted",
                  )}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
