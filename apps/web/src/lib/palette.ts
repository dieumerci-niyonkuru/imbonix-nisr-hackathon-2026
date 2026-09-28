/**
 * Every IMBONIX colour. The website uses two brand colours, on white and light neutral backgrounds, in the manner of
 * the Government of Rwanda's own sites:
 *
 * - deep navy #022657, the main colour: navigation, headings, strong text, buttons, the footer;
 * - bright cyan #02A5DC, the accent: highlights, active states, bands and figures, and text on navy.
 *
 * Everything else is a lighter or darker step of one of them, plus a neutral blue grey for missing data, baselines
 * and anything that should recede. The logo keeps its own colours. Import colours from here rather than writing hex
 * values in components, so the palette stays in one place.
 *
 * The ramps were generated in OKLCH from the brand hues by scripts/brand/generate_palette.py: each reads light to
 * dark with visible steps, its lightest step clears a white surface at 2:1, and navy or white text reaches 4.5:1 on
 * every step. Bright cyan is too light for small text on white (2.8:1), so links and small text on light
 * backgrounds use CYAN_INK, a deeper step of the same cyan, and cyan fills carry navy text (5.2:1).
 *
 * Categorical sets (the access strand, groups compared, chart categories) draw on navy, cyan, a light navy and a
 * dark grey. Checked with the colour vision validator, every pair is at least 10 ΔE apart for protan, deutan and
 * tritan vision and 15 ΔE for normal vision, and every chart that uses them has a legend and value labels.
 */

/** The two brand colours, with a deeper navy for the darkest surfaces. */
export const BRAND = {
  navy: "#022657",
  navyDeep: "#001436",
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
/**
 * Cyan for links and text on light backgrounds: 5.3:1 on white and at least 4.6:1 on paper, mist and pale cyan. The
 * brand cyan itself is for fills and dark backgrounds.
 */
export const CYAN_INK = "#01749C";
/**
 * The brand cyan one small step deeper, for data marks on white and paper: bars, dots and slices need 3:1 against
 * their background to be seen, and the brand cyan itself reaches 2.8:1. Buttons and highlights keep the brand cyan.
 */
export const CHART_CYAN = "#0B9ACD";

/** Light to dark. Darker always means more vulnerable on that measure. */
export const RAMPS = {
  /** The brand navy: poverty, nutrition and work. */
  navy: ["#A2B7D6", "#7595C5", "#4C74AD", "#28528E", "#0B3164"],
  /** The brand cyan: financial access, digital readiness and health. */
  cyan: ["#7EBEDE", "#2FA0D0", "#017EA8", "#035A7A", "#01384D"],
  /** A neutral blue grey on the navy hue: shocks, population counts, baselines. */
  steel: ["#AEB6C3", "#8895A7", "#65748B", "#43536C", "#24334A"],
} as const;

/** Mid tones for data marks (bars, dots, swatches), one per brand colour plus the neutral. */
export const CORE = {
  navy: RAMPS.navy[3],
  cyan: CHART_CYAN,
  steel: RAMPS.steel[2],
} as const;

/** A pale grey for marks that should recede, such as districts that meet neither condition. */
export const PALE_GREY = "#D5DBE4";

/** Before and after, or a baseline and its target: grey then navy. */
export const COMPARE = { before: RAMPS.steel[0], after: BRAND.navy } as const;

/** Two groups compared side by side (women and men, for example): cyan and navy. */
export const PAIR = { a: CORE.cyan, b: BRAND.navy } as const;

/** FinScope access strand, from the most formal service to none: navy, light navy, cyan, then dark grey for exclusion. */
export const STRAND = {
  banked: BRAND.navy,
  otherFormal: RAMPS.navy[0],
  informalOnly: CORE.cyan,
  excluded: RAMPS.steel[3],
} as const;

/** Positive and negative values around a neutral grey midpoint: navy below zero, cyan above. Strong to light. */
export const DIVERGING = {
  negative: [RAMPS.navy[3], RAMPS.navy[1], RAMPS.navy[0]],
  neutral: "#EEF1F5",
  positive: [RAMPS.cyan[3], RAMPS.cyan[1], RAMPS.cyan[0]],
} as const;

/** Four ordered steps from good to worst, e.g. on time to very late: light to dark navy. */
export const SEVERITY = [RAMPS.navy[0], RAMPS.navy[1], RAMPS.navy[2], RAMPS.navy[4]] as const;

/** Quadrants of a two-measure scatter: both worse, one worse each way, neither. */
export const QUADRANTS = {
  both: BRAND.navy,
  first: CORE.cyan,
  second: RAMPS.steel[3],
  neither: PALE_GREY,
} as const;

/**
 * Colours per dimension: `accent` for bars, borders and swatches; `ink` for text (4.5:1 on white and paper);
 * `ramp` for maps and other sequential scales.
 */
export const DIMENSION_COLORS = {
  poverty: { accent: CORE.navy, ink: RAMPS.navy[3], ramp: RAMPS.navy },
  finance: { accent: CORE.cyan, ink: CYAN_INK, ramp: RAMPS.cyan },
  nutrition: { accent: RAMPS.cyan[3], ink: RAMPS.cyan[3], ramp: RAMPS.cyan },
  shocks: { accent: CORE.steel, ink: RAMPS.steel[3], ramp: RAMPS.steel },
  digital: { accent: RAMPS.cyan[2], ink: RAMPS.cyan[3], ramp: RAMPS.cyan },
  work: { accent: RAMPS.navy[2], ink: RAMPS.navy[3], ramp: RAMPS.navy },
  health: { accent: RAMPS.cyan[2], ink: RAMPS.cyan[3], ramp: RAMPS.cyan },
  people: { accent: RAMPS.steel[2], ink: RAMPS.steel[3], ramp: RAMPS.steel },
} as const;
