/**
 * Every IMBONIX colour. The website uses three brand colours only, on white and light neutral backgrounds:
 *
 * - deep navy #022657, the main colour: navigation, headings, strong text, the footer;
 * - bright cyan #02A5DC, the action colour: buttons, active states, highlights, and text on navy;
 * - medium blue #0461B1, the supporting colour: links on white, secondary elements and data.
 *
 * Everything else is a lighter or darker step of one of them, plus a neutral blue grey for missing data, baselines
 * and anything that should recede. The logo keeps its own colours. Import colours from here rather than writing hex
 * values in components, so the palette stays in one place.
 *
 * The ramps were generated in OKLCH from the three brand hues by scripts/brand/generate_palette.py: each reads light
 * to dark with visible steps, its lightest step clears a white surface at 2:1, and navy or white text reaches 4.5:1
 * on every step. Bright cyan is too light for text on white (2.8:1), so text on light backgrounds uses CYAN_INK or
 * the medium blue, and cyan buttons carry navy text (5.2:1).
 *
 * Categorical sets (the access strand, two groups compared, chart categories) use navy, medium blue, cyan and the
 * neutral grey. With three blues they are told apart mainly by lightness: they pass the colour vision check (every
 * neighbour at least 10 ΔE apart for protan, deutan and tritan vision), and every chart that uses them has a legend
 * and value labels.
 */

/** The three brand colours, with a deeper navy for the darkest surfaces. */
export const BRAND = {
  navy: "#022657",
  navyDeep: "#001436",
  blue: "#0461B1",
  cyan: "#02A5DC",
} as const;

/** Text and surfaces, tinted towards the brand navy. */
export const INK = BRAND.navy;
export const MUTED = "#53647F";
export const LINE = "#DCE4EF";
export const PAPER = "#F4F7FB";
export const WHITE = "#FFFFFF";
/** Districts or sectors with no value: lighter than the first step of every ramp. */
export const NO_DATA = "#E6EBF2";
/** Cyan for text on light backgrounds (5.9:1 on white); the brand cyan itself is for fills and dark backgrounds. */
export const CYAN_INK = "#046C92";
/**
 * The brand cyan one small step deeper, for data marks on white and paper: bars, dots and slices need 3:1 against
 * their background to be seen, and the brand cyan itself reaches 2.8:1. Buttons and highlights keep the brand cyan.
 */
export const CHART_CYAN = "#0B9ACD";

/** Light to dark. Darker always means more vulnerable on that measure. */
export const RAMPS = {
  /** The brand navy: poverty. */
  navy: ["#A2B7D6", "#7595C5", "#4C74AD", "#28528E", "#0B3164"],
  /** The brand medium blue: financial access and work. */
  blue: ["#91B9E8", "#5597E1", "#1474CD", "#005399", "#013362"],
  /** The brand cyan: nutrition, digital readiness and health. */
  cyan: ["#7EBEDE", "#2FA0D0", "#017EA8", "#035A7A", "#01384D"],
  /** A neutral blue grey on the navy hue: shocks, population counts, baselines. */
  steel: ["#AEB6C3", "#8895A7", "#65748B", "#43536C", "#24334A"],
} as const;

/** Mid tones for data marks (bars, dots, swatches), one per brand colour plus the neutral. */
export const CORE = {
  navy: RAMPS.navy[3],
  blue: BRAND.blue,
  cyan: CHART_CYAN,
  steel: RAMPS.steel[2],
} as const;

/** Two groups compared side by side (women and men, for example): cyan and navy. */
export const PAIR = { a: CORE.cyan, b: BRAND.navy } as const;

/** FinScope access strand, from the most formal service to none: navy, blue, cyan, then grey for exclusion. */
export const STRAND = {
  banked: BRAND.navy,
  otherFormal: BRAND.blue,
  informalOnly: CORE.cyan,
  excluded: RAMPS.steel[1],
} as const;

/** Positive and negative values around a neutral grey midpoint: navy below zero, cyan above. Strong to light. */
export const DIVERGING = {
  negative: [RAMPS.navy[3], RAMPS.navy[1], RAMPS.navy[0]],
  neutral: "#EEF1F5",
  positive: [RAMPS.cyan[3], RAMPS.cyan[1], RAMPS.cyan[0]],
} as const;

/** Four ordered steps from good to worst, e.g. on time to very late: light to dark blue. */
export const SEVERITY = [RAMPS.blue[0], RAMPS.blue[1], RAMPS.blue[2], RAMPS.blue[4]] as const;

/** Quadrants of a two-measure scatter: both worse, one worse each way, neither. */
export const QUADRANTS = {
  both: BRAND.navy,
  first: BRAND.blue,
  second: CORE.cyan,
  neither: RAMPS.steel[0],
} as const;

/**
 * Colours per dimension: `accent` for bars, borders and swatches; `ink` for text (4.5:1 on white and paper);
 * `ramp` for maps and other sequential scales.
 */
export const DIMENSION_COLORS = {
  poverty: { accent: CORE.navy, ink: RAMPS.navy[3], ramp: RAMPS.navy },
  finance: { accent: CORE.blue, ink: BRAND.blue, ramp: RAMPS.blue },
  nutrition: { accent: CORE.cyan, ink: CYAN_INK, ramp: RAMPS.cyan },
  shocks: { accent: CORE.steel, ink: RAMPS.steel[3], ramp: RAMPS.steel },
  digital: { accent: RAMPS.cyan[2], ink: RAMPS.cyan[3], ramp: RAMPS.cyan },
  work: { accent: RAMPS.blue[2], ink: RAMPS.blue[3], ramp: RAMPS.blue },
  health: { accent: RAMPS.cyan[2], ink: RAMPS.cyan[3], ramp: RAMPS.cyan },
  people: { accent: RAMPS.steel[2], ink: RAMPS.steel[3], ramp: RAMPS.steel },
} as const;
