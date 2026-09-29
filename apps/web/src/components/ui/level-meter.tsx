import { cn } from "@/lib/utils";

/**
 * Three rising bars, filled from the left to show a level from one to three, like the bars under the logo's
 * tagline. It is a picture of the level beside a written label, so screen readers skip it.
 */
export function LevelMeter({ filled, size = "sm" }: { filled: 1 | 2 | 3; size?: "sm" | "lg" }) {
  const heights = size === "lg" ? ["h-2", "h-3", "h-4"] : ["h-1.5", "h-2.5", "h-3.5"];
  return (
    <span className="inline-flex shrink-0 items-end gap-[3px]" aria-hidden="true">
      {heights.map((height, index) => (
        <span key={height} className={cn("w-1 rounded-[1px]", height, index < filled ? "bg-cyan-ink" : "bg-line")} />
      ))}
    </span>
  );
}
