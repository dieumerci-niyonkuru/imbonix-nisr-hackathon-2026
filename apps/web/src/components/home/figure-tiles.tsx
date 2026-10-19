import { cn } from "@/lib/utils";

/** One headline figure: the number, what it counts and where it comes from. */
export type FigureTile = { value: string; label: string; source: string };

/**
 * Headline figures as a grid of cards: a large cyan number over a short label, with the source set apart beneath. Each
 * card lifts a little and grows a thin brand accent along its top on hover, so the figures feel considered and alive —
 * while staying to the site's two colours.
 */
export function FigureTiles({
  eyebrow,
  title,
  intro,
  tiles,
  id,
  columns = 3,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  tiles: FigureTile[];
  id: string;
  /** Tiles per row on wide screens: three for six figures, four for four. */
  columns?: 3 | 4;
}) {
  return (
    <section className="bg-white py-10 sm:py-14" aria-labelledby={id}>
      <div className="container-page">
        <p className="eyebrow text-cyan-ink">{eyebrow}</p>
        <h2
          id={id}
          className="mt-3 max-w-3xl text-balance font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px] sm:leading-8">{intro}</p>
        <dl className={cn("mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan/50 hover:shadow-lift sm:p-7"
            >
              {/* A thin brand accent that sweeps across the top on hover. */}
              <span
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-cyan to-cyan-ink transition-transform duration-300 ease-out group-hover:scale-x-100"
                aria-hidden="true"
              />
              <dd className="tabular order-1 font-display text-[42px] font-bold leading-none tracking-[-0.03em] text-cyan-ink sm:text-[46px]">
                {tile.value}
              </dd>
              <dt className="order-2 mt-3 text-pretty text-[15.5px] leading-6 text-ink">{tile.label}</dt>
              <dd className="order-3 mt-auto border-t border-line pt-4 text-[12px] leading-5 text-muted">{tile.source}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
