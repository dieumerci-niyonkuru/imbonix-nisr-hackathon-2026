"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

/** How far down the page you scroll before the back-to-top button appears. */
const SHOW_AFTER = 480;

/**
 * A single, simple "Back to top" button: it floats in the bottom-right once the page is scrolled down and returns to
 * the top on click (instantly for people who prefer reduced motion). It hides again near the top and once the footer is
 * in view, so it never covers it, unless it has keyboard focus. Phones scroll by touch, so it starts at the small tablet
 * width.
 */
export function ScrollControls() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const footer = document.querySelector("footer");
    const footerObserver = new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting));
    if (footer) footerObserver.observe(footer);
    return () => {
      window.removeEventListener("scroll", onScroll);
      footerObserver.disconnect();
    };
  }, [pathname]);

  const toTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const hidden = !show || footerInView;

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      title="Back to top"
      className={cn(
        "group fixed bottom-24 right-4 z-40 hidden h-12 w-12 items-center justify-center rounded-full bg-cyan text-ink shadow-lift ring-1 ring-cyan-ink/15 transition-[opacity,transform,visibility] duration-200 hover:bg-cyan-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:bottom-28 sm:right-6 sm:flex print:hidden",
        hidden &&
          "pointer-events-none invisible translate-y-2 opacity-0 focus-within:pointer-events-auto focus-within:visible focus-within:translate-y-0 focus-within:opacity-100",
      )}
    >
      <ArrowUpIcon className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
