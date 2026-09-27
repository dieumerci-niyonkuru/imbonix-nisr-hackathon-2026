"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

/** Pages shorter than the window plus this many pixels do not need the controls. */
const MINIMUM_SCROLL = 480;
/** Within this many pixels of either end, the button for that end is dimmed. */
const END_MARGIN = 80;

const BUTTON_STYLE =
  "flex h-11 w-11 items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan";

/**
 * Floating buttons to go back to the top of a long page or down to its end. They show only on pages long enough to
 * need them. At either end the matching button is dimmed but stays in place, so keyboard focus is never lost, and the
 * scroll is instant for people who prefer reduced motion.
 */
export function ScrollControls() {
  const pathname = usePathname();
  const [scrollable, setScrollable] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const scrolled = window.scrollY;
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
      setScrollable(scrollRange > MINIMUM_SCROLL);
      setAtTop(scrolled < END_MARGIN);
      setAtBottom(scrollRange - scrolled < END_MARGIN);
    };
    const scheduleMeasure = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    // Charts and maps change the page height after it loads, so watch the body as well as scrolling.
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  if (!scrollable) return null;

  const scrollToPosition = (top: number) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <div
      role="group"
      aria-label="Page scrolling"
      className="fixed bottom-4 right-4 z-40 flex flex-col overflow-hidden rounded-2xl bg-navy-900 shadow-lift ring-1 ring-white/15 sm:bottom-6 sm:right-6 print:hidden"
    >
      <button
        type="button"
        title="Back to top"
        aria-label="Back to top"
        aria-disabled={atTop}
        onClick={() => !atTop && scrollToPosition(0)}
        className={cn(BUTTON_STYLE, atTop ? "cursor-default opacity-40" : "hover:bg-cyan hover:text-navy-900")}
      >
        <ArrowUpIcon className="h-5 w-5" aria-hidden="true" />
      </button>
      <span aria-hidden="true" className="mx-2.5 h-px bg-white/15" />
      <button
        type="button"
        title="Go to the end of the page"
        aria-label="Go to the end of the page"
        aria-disabled={atBottom}
        onClick={() => !atBottom && scrollToPosition(document.documentElement.scrollHeight)}
        className={cn(BUTTON_STYLE, atBottom ? "cursor-default opacity-40" : "hover:bg-cyan hover:text-navy-900")}
      >
        <ArrowDownIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
