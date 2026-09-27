import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { RwandaMap } from "@/components/map/rwanda-map";
import { SHAPES, VIEWBOX } from "@/lib/data";
import { BRAND } from "@/lib/palette";
import { cn } from "@/lib/utils";

/**
 * The circled arrow and bold label that close every homepage card, set like a university site. The link stretches
 * over the whole card, so the card is one large target, and the card shows the focus ring.
 */
function CardLink({ href, label, onDark = false }: { href: string; label: string; onDark?: boolean }) {
  const external = href.startsWith("http");
  const className = cn(
    "mt-auto flex items-center gap-4 pt-8 text-[17px] font-bold leading-6 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none sm:text-[18px]",
    onDark ? "text-white" : "text-ink",
  );
  const content = (
    <>
      <span
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-colors group-hover:bg-cyan group-hover:text-navy-900",
          onDark ? "bg-white/15 text-white" : "bg-royal text-white",
        )}
      >
        <ArrowRightIcon className="h-6 w-6 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
      <span className="group-hover:underline group-hover:underline-offset-4">{label}</span>
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

const CARD_FOCUS = "focus-within:ring-2 focus-within:ring-cyan focus-within:ring-offset-2";

/** A text card: a large title, a short paragraph and a circled arrow link at the foot. */
export function TextCard({
  eyebrow,
  title,
  body,
  href,
  linkLabel,
  tone = "white",
}: {
  eyebrow?: string;
  title: string;
  body: ReactNode;
  href: string;
  linkLabel: string;
  /** White cards sit on the light grey sections; grey cards on the white ones. */
  tone?: "white" | "paper";
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-md p-8 transition-shadow hover:shadow-lift sm:p-10",
        tone === "white" ? "bg-white shadow-card" : "bg-paper",
        CARD_FOCUS,
      )}
    >
      {eyebrow && <p className="eyebrow mb-3 text-royal">{eyebrow}</p>}
      <h3 className="text-balance font-display text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[34px]">
        {title}
      </h3>
      <p className="mt-5 text-pretty text-[16px] leading-7 text-ink/80 sm:text-[17px] sm:leading-8">{body}</p>
      <CardLink href={href} label={linkLabel} />
    </article>
  );
}

/**
 * An image card whose picture is data: a district map drawn in one brand ramp on navy, brighter where the value is
 * higher, with the finding as a large title over the foot of the card and a caption that says what the map shows.
 */
export function MapCard({
  area,
  title,
  source,
  caption,
  fills,
  href,
  linkLabel,
}: {
  area: string;
  title: string;
  source: string;
  caption: string;
  fills: Record<string, string>;
  href: string;
  linkLabel: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-md bg-navy-900 text-white transition-shadow hover:shadow-lift",
        CARD_FOCUS,
      )}
    >
      <p className="px-8 pt-7 text-[12px] font-semibold leading-5 text-white/70">{caption}</p>
      <div className="px-10 pt-4 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
        <RwandaMap fills={fills} title={caption} stroke={BRAND.navy} />
      </div>
      <div className="mt-auto flex flex-col px-8 pb-8 pt-6">
        <p className="eyebrow text-cyan">{area}</p>
        <h3 className="mt-3 text-balance font-display text-[26px] font-bold leading-[1.12] tracking-[-0.025em] sm:text-[30px]">
          {title}
        </h3>
        <p className="mt-3 text-[12.5px] text-white/70">Source: {source}</p>
        <CardLink href={href} label={linkLabel} onDark />
      </div>
    </article>
  );
}

/**
 * A full width banner that opens a part of the page, like a photo banner with a centred title: here the "photo" is
 * the outline of Rwanda's 30 districts, drawn faintly behind the text.
 */
export function StoryBanner({ eyebrow, title, body, id }: { eyebrow: string; title: string; body: string; id: string }) {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 text-center text-white sm:py-28" aria-labelledby={id}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg viewBox={VIEWBOX} className="h-[135%] w-auto max-w-none opacity-30">
          {SHAPES.map((shape) => (
            <path
              key={shape.slug}
              d={shape.d}
              fill={BRAND.navy}
              stroke={BRAND.cyan}
              strokeOpacity={0.55}
              strokeWidth={1}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
      <div className="container-page relative">
        <p className="eyebrow text-cyan">{eyebrow}</p>
        <h2
          id={id}
          className="mx-auto mt-4 max-w-4xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-6xl"
        >
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-pretty text-[17px] leading-8 text-white/85 sm:text-[19px] sm:leading-9">
          {body}
        </p>
      </div>
    </section>
  );
}
