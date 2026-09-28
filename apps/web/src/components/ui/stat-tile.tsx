import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/palette";

/** One headline number with what it means and where it comes from. The number is the chart. */
export function StatTile({
  value,
  label,
  source,
  status = "observed",
  accent = BRAND.navy,
  detail,
  className,
}: {
  value: string;
  label: ReactNode;
  source: string;
  status?: string;
  accent?: string;
  detail?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card",
        className,
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden="true" />
      <p className="font-display text-[2.4rem] font-semibold leading-none tracking-[-0.03em] text-ink">{value}</p>
      <p className="mt-3 text-[13.5px] leading-5 text-ink/80">{label}</p>
      {detail && <p className="mt-1 text-[12px] text-muted">{detail}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-[11px] text-muted">
        <StatusBadge status={status} />
        <span>{source}</span>
      </div>
    </article>
  );
}
