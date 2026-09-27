"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Shown when a page fails to render. The header and footer stay, so people can still move around the site. */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-start justify-center py-20" role="alert">
      <p className="eyebrow text-cyan-ink">Something went wrong</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-ink">This page could not be shown.</h1>
      <p className="mt-3 max-w-lg text-[15px] leading-7 text-muted">
        The data behind it has not changed. Please try again; if the problem continues, the other pages still work.
      </p>
      {error.digest && <p className="mt-2 font-mono text-[12px] text-muted">Reference: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </section>
  );
}
