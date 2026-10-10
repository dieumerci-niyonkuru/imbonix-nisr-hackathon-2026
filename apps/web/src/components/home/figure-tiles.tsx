import { cn } from "@/lib/utils";

/** One headline figure: the number, what it counts and where it comes from. */
export type FigureTile = { value: string; label: string; source: string };

/**
 * Headline figures as a grid of plain tiles, as Rwanda's national sites show key numbers: a large cyan number over a
 * short label, thin rules between the tiles and the source under each.
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
    <section className="bg-white py-12 sm:py-20" aria-labelledby={id}>
      <div className="container-page">
        <p className="eyebrow text-cyan-ink">{eyebrow}</p>
        <h2
          id={id}
          className="mt-3 max-w-3xl text-balance font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px] sm:leading-8">{intro}</p>
        <dl
          className={cn(
            "mt-10 grid border-l border-t border-line sm:grid-cols-2",
            columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
          )}
        >
          {tiles.map((tile) => (
            <div key={tile.label} className="flex flex-col border-b border-r border-line px-7 py-8 sm:px-8 sm:py-10">
              <dt className="order-2 mt-3 text-pretty text-[16px] leading-6 text-ink">{tile.label}</dt>
              <dd className="order-1 font-display text-[40px] font-bold leading-none tracking-[-0.03em] text-cyan-ink sm:text-[46px]">
                {tile.value}
              </dd>
              <dd className="order-3 mt-3 text-[12.5px] leading-5 text-muted">{tile.source}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
