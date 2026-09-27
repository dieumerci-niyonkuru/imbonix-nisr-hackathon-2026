import type { FocusEvent, MouseEvent } from "react";
import { SHAPES, VIEWBOX } from "@/lib/data";
import { INK, NO_DATA, WHITE } from "@/lib/palette";

type HoverEvent = MouseEvent<SVGPathElement> | FocusEvent<SVGPathElement>;

/** Label nudges for the small, crowded districts around Kigali (SVG units). */
const LABEL_TWEAKS: Record<string, { dx?: number; dy?: number; size?: number }> = {
  nyarugenge: { dx: -6, dy: -8, size: 11 },
  kicukiro: { dx: 10, dy: 8, size: 11 },
  gasabo: { dy: -6 },
  kamonyi: { dx: -18, dy: 16 },
};

export type RwandaMapProps = {
  /** Fill colour for each district slug. */
  fills: Record<string, string>;
  /** Accessible name for the whole map. */
  title: string;
  selected?: string;
  hovered?: string;
  /** Outline one district in a static locator map. */
  highlight?: string;
  onSelect?: (slug: string) => void;
  onHover?: (slug: string | undefined, event?: HoverEvent) => void;
  describe?: (slug: string) => string;
  showNames?: boolean;
  className?: string;
};

/** Choropleth of Rwanda's 30 districts. Works as a static map (server) or an interactive one (client). */
export function RwandaMap({
  fills,
  title,
  selected,
  hovered,
  highlight,
  onSelect,
  onHover,
  describe,
  showNames = false,
  className = "",
}: RwandaMapProps) {
  const interactive = Boolean(onSelect);
  const outline = (slug?: string) => SHAPES.find((s) => s.slug === slug);
  const selectedShape = outline(selected ?? highlight);
  const hoveredShape = hovered && hovered !== selected ? outline(hovered) : undefined;

  return (
    <svg viewBox={VIEWBOX} className={`block h-auto w-full ${className}`} role={interactive ? "group" : "img"} aria-label={title}>
      <title>{title}</title>
      <g>
        {SHAPES.map((shape) => (
          <path
            key={shape.slug}
            d={shape.d}
            fill={fills[shape.slug] ?? NO_DATA}
            stroke={WHITE}
            strokeWidth={1.3}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className={`map-shape ${interactive ? "cursor-pointer outline-none" : ""}`}
            opacity={hovered && hovered !== shape.slug && interactive ? 0.82 : 1}
            tabIndex={interactive ? 0 : undefined}
            role={interactive ? "button" : undefined}
            aria-label={interactive ? (describe ? describe(shape.slug) : shape.name) : undefined}
            aria-pressed={interactive ? selected === shape.slug : undefined}
            onClick={onSelect ? () => onSelect(shape.slug) : undefined}
            onKeyDown={
              onSelect
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(shape.slug);
                    }
                  }
                : undefined
            }
            onMouseMove={onHover ? (event) => onHover(shape.slug, event) : undefined}
            onMouseLeave={onHover ? () => onHover(undefined) : undefined}
            onFocus={onHover ? (event) => onHover(shape.slug, event) : undefined}
            onBlur={onHover ? () => onHover(undefined) : undefined}
          >
            {!interactive && <title>{describe ? describe(shape.slug) : shape.name}</title>}
          </path>
        ))}
      </g>
      {hoveredShape && (
        <path
          d={hoveredShape.d}
          fill="none"
          stroke={INK}
          strokeWidth={1.6}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
      )}
      {selectedShape && (
        <path
          d={selectedShape.d}
          fill="none"
          stroke={INK}
          strokeWidth={2.8}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
      )}
      {showNames &&
        SHAPES.map((shape) => (
          <text
            key={shape.slug}
            x={shape.cx + (LABEL_TWEAKS[shape.slug]?.dx ?? 0)}
            y={shape.cy + (LABEL_TWEAKS[shape.slug]?.dy ?? 0)}
            textAnchor="middle"
            dominantBaseline="middle"
            pointerEvents="none"
            className="select-none font-body max-sm:hidden"
            fontSize={LABEL_TWEAKS[shape.slug]?.size ?? 15}
            fontWeight={700}
            fill={INK}
            stroke={WHITE}
            strokeWidth={3.2}
            strokeOpacity={0.85}
            paintOrder="stroke"
          >
            {shape.name}
          </text>
        ))}
    </svg>
  );
}
