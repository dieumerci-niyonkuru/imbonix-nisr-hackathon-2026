/**
 * A faint data-network that sits behind the hero headline: nodes joined by thin lines, in white over the brand-cyan
 * banner, evoking connected data. It is purely decorative (aria-hidden) and left-weighted, so it fades out towards the
 * Rwanda emblem on the right and never competes with the headline, which keeps its near-black text on cyan.
 */

/** Node positions and radii in the SVG's own 920×470 space; kept to the left two-thirds so the right stays clear. */
const NODES: [number, number, number][] = [
  [60, 110, 3],
  [150, 150, 3],
  [170, 250, 5],
  [110, 380, 3],
  [280, 150, 3],
  [250, 320, 4],
  [360, 80, 3],
  [390, 240, 3],
  [300, 410, 3],
  [470, 120, 3],
  [500, 350, 4],
  [540, 190, 3],
  [580, 70, 4],
  [610, 300, 3],
];

/** Pairs of node indices joined by a line, forming a loose mesh. */
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [1, 4],
  [2, 5],
  [4, 6],
  [4, 7],
  [5, 7],
  [5, 8],
  [7, 9],
  [7, 10],
  [9, 11],
  [11, 12],
  [10, 13],
  [11, 13],
  [9, 12],
];

export function HeroBackdrop() {
  return (
    <svg
      viewBox="0 0 920 470"
      preserveAspectRatio="xMinYMid slice"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden h-full w-full text-white opacity-80 xl:block"
    >
      <g stroke="currentColor" strokeOpacity="0.18" strokeWidth="1">
        {EDGES.map(([from, to]) => (
          <line key={`${from}-${to}`} x1={NODES[from][0]} y1={NODES[from][1]} x2={NODES[to][0]} y2={NODES[to][1]} />
        ))}
      </g>
      <g fill="currentColor">
        {NODES.map(([x, y, r], index) => (
          <circle key={index} cx={x} cy={y} r={r} fillOpacity={r >= 5 ? 0.5 : 0.32} />
        ))}
      </g>
    </svg>
  );
}
