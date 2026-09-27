"use client";

import { BRAND, INK, MUTED, PAPER, SUN_INK, WHITE } from "@/lib/palette";

/**
 * Last-resort error page, used only when the root layout itself fails. It replaces the whole document, so it
 * cannot rely on the site's stylesheet or components and uses inline styles instead.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: PAPER, color: INK, fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "96px 24px" }} role="alert">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: SUN_INK }}>
            IMBONIX is temporarily unavailable
          </p>
          <h1 style={{ fontSize: 32, lineHeight: 1.2, margin: "12px 0" }}>Something went wrong while loading the site.</h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: MUTED }}>Please try again in a moment.</p>
          {error.digest && <p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED }}>Reference: {error.digest}</p>}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "10px 20px",
              borderRadius: 999,
              border: 0,
              background: BRAND.blue,
              color: WHITE,
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
