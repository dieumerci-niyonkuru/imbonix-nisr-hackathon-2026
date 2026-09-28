import { DISTRICTS, reference, SOURCES } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { meta } from "@/lib/indicators";
import { BRAND, CYAN_INK, INK, LINE, MUTED, QUADRANTS, WHITE } from "@/lib/palette";

const W = 640;
const H = 440;
const PAD = { left: 52, right: 18, top: 18, bottom: 48 };

export type QuadrantLabels = { highHigh: string; highLow: string; lowHigh: string };

const FINANCE_QUADRANTS: QuadrantLabels = {
  highHigh: "Poorer and more excluded",
  highLow: "Poorer, but formally included",
  lowHigh: "Less poor, more excluded",
};

/** Unit shown in an axis title, from the indicator's source unit. */
function unitLabel(id: string) {
  const unit = SOURCES[id]?.unit ?? "%";
  return unit === "%" ? "%" : unit;
}

/** Two district measures against each other, split into quadrants at the reference values. */
export function DistrictScatter({
  xId,
  yId,
  label = [],
  quadrants = FINANCE_QUADRANTS,
}: {
  xId: string;
  yId: string;
  label?: string[];
  quadrants?: QuadrantLabels;
}) {
  const x = meta(xId);
  const y = meta(yId);
  const xRef = reference(xId);
  const yRef = reference(yId);
  const points = DISTRICTS.filter((d) => d.values[xId] && d.values[yId]).map((d) => ({
    slug: d.slug,
    name: d.name,
    x: d.values[xId]!.v,
    y: d.values[yId]!.v,
  }));
  const xMax = Math.ceil((Math.max(...points.map((p) => p.x)) * 1.08) / 10) * 10;
  const yMax = Math.ceil((Math.max(...points.map((p) => p.y)) * 1.12) / 5) * 5;
  const yMaxScale = yMax > 30 ? Math.ceil(yMax / 10) * 10 : yMax;
  const sx = (v: number) => PAD.left + (v / xMax) * (W - PAD.left - PAD.right);
  const sy = (v: number) => H - PAD.bottom - (v / yMaxScale) * (H - PAD.top - PAD.bottom);
  const xTicks = Array.from({ length: xMax / 10 + 1 }, (_, i) => i * 10);
  const yStep = yMax > 30 ? 10 : 5;
  const yTicks = Array.from({ length: yMaxScale / yStep + 1 }, (_, i) => i * yStep);
  const tone = (p: { x: number; y: number }) =>
    p.x >= xRef.value && p.y >= yRef.value
      ? QUADRANTS.both
      : p.x >= xRef.value
        ? QUADRANTS.first
        : p.y >= yRef.value
          ? QUADRANTS.second
          : QUADRANTS.neither;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${x.short} against ${y.short}, by district`}
      >
        <rect
          x={sx(xRef.value)}
          y={PAD.top}
          width={W - PAD.right - sx(xRef.value)}
          height={sy(yRef.value) - PAD.top}
          fill={QUADRANTS.both}
          opacity={0.05}
        />
        {xTicks.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} x2={sx(t)} y1={PAD.top} y2={H - PAD.bottom} stroke={LINE} />
            <text x={sx(t)} y={H - PAD.bottom + 18} textAnchor="middle" fontSize={11} fill={MUTED}>
              {t}%
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={PAD.left} x2={W - PAD.right} y1={sy(t)} y2={sy(t)} stroke={LINE} />
            <text x={PAD.left - 8} y={sy(t) + 4} textAnchor="end" fontSize={11} fill={MUTED}>
              {t}%
            </text>
          </g>
        ))}
        <line x1={sx(xRef.value)} x2={sx(xRef.value)} y1={PAD.top} y2={H - PAD.bottom} stroke={INK} strokeDasharray="4 4" />
        <line x1={PAD.left} x2={W - PAD.right} y1={sy(yRef.value)} y2={sy(yRef.value)} stroke={INK} strokeDasharray="4 4" />
        <text x={W - PAD.right - 6} y={PAD.top + 14} textAnchor="end" fontSize={11} fontWeight={700} fill={BRAND.navy}>
          {quadrants.highHigh}
        </text>
        <text x={W - PAD.right - 6} y={H - PAD.bottom - 8} textAnchor="end" fontSize={11} fontWeight={700} fill={CYAN_INK}>
          {quadrants.highLow}
        </text>
        <text x={PAD.left + 6} y={PAD.top + 14} fontSize={11} fontWeight={700} fill={CYAN_INK}>
          {quadrants.lowHigh}
        </text>
        {points.map((p) => (
          <g key={p.slug}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={6.5} fill={tone(p)} stroke={WHITE} strokeWidth={2} />
            <circle cx={sx(p.x)} cy={sy(p.y)} r={12} fill="transparent">
              <title>{`${p.name}: ${x.short} ${formatValue(x, p.x)}, ${y.short} ${formatValue(y, p.y)}`}</title>
            </circle>
            {label.includes(p.slug) && (
              <text
                x={sx(p.x) + 9}
                y={sy(p.y) + 4}
                fontSize={11.5}
                fontWeight={700}
                fill={INK}
                stroke={WHITE}
                strokeWidth={3}
                paintOrder="stroke"
              >
                {p.name}
              </text>
            )}
          </g>
        ))}
        <text x={(W + PAD.left) / 2} y={H - 8} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK}>
          {x.short} ({unitLabel(xId)})
        </text>
        <text
          transform={`translate(14 ${(H - PAD.bottom + PAD.top) / 2}) rotate(-90)`}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill={INK}
        >
          {y.short} ({unitLabel(yId)})
        </text>
      </svg>
      <figcaption className="mt-2 text-[11.5px] leading-5 text-muted">
        Dashed lines: {xRef.label} {formatValue(x, xRef.value)} and {formatValue(y, yRef.value)}. Hover a dot for its values. A
        comparison of districts: it describes places, not households.
      </figcaption>
    </figure>
  );
}
