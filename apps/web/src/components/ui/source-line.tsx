import { StatusBadge } from "@/components/ui/status-badge";
import { SOURCES } from "@/lib/data";

/** "Source · table · year" with the status badge, for any district indicator. */
export function SourceLine({ id, className = "" }: { id: string; className?: string }) {
  const source = SOURCES[id];
  if (!source) return null;
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-4 text-muted ${className}`}>
      <StatusBadge status={source.status} />
      <span>
        {source.source} · {source.table} · {source.year}
      </span>
    </p>
  );
}
