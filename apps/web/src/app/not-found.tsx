import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="eyebrow text-royal">Page not found</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-ink">We couldn&apos;t find that page.</h1>
      <p className="mt-3 max-w-lg text-[15px] leading-7 text-muted">
        It may have moved. The district map and Find your district are good places to start.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="default">
          <Link href="/map">Open the district map</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/districts">Browse districts</Link>
        </Button>
      </div>
    </section>
  );
}
