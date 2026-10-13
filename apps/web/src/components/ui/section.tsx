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

/** One headline figure for the hero strip: a big number and a short label. */
export type HeroStat = { value: string; label: string };

/**
 * The top of every page: breadcrumb, a short eyebrow, the page's question as the title, one line of context, and — when
 * the page has them — a compact row of headline figures. Kept deliberately short so a reader sees what the page is about
 * at a glance, the same way on every page, without a tall block of text before the content.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  stats,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  /** A short row of headline figures under the intro, so the page's answer is clear without a tall panel. */
  stats?: HeroStat[];
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-gradient-to-br from-cyan-soft to-paper">
      <div className="container-page pb-9 pt-5 sm:pb-11 sm:pt-6">
        <Breadcrumbs />
        <p className="eyebrow mt-7 flex items-center gap-2.5 text-cyan-ink sm:mt-8">
          <BarsMotif />
          {eyebrow}
        </p>
        <h1 className="mt-2.5 max-w-4xl text-balance font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-[15px] leading-6 text-muted sm:text-base sm:leading-7">{intro}</p>
        {stats && stats.length > 0 && (
          <dl className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-line pt-5 sm:gap-x-12">
            {stats.map((stat, index) => (
              <div key={`${stat.value}-${index}`} className="flex items-baseline gap-2.5">
                <dd className="font-display text-[26px] font-bold leading-none tracking-[-0.03em] text-cyan-ink sm:text-[28px]">
                  {stat.value}
                </dd>
                <dt className="max-w-[20ch] text-[13px] leading-4 text-ink/75">{stat.label}</dt>
              </div>
            ))}
          </dl>
        )}
        {children}
      </div>
    </section>
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
