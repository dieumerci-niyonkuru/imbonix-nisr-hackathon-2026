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
 * `data-lenis-prevent`. Lenis is imported dynamically, so it stays out of the first load and only runs in the browser.
 *
 * The glide is kept on for everyone (respectReducedMotion: false), by request, so it is always visible — including on
 * machines that have Windows animation effects turned off, which otherwise reports reduced motion and would disable it.
 * To make it honour that OS preference again, set respectReducedMotion back to true (its default).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lenis: import("lenis").default | null = null;
    let frame = 0;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      // Frame-rate-independent smoothing: each frame the page eases a fixed fraction toward where the wheel points, so
      // the scroll stays smooth but in the user's control — it tracks the wheel instead of coasting on a fixed timer,
      // which feels far more stable when the wheel is spun quickly. smoothWheel drives it from the mouse wheel too, not
      // only the trackpad; touch stays native (syncTouch off), which is the stable choice on phones.
      lenis = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 1,
        syncTouch: false,
        respectReducedMotion: false,
      });
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
