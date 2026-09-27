import { DIMENSIONS, type IndicatorMeta } from "@/lib/indicators";
import { INK, NO_DATA, WHITE } from "@/lib/palette";

export type Scale = {
  breaks: number[];
  classes: { from: number; to: number; color: string }[];
  color: (value: number | undefined) => string;
};

export { NO_DATA };

/** Five quantile classes (six districts each). Darker = more vulnerable, whichever direction is "better". */
export function scaleFor(indicator: IndicatorMeta, values: number[], classCount = 5): Scale {
  const sorted = [...values].sort((a, b) => a - b);
  const ramp = DIMENSIONS[indicator.dimension].ramp;
  const breaks: number[] = [];
  for (let i = 1; i < classCount; i++) {
    breaks.push(sorted[Math.min(sorted.length - 1, Math.floor((i * sorted.length) / classCount))]);
  }
  const indexOf = (value: number) => {
    let index = 0;
    while (index < breaks.length && value >= breaks[index]) index++;
    return index;
  };
  const shade = (index: number) => (indicator.better === "higher" ? ramp[ramp.length - 1 - index] : ramp[index]);
  const classes = Array.from({ length: classCount }, (_, i) => {
    const members = sorted.filter((v) => indexOf(v) === i);
    return { from: members[0], to: members[members.length - 1], color: shade(i) };
  }).filter((c) => c.from !== undefined);
  return {
    breaks,
    classes,
    color: (value) => (value === undefined ? NO_DATA : shade(indexOf(value))),
  };
}

/** WCAG relative luminance of a #RRGGBB colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #RRGGBB colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Text colour for a label on a fill: navy or white, whichever contrasts more. */
export function textOn(fill: string): string {
  return contrastRatio(fill, INK) >= contrastRatio(fill, WHITE) ? INK : WHITE;
}
