/**
 * A data-network that fills the hero banner behind the headline: nodes joined by thin lines, in white over the
 * brand-cyan banner, evoking the connected data IMBONIX draws together. It spans the whole width so the banner reads as
 * one scene with the Rwanda emblem on the right. It is purely decorative (aria-hidden) and kept faint, so the
 * near-black headline on cyan stays fully readable.
 */

/** Node positions and radii in the SVG's own 1400×520 space, spread across the whole banner. */
const NODES: [number, number, number][] = [
  [70, 110, 3],
  [180, 250, 5],
  [120, 410, 3],
  [300, 160, 3],
  [260, 340, 4],
  [400, 250, 3],
  [360, 90, 3],
  [480, 120, 3],
  [520, 370, 4],
  [560, 200, 3],
  [640, 300, 3],
  [700, 120, 4],
  [620, 440, 3],
  [770, 250, 3],
  [830, 110, 3],
  [880, 370, 4],
  [980, 220, 3],
  [1050, 390, 3],
  [1120, 150, 4],
  [1200, 300, 3],
  [1280, 200, 3],
  [1330, 400, 3],
];

/** Pairs of node indices joined by a line, forming a loose mesh across the banner. */
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [3, 6],
  [3, 5],
  [4, 5],
  [5, 9],
  [6, 7],
  [7, 9],
  [8, 10],
  [5, 8],
  [9, 11],
  [10, 13],
  [11, 14],
  [10, 12],
  [13, 15],
  [13, 16],
  [15, 17],
  [16, 18],
  [18, 20],
  [16, 19],
  [19, 21],
  [19, 18],
  [11, 13],
];

export function HeroBackdrop() {
  return (
    <svg
      viewBox="0 0 1400 520"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden h-full w-full text-white opacity-90 xl:block"
    >
      <g stroke="currentColor" strokeOpacity="0.2" strokeWidth="1">
        {EDGES.map(([from, to]) => (
          <line key={`${from}-${to}`} x1={NODES[from][0]} y1={NODES[from][1]} x2={NODES[to][0]} y2={NODES[to][1]} />
        ))}
      </g>
      <g fill="currentColor">
        {NODES.map(([x, y, r], index) => (
          <circle key={index} cx={x} cy={y} r={r} fillOpacity={r >= 4 ? 0.5 : 0.38} />
        ))}
      </g>
    </svg>
  );
}
