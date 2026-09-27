import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Placeholder block for content that is loading or not yet available. Decorative, so hidden from screen readers. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-line/70", className)} {...props} />;
}
