/**
 * Every IMBONIX colour. The website uses two colours only: bright cyan #02A5DC and white. Cyan carries the brand:
 * bands, active states, buttons, figures and data. Text is a neutral near black so it can be read, and a neutral grey
 * marks missing data, baselines and anything that should recede. The logo keeps its own colours. Import colours from
 * here rather than writing hex values in components, so the palette stays in one place.
 *
 * The ramps and text shades were generated in OKLCH from the brand cyan by scripts/brand/generate_palette.py: each
 * ramp reads light to dark with visible steps, its lightest step clears a white surface at 2:1, and near black or
 * white text reaches 4.5:1 on every step. Bright cyan is too light for small text on white (2.8:1), so links and small
 * text on light backgrounds use CYAN_INK, a deeper step of the same cyan, and cyan fills carry near black text (5.9:1).
 *
 * Chart categories draw on cyan, a deep cyan, a light grey and a mid grey. Checked with the colour vision validator,
 * every pair is at least 12 ΔE apart for protan, deutan and tritan vision and 15 ΔE for normal vision, and every chart
 * that uses them has a legend, value labels and, for stacked bars, a table of every value.
 */

/** The brand colour. White is the other. */
export const BRAND = {
  cyan: "#02A5DC",
} as const;

/**
 * Social platforms' own official brand colours, used only for the social links in the footer. These sit outside the
 * IMBONIX cyan-and-white palette on purpose: a brand mark has to appear in its owner's colour. Instagram's mark uses
 * its official gradient, so its stops are listed in order from one corner to the other.
 */
export const SOCIAL_BRAND = {
  x: "#000000",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
  instagram: "#D62976",
  flickr: "#FF0084",
  tiktok: "#000000",
  github: "#181717",
} as const;

export const INSTAGRAM_GRADIENT = ["#FEDA75", "#FA7E1E", "#D62976", "#962FBF", "#4F5BD5"] as const;
/** Flickr's two dots: blue then pink. */
export const FLICKR_DOTS = ["#0063DC", "#FF0084"] as const;

/** Text and surfaces: near black text, white pages and pale cyan tints. */
export const INK = "#1A1F21";
export const MUTED = "#5D6569";
export const LINE = "#E1E7EB";
export const PAPER = "#F0F8FC";
export const WHITE = "#FFFFFF";
/** Districts or sectors with no value: lighter than the first step of every ramp. */
export const NO_DATA = "#E7ECEE";
/**
 * Cyan for links and text on light backgrounds: 5.3:1 on white and at least 4.6:1 on paper, mist and pale cyan. The
 * brand cyan itself is for fills and bands.
 */
export const CYAN_INK = "#01749C";
/**
 * The brand cyan one small step deeper, for data marks on white and paper: bars, dots and slices need 3:1 against
 * their background to be seen, and the brand cyan itself reaches 2.8:1. Buttons and highlights keep the brand cyan.
 */
export const CHART_CYAN = "#0B9ACD";

/** Light to dark. Darker always means more vulnerable on that measure. */
export const RAMPS = {
  /** The brand cyan: every measure of need. */
  cyan: ["#7EBEDE", "#2FA0D0", "#017EA8", "#035A7A", "#01384D"],
  /** A neutral grey: shocks, population counts and anything that should recede. */
  grey: ["#B2B6B9", "#909597", "#6F7477", "#4E5356", "#2F3436"],
} as const;

/** The darkest cyan, for the strongest data marks. */
export const DEEP_CYAN = RAMPS.cyan[4];
/** Greys for chart categories: light for a baseline or a part that recedes, mid for a second group. */
export const LIGHT_GREY = "#C9CED3";
export const MID_GREY = "#6B7178";

/** Mid tones for data marks (bars, dots, swatches). */
export const CORE = {
  cyan: CHART_CYAN,
  deep: DEEP_CYAN,
  grey: MID_GREY,
} as const;

/** Before and after, or a baseline and its target: light grey then cyan. */
export const COMPARE = { before: LIGHT_GREY, after: CHART_CYAN } as const;

/** Two groups compared side by side (women and men, for example): cyan and deep cyan. */
export const PAIR = { a: CHART_CYAN, b: DEEP_CYAN } as const;

/** FinScope access strand, from the most formal service to none: deep cyan, light grey, cyan, then mid grey. */
export const STRAND = {
  banked: DEEP_CYAN,
  otherFormal: LIGHT_GREY,
  informalOnly: CHART_CYAN,
  excluded: MID_GREY,
} as const;

/** Positive and negative values around a neutral midpoint: grey below zero, cyan above. Strong to light. */
export const DIVERGING = {
  negative: [RAMPS.grey[3], RAMPS.grey[1], RAMPS.grey[0]],
  neutral: NO_DATA,
  positive: [RAMPS.cyan[3], RAMPS.cyan[1], RAMPS.cyan[0]],
} as const;

/** Four ordered steps from good to worst, e.g. on time to very late: light to dark cyan. */
export const SEVERITY = [RAMPS.cyan[0], RAMPS.cyan[1], RAMPS.cyan[2], RAMPS.cyan[4]] as const;

/** Quadrants of a two-measure scatter: both worse, one worse each way, neither. */
export const QUADRANTS = {
  both: DEEP_CYAN,
  first: CHART_CYAN,
  second: MID_GREY,
  neither: LIGHT_GREY,
} as const;

/**
 * Colours per dimension: `accent` for bars, borders and swatches; `ink` for text (4.5:1 on white and paper);
 * `ramp` for maps and other sequential scales.
 */
export const DIMENSION_COLORS = {
  poverty: { accent: DEEP_CYAN, ink: RAMPS.cyan[3], ramp: RAMPS.cyan },
  finance: { accent: CHART_CYAN, ink: CYAN_INK, ramp: RAMPS.cyan },
  nutrition: { accent: RAMPS.cyan[3], ink: RAMPS.cyan[3], ramp: RAMPS.cyan },
  shocks: { accent: MID_GREY, ink: RAMPS.grey[3], ramp: RAMPS.grey },
  digital: { accent: RAMPS.cyan[2], ink: RAMPS.cyan[3], ramp: RAMPS.cyan },
  work: { accent: RAMPS.cyan[3], ink: RAMPS.cyan[3], ramp: RAMPS.cyan },
  health: { accent: RAMPS.cyan[2], ink: RAMPS.cyan[3], ramp: RAMPS.cyan },
  people: { accent: RAMPS.grey[2], ink: RAMPS.grey[3], ramp: RAMPS.grey },
} as const;
