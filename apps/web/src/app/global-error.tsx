"use client";

import { useEffect } from "react";
import { BRAND, CYAN_INK, INK, MUTED, PAPER } from "@/lib/palette";

/**
 * Last-resort error page, used only when the root layout itself fails. It replaces the whole document, so it
 * cannot rely on the site's stylesheet or components and uses inline styles instead.
 *
 * The most common cause here is a stale build: after a new version ships, a tab that is still open asks for a code
 * chunk whose name has changed and no longer exists, which throws while loading. Re-rendering the same tree cannot fix
 * that — only fetching the new build can — so on a load error of that kind the page reloads itself once, and "Try
 * again" always does a full reload.
 */

const RELOAD_AT = "imbonix:reloaded-at";
const RELOAD_GUARD_MS = 10_000;

/** Whether the error looks like a stale deploy (a chunk or module that can no longer be fetched), not a logic bug. */
function looksLikeStaleBuild(error: Error): boolean {
  const text = `${error.name} ${error.message}`;
  return /ChunkLoadError|Loading chunk|Loading CSS chunk|dynamically imported module|Importing a module script failed|Failed to fetch dynamically/i.test(
    text,
  );
}

/** Reload once for a stale-build error, but not again within a short window, so a genuine error can't loop forever. */
function reloadOnceForStaleBuild(error: Error): void {
  if (typeof window === "undefined" || !looksLikeStaleBuild(error)) return;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_AT) ?? 0);
    if (Date.now() - last < RELOAD_GUARD_MS) return;
    sessionStorage.setItem(RELOAD_AT, String(Date.now()));
  } catch {
    // No sessionStorage (private mode): fall through and reload anyway; a hard-looping error is unlikely here.
  }
  window.location.reload();
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    reloadOnceForStaleBuild(error);
  }, [error]);

  const retry = () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(RELOAD_AT);
      } catch {
        // ignore
      }
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <html lang="en">
      <body style={{ margin: 0, background: PAPER, color: INK, fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "96px 24px" }} role="alert">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: CYAN_INK }}>
            IMBONIX is temporarily unavailable
          </p>
          <h1 style={{ fontSize: 32, lineHeight: 1.2, margin: "12px 0" }}>Something went wrong while loading the site.</h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: MUTED }}>
            This is usually a new version loading. The page will refresh itself; if it doesn&apos;t, use the button below.
          </p>
          {error.digest && <p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED }}>Reference: {error.digest}</p>}
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: 24,
              padding: "10px 20px",
              borderRadius: 999,
              border: 0,
              background: BRAND.cyan,
              color: INK,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
