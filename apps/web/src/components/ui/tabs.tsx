"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = { id: string; label: string; hint?: string; content: ReactNode };

/**
 * Accessible tabs whose selection follows the URL hash, so links such as /#poverty open a given tab. Every panel is
 * rendered on the server and inactive ones are invisible, so the content is there without JavaScript too.
 */
export function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(items[0]?.id);
  const sectionRef = useRef<HTMLDivElement>(null);
  const tabButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabIds = items.map((item) => item.id).join(" ");

  useEffect(() => {
    const knownIds = tabIds.split(" ");
    const selectFromHash = () => {
      const hashId = window.location.hash.slice(1);
      if (!knownIds.includes(hashId)) return;
      setActiveId(hashId);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    return () => window.removeEventListener("hashchange", selectFromHash);
  }, [tabIds]);

  const select = (tabId: string) => {
    setActiveId(tabId);
    window.history.replaceState(window.history.state, "", `#${tabId}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = items.length - 1;
    const targetIndex: Record<string, number> = {
      ArrowRight: index === lastIndex ? 0 : index + 1,
      ArrowLeft: index === 0 ? lastIndex : index - 1,
      Home: 0,
      End: lastIndex,
    };
    if (!(event.key in targetIndex)) return;
    event.preventDefault();
    const targetId = items[targetIndex[event.key]].id;
    select(targetId);
    tabButtons.current[targetId]?.focus();
  };

  return (
    <div ref={sectionRef} className="scroll-mt-24">
      <div
        role="tablist"
        aria-label={label}
        className="grid grid-cols-3 gap-1.5 rounded-[26px] bg-white p-1.5 ring-1 ring-line sm:gap-2 sm:p-2"
      >
        {items.map((item, index) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(button) => {
                tabButtons.current[item.id] = button;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "flex min-w-0 flex-col items-center gap-0.5 rounded-[20px] px-2 py-3 text-center sm:flex-row sm:items-start sm:gap-3 sm:px-5 sm:py-4 sm:text-left",
                selected ? "bg-cyan text-navy-900" : "text-ink hover:bg-cyan-soft hover:text-navy-900",
              )}
            >
              <span
                className={cn("tabular font-display text-[12px] font-bold sm:mt-1", selected ? "text-navy-900" : "text-royal")}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[14px] font-bold leading-5 sm:text-lg">{item.label}</span>
                {item.hint && (
                  <span className={cn("mt-0.5 hidden text-[13px] leading-5 sm:block", selected ? "text-navy-900" : "text-muted")}>
                    {item.hint}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/*
        Inactive panels stay laid out at full width but are invisible and take no height, rather than display: none.
        Their charts can then measure themselves and are drawn before the tab opens. Invisible content is also skipped
        by screen readers, keyboard focus and find in page, as hidden content would be.
      */}
      <div className="relative mt-8 sm:mt-10">
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <div
              key={item.id}
              role="tabpanel"
              id={`${baseId}-panel-${item.id}`}
              aria-labelledby={`${baseId}-tab-${item.id}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-royal",
                !selected && "invisible absolute inset-x-0 top-0 h-0 overflow-hidden",
              )}
            >
              {item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
