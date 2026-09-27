import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a page's server content streams in. Mirrors the common page layout: a hero, then a grid of cards. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading the page…</span>
      <section className="border-b border-line bg-white">
        <div className="container-page space-y-4 py-10 sm:py-12">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-full max-w-2xl" />
          <Skeleton className="h-10 w-3/4 max-w-xl" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </section>
      <section className="container-page grid gap-4 py-10 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-line bg-white p-6">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </section>
    </div>
  );
}
