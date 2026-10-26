import type { ReactNode } from "react";

/** A titled block of explanation, used where a figure carries a longer note. */
export function ReadMoreSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 first:mt-0">
      <h3 className="font-display text-[16px] font-bold text-ink">{title}</h3>
      <div className="mt-1.5 space-y-2">{children}</div>
    </section>
  );
}
