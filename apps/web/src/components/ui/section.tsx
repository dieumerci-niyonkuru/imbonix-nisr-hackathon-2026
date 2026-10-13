import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export function SectionHeader({
  eyebrow,
  title,
  intro,
  accent = "text-cyan-ink",
  align = "left",
  dark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  accent?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className={`eyebrow ${accent}`}>{eyebrow}</p>}
      <h2
        className={`mt-3 text-balance font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p className={`mt-4 text-pretty text-[15px] leading-7 sm:text-base ${dark ? "text-white/70" : "text-muted"}`}>{intro}</p>
      )}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  aside,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  /** An optional summary panel shown on the right of the header on wide screens, so the band is not left half-empty. */
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const eyebrowBlock = (
    <p className="eyebrow flex items-center gap-2.5 text-cyan-ink">
      <BarsMotif />
      {eyebrow}
    </p>
  );
  if (aside) {
    // Headline on the left, a short summary on the right: the title and intro take the left column's width (no
    // max-width cap) so the two columns meet in the middle and no empty strip is left on the right.
    return (
      <section className="border-b border-line bg-gradient-to-br from-cyan-soft to-paper">
        <div className="container-page pb-14 pt-6 sm:pb-16 sm:pt-8">
          <Breadcrumbs />
          <div className="mt-10 grid items-start gap-10 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] lg:gap-14">
            <div>
              {eyebrowBlock}
              <h1 className="mt-3 text-balance font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted sm:text-lg sm:leading-8">{intro}</p>
              {children}
            </div>
            {aside}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="border-b border-line bg-gradient-to-br from-cyan-soft to-paper">
      <div className="container-page pb-14 pt-6 sm:pb-16 sm:pt-8">
        <Breadcrumbs />
        <div className="mt-10 sm:mt-12">{eyebrowBlock}</div>
        <h1 className="mt-3 max-w-4xl text-balance font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-muted sm:text-lg sm:leading-8">{intro}</p>
        {children}
      </div>
    </section>
  );
}

/**
 * A short, three-number summary shown on the right of a focus-area header: the page's answer at a glance, so the header
 * band is not left half-empty and a reader grasps the story before the first chart. Every overview page uses the same
 * card, so the three landings read as one system.
 */
export function HeroSummaryCard({
  rows,
  closer,
  label = "The short version",
}: {
  rows: { value: string; text: string }[];
  closer?: string;
  label?: string;
}) {
  return (
    <aside aria-label={label} className="rounded-2xl border border-cyan-ink/15 bg-white/70 p-6 backdrop-blur-sm sm:p-7">
      <p className="eyebrow text-cyan-ink">{label}</p>
      <ul className="mt-5 space-y-5">
        {rows.map((row, index) => (
          <li key={`${row.value}-${index}`} className="flex items-baseline gap-4">
            <span className="w-24 shrink-0 font-display text-3xl font-bold leading-none tracking-[-0.03em] text-cyan-ink">
              {row.value}
            </span>
            <span className="text-[13.5px] leading-5 text-ink/80">{row.text}</span>
          </li>
        ))}
      </ul>
      {closer && <p className="mt-5 border-t border-line pt-4 text-[13px] leading-5 text-muted">{closer}</p>}
    </aside>
  );
}

/** Three rising bars, from the small chart under the logo's tagline. */
export function BarsMotif({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex h-3 items-end gap-[2px] ${className}`} aria-hidden="true">
      <span className="h-[45%] w-[3px] rounded-full bg-cyan" />
      <span className="h-[72%] w-[3px] rounded-full bg-cyan" />
      <span className="h-full w-[3px] rounded-full bg-cyan-ink" />
    </span>
  );
}

export function Callout({ title, children, tone = "info" }: { title: string; children: ReactNode; tone?: "info" | "warn" }) {
  const styles = tone === "warn" ? "border-cyan/60 bg-cyan-soft text-ink" : "border-cyan-ink/20 bg-cyan-soft/60 text-ink";
  const body = "text-ink/85";
  return (
    <div className={`rounded-2xl border ${styles} p-5`}>
      <p className="font-display text-sm font-bold">{title}</p>
      <div className={`mt-1.5 text-sm leading-6 ${body}`}>{children}</div>
    </div>
  );
}
