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

export type DownloadData = {
  filename: string;
  csv: string;
};

function DownloadButton({ data }: { data: DownloadData }) {
  const handleClick = () => {
    const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[11.5px] font-bold text-cyan-ink ring-1 ring-line transition-colors hover:bg-cyan hover:text-ink"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M8 1a.75.75 0 0 1 .75.75v6.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V1.75A.75.75 0 0 1 8 1ZM2.75 10a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A2.25 2.25 0 0 1 11.75 14.5h-7.5A2.25 2.25 0 0 1 2 12.25v-1.5a.75.75 0 0 1 .75-.75Z" />
      </svg>
      Download CSV
    </button>
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
  downloadData,
}: {
  id?: string;
  title: string;
  note?: ReactNode;
  howToRead?: ReactNode;
  source: ReactNode;
  status?: string;
  children: ReactNode;
  className?: string;
  downloadData?: DownloadData;
}) {
  return (
    <figure
      id={id}
      className={cn(
        "scroll-reveal flex h-full scroll-mt-36 flex-col rounded-3xl border border-line bg-white p-5 sm:p-7",
        className,
      )}
    >
      <figcaption>
        <p className="font-display text-lg font-bold tracking-[-0.01em] text-ink">{title}</p>
        {note && <p className="mt-1 text-[13px] leading-5 text-muted">{note}</p>}
        {howToRead && <HowToRead className="mt-2">{howToRead}</HowToRead>}
      </figcaption>
      <div className="mt-6 flex-1">{children}</div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line pt-4">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] leading-4 text-muted">
          <StatusBadge status={status} />
          <span className="hidden h-3.5 w-px bg-line sm:block" aria-hidden="true" />
          <span>{source}</span>
        </p>
        {downloadData && <DownloadButton data={downloadData} />}
      </div>
    </figure>
  );
}
