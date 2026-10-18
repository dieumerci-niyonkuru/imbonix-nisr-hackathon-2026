"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Shown when a page fails to render. The header and footer stay, so people can still move around the site.
 *
 * A stale build (a code chunk that changed name after a new version shipped) throws while loading and cannot be fixed
 * by re-rendering, so that kind of error reloads the page once to fetch the new build, and "Try again" reloads in full.
 * A genuine render error is left to React's own retry via reset(), which can recover without a full reload.
 */

const RELOAD_AT = "imbonix:reloaded-at";
const RELOAD_GUARD_MS = 10_000;

function looksLikeStaleBuild(error: Error): boolean {
  const text = `${error.name} ${error.message}`;
  return /ChunkLoadError|Loading chunk|Loading CSS chunk|dynamically imported module|Importing a module script failed|Failed to fetch dynamically/i.test(
    text,
  );
}

export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const stale = looksLikeStaleBuild(error);

  useEffect(() => {
    console.error(error);
    if (stale && typeof window !== "undefined") {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_AT) ?? 0);
        if (Date.now() - last >= RELOAD_GUARD_MS) {
          sessionStorage.setItem(RELOAD_AT, String(Date.now()));
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }, [error, stale]);

  const retry = () => {
    if (stale && typeof window !== "undefined") {
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
    <section className="container-page flex min-h-[60vh] flex-col items-start justify-center py-20" role="alert">
      <p className="eyebrow text-cyan-ink">Something went wrong</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-ink">This page could not be shown.</h1>
      <p className="mt-3 max-w-lg text-[15px] leading-7 text-muted">
        The data behind it has not changed. Please try again; if the problem continues, the other pages still work.
      </p>
      {error.digest && <p className="mt-2 font-mono text-[12px] text-muted">Reference: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={retry}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </section>
  );
}
