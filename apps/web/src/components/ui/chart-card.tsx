import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

/** One plain sentence on how to read a chart: what its bars, slices, lines or colours mean. */
export function HowToRead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[13px] leading-5 text-ink/80", className)}>
      <span className="font-semibold text-ink">How to read: </span>
      {children}
    </p>
  );
}

/**
 * A chart with its title (the finding, as a statement), an optional note on the measure, a line on how to read it,
 * and the source line with its status label underneath.
 */
export function ChartCard({
  id,
  title,
  note,
  howToRead,
  source,
  status = "observed",
  children,
  className,
}: {
  /** An anchor, so the search and other pages can link straight to the chart. */
  id?: string;
  title: string;
  note?: ReactNode;
  howToRead?: ReactNode;
  source: ReactNode;
  status?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure
      id={id}
      className={cn("flex h-full scroll-mt-28 flex-col rounded-3xl border border-line bg-white p-5 sm:p-7", className)}
    >
      <figcaption>
        <p className="font-display text-lg font-bold tracking-[-0.01em] text-ink">{title}</p>
        {note && <p className="mt-1 text-[13px] leading-5 text-muted">{note}</p>}
        {howToRead && <HowToRead className="mt-2">{howToRead}</HowToRead>}
      </figcaption>
      <div className="mt-6 flex-1">{children}</div>
      <p className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-[11.5px] leading-4 text-muted">
        <StatusBadge status={status} />
        <span>{source}</span>
      </p>
    </figure>
  );
}
