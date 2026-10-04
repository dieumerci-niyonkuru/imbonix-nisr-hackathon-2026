import { PresentationChartLineIcon } from "@heroicons/react/24/outline";
import { SHAPES, VIEWBOX } from "@/lib/data";
import { BRAND, CYAN_INK, LINE, WHITE } from "@/lib/palette";
import { cn } from "@/lib/utils";

/** How many nearest districts each district's node joins in the network drawn over the map. */
const NEIGHBOURS = 2;

/** Lines between each district's centre and its nearest neighbours, each pair once. */
function networkEdges() {
  const centres = SHAPES.map((shape) => ({ slug: shape.slug, x: Number(shape.cx), y: Number(shape.cy) }));
  const edges = new Map<string, { x1: number; y1: number; x2: number; y2: number }>();
  for (const centre of centres) {
    const nearest = centres
      .filter((other) => other.slug !== centre.slug)
      .sort(
        (first, second) =>
          Math.hypot(first.x - centre.x, first.y - centre.y) - Math.hypot(second.x - centre.x, second.y - centre.y),
      )
      .slice(0, NEIGHBOURS);
    for (const other of nearest) {
      const key = [centre.slug, other.slug].sort().join(":");
      edges.set(key, { x1: centre.x, y1: centre.y, x2: other.x, y2: other.y });
    }
  }
  return { centres, edges: [...edges.values()] };
}

/**
 * The site's emblem, drawn like the cover of a Rwandan national bulletin: the 30 districts of Rwanda as one map, a
 * network joining each district to its neighbours, and a white badge with a chart at its heart. It is decoration, so
 * screen readers skip it. `tone` sets it on white (a cyan map) or on the cyan banner (a white, see-through map).
 */
export function RwandaEmblem({ tone = "light", className }: { tone?: "light" | "cyan"; className?: string }) {
  const { centres, edges } = networkEdges();
  const onCyan = tone === "cyan";
  return (
    <div aria-hidden="true" className={cn("pointer-events-none relative select-none", className)}>
      <svg viewBox={VIEWBOX} className="block h-auto w-full overflow-visible">
        {/* Rings behind the map, as on the bulletin covers. */}
        {[300, 390, 470].map((radius) => (
          <circle
            key={radius}
            cx={500}
            cy={440}
            r={radius}
            fill="none"
            stroke={onCyan ? WHITE : LINE}
            strokeOpacity={onCyan ? 0.25 : 0.9}
            strokeWidth={radius === 390 ? 18 : 3}
          />
        ))}
        {SHAPES.map((shape) => (
          <path
            key={shape.slug}
            d={shape.d}
            fill={onCyan ? WHITE : BRAND.cyan}
            fillOpacity={onCyan ? 0.2 : 1}
            stroke={WHITE}
            strokeOpacity={onCyan ? 0.55 : 0.8}
            strokeWidth={1.2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {edges.map((edge) => (
          <line
            key={`${edge.x1},${edge.y1},${edge.x2},${edge.y2}`}
            {...edge}
            stroke={WHITE}
            strokeOpacity={0.6}
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {centres.map((centre) => (
          <circle
            key={centre.slug}
            cx={centre.x}
            cy={centre.y}
            r={9}
            fill={WHITE}
            fillOpacity={0.95}
            stroke={onCyan ? WHITE : CYAN_INK}
            strokeOpacity={0.35}
            strokeWidth={6}
          />
        ))}
      </svg>
      {/* The badge: a white disc with a grey ring and the chart, centred on the map. */}
      <div className="absolute left-1/2 top-1/2 flex aspect-square w-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lift ring-[10px] ring-white/70">
        <div className="flex aspect-square w-[78%] items-center justify-center rounded-full bg-paper ring-4 ring-line">
          <PresentationChartLineIcon className="h-[58%] w-[58%] stroke-[1.6] text-cyan-ink" />
        </div>
      </div>
    </div>
  );
}
