"use client";

import { useEffect } from "react";

/** A Lenis instance, enough of it for the back-to-top button to scroll smoothly. */
export type LenisLike = { scrollTo: (target: number, options?: { immediate?: boolean }) => void };
/** The window with the running Lenis instance attached (undefined when smooth scroll is off). */
export type LenisWindow = Window & { __lenis?: LenisLike };

/**
 * Site-wide smooth, eased "momentum" scrolling (Lenis). The page glides and decelerates instead of jumping with the
 * wheel, the way modern landing pages feel. It drives the native window scroll, so the scrollbar, the sticky header and
 * the scroll-reveal observers all keep working; nested scrollers (the AI chat log, for one) opt out with
 * `data-lenis-prevent`. Anyone who prefers reduced motion keeps plain native scrolling. Lenis is imported dynamically,
 * so it stays out of the first load and only runs in the browser.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: import("lenis").default | null = null;
    let frame = 0;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      // Exposed so other controls (the back-to-top button) can scroll smoothly through Lenis instead of the native
      // smooth scroll that Lenis disables.
      (window as LenisWindow).__lenis = lenis;
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
      (window as LenisWindow).__lenis = undefined;
    };
  }, []);

  return null;
}
