import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

/** A chart with its title, an optional note, and the source line with its status label underneath. */
export function ChartCard({
  title,
  note,
  source,
  status = "observed",
  children,
  className,
}: {
  title: string;
  note?: ReactNode;
  source: ReactNode;
  status?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("flex h-full flex-col rounded-3xl border border-line bg-white p-5 sm:p-7", className)}>
      <figcaption>
        <p className="font-display text-lg font-bold tracking-[-0.01em] text-ink">{title}</p>
        {note && <p className="mt-1 text-[13px] leading-5 text-muted">{note}</p>}
      </figcaption>
      <div className="mt-6 flex-1">{children}</div>
      <p className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-[11.5px] leading-4 text-muted">
        <StatusBadge status={status} />
        <span>{source}</span>
      </p>
    </figure>
  );
}
