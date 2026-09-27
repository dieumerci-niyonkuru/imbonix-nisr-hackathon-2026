/**
 * Every IMBONIX colour, derived from the logo: its navy, blue, azure and cyan, and the gold of its sun.
 * Import colours from here rather than writing hex values in components, so the palette stays in one place.
 *
 * Data scales were generated in OKLCH from the logo hues by scripts/brand/generate_palette.py and checked with a
 * palette validator: every sequential ramp reads light to dark with visible steps, its lightest step
 * clears a white surface at 2:1, and navy or white text reaches 4.5:1 on every step.
 */

/** The logo's own colours. */
export const BRAND = {
  navy: "#002454",
  navyDeep: "#001A3F",
  blue: "#0060B4",
  azure: "#0090E4",
  cyan: "#00C0D8",
  gold: "#F8B828",
} as const;

/** Text and surfaces, tinted towards the logo navy. */
export const INK = BRAND.navy;
export const MUTED = "#53647F";
export const LINE = "#DCE4EF";
export const PAPER = "#F4F7FB";
export const WHITE = "#FFFFFF";
/** Districts or sectors with no value: lighter than the first step of every ramp. */
export const NO_DATA = "#E6EBF2";
/** Gold for text on light backgrounds (the sun colour itself is too light to read there). */
export const SUN_INK = "#8A5A00";

/** Light to dark. Darker always means more vulnerable on that measure. */
export const RAMPS = {
  /** From the logo's gold sun to bronze: shocks and hazards, and warnings. */
  gold: ["#D7A94F", "#BE8202", "#9B5F02", "#743F03", "#4F2200"],
  /** The logo blue. */
  blue: ["#8CB5E3", "#4F93DC", "#046FC7", "#024F90", "#01315D"],
  /** The logo cyan. */
  cyan: ["#66C0D2", "#02A0B9", "#097C91", "#01586A", "#013744"],
  /** The logo navy, on its indigo side: poverty. */
  navy: ["#A2B1D2", "#788EC1", "#536CA9", "#344B85", "#1B2D5D"],
  /** The logo azure. */
  azure: ["#79BAE4", "#2B99D5", "#0677AB", "#01547B", "#01344E"],
  /** A muted steel blue. */
  steel: ["#A6B3C1", "#7F91A4", "#5B7188", "#395169", "#1C3249"],
  /** The teal side of the logo cyan. */
  teal: ["#70C1C2", "#06A3A5", "#007F80", "#015A5B", "#013839"],
  /** Neutral slate, for counts such as population. */
  slate: ["#ACB2B9", "#899098", "#686F79", "#474F59", "#2A313A"],
} as const;

/** The four core dimensions' identity colours, validated together as a categorical set. */
export const CORE = {
  gold: "#C28403",
  blue: BRAND.blue,
  cyan: "#00A0B8",
  navy: "#3F4F99",
} as const;

/** Two groups compared side by side (women and men, for example). Validated as a pair. */
export const PAIR = { a: CORE.gold, b: BRAND.blue } as const;

/** FinScope access strand, from the most formal service to none: logo navy, blue, cyan, then gold for exclusion. */
export const STRAND = {
  banked: BRAND.navy,
  otherFormal: BRAND.blue,
  informalOnly: CORE.cyan,
  excluded: CORE.gold,
} as const;

/** Positive and negative values around a neutral grey midpoint: blue below zero, gold above. Strong to light. */
export const DIVERGING = {
  negative: [RAMPS.blue[3], RAMPS.blue[1], RAMPS.blue[0]],
  neutral: "#EEF1F5",
  positive: [RAMPS.gold[3], RAMPS.gold[1], RAMPS.gold[0]],
} as const;

/** Four ordered steps from good to worst, e.g. on time to very late. */
export const SEVERITY = [RAMPS.gold[0], RAMPS.gold[1], RAMPS.gold[2], RAMPS.gold[3]] as const;

/** Quadrants of a two-measure scatter: both worse, one worse each way, neither. */
export const QUADRANTS = {
  both: "#8A5402",
  first: "#CC9214",
  second: "#0B6FC4",
  neither: "#98A1AE",
} as const;

/**
 * Colours per dimension: `accent` for bars, borders and swatches; `ink` for text (4.5:1 on white and paper);
 * `ramp` for maps and other sequential scales.
 */
export const DIMENSION_COLORS = {
  poverty: { accent: CORE.navy, ink: RAMPS.navy[2], ramp: RAMPS.navy },
  finance: { accent: CORE.blue, ink: RAMPS.blue[2], ramp: RAMPS.blue },
  nutrition: { accent: CORE.cyan, ink: RAMPS.cyan[2], ramp: RAMPS.cyan },
  shocks: { accent: CORE.gold, ink: RAMPS.gold[2], ramp: RAMPS.gold },
  digital: { accent: RAMPS.azure[2], ink: RAMPS.azure[2], ramp: RAMPS.azure },
  work: { accent: RAMPS.steel[2], ink: RAMPS.steel[2], ramp: RAMPS.steel },
  health: { accent: RAMPS.teal[2], ink: "#00797A", ramp: RAMPS.teal },
  people: { accent: RAMPS.slate[2], ink: RAMPS.slate[2], ramp: RAMPS.slate },
} as const;
