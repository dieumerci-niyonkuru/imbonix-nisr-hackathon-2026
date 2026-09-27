import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import { BRAND, DIMENSION_COLORS, INK, LINE, MUTED, PAPER, SUN_INK } from "./src/lib/palette";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // shadcn/ui semantic tokens, mapped onto the IMBONIX palette in globals.css.
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        ink: INK,
        // Navy from the logo wordmark, with deeper and lighter steps for surfaces.
        navy: { 950: BRAND.navyDeep, 900: BRAND.navy, 800: "#0B3268", 700: "#153F80", 600: "#1F4F99" },
        // Primary action blue: the logo's blue.
        royal: BRAND.blue,
        brand: {
          50: "#EAF3FB",
          100: "#D4E6F7",
          200: "#A9CDEF",
          300: "#6FAAE3",
          400: "#2F87D3",
          500: "#0A70C4",
          600: BRAND.blue,
          700: "#004E96",
          800: "#003D78",
          900: "#002D5C",
        },
        azure: BRAND.azure,
        // `ink` for cyan-family text on light backgrounds, `soft` a pale background.
        cyan: { DEFAULT: BRAND.cyan, ink: "#01586A", soft: "#E3F6F9" },
        // The sun in the logo. `ink` is the shade for gold text on light backgrounds, `soft` a pale background, `hover` for buttons.
        sun: { DEFAULT: BRAND.gold, ink: SUN_INK, soft: "#FEF5DD", hover: "#FAC64A" },
        // Pale blue-grey surfaces for inputs, chips and panels.
        mist: { DEFAULT: "#EEF3F9", strong: "#E3EAF3" },
        paper: PAPER,
        line: LINE,
        // Secondary text. `muted-foreground` is the shadcn name for the same colour.
        muted: { DEFAULT: MUTED, foreground: MUTED },
        // Dimension colours for text (4.5:1 on white and paper); bars and maps use the accents and ramps.
        dim: {
          poverty: DIMENSION_COLORS.poverty.ink,
          finance: DIMENSION_COLORS.finance.ink,
          digital: DIMENSION_COLORS.digital.ink,
          nutrition: DIMENSION_COLORS.nutrition.ink,
          shocks: DIMENSION_COLORS.shocks.ink,
          work: DIMENSION_COLORS.work.ink,
          health: DIMENSION_COLORS.health.ink,
          people: DIMENSION_COLORS.people.ink,
        },
      },
      fontFamily: {
        display: ['"Lexend Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Manrope Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: { page: "1320px" },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      boxShadow: {
        card: "0 1px 2px rgba(0,36,84,0.05), 0 8px 24px -14px rgba(0,36,84,0.16)",
        lift: "0 24px 56px -22px rgba(0,36,84,0.38)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "fade-up": "fade-up 700ms cubic-bezier(.2,.75,.2,1) both",
        "accordion-down": "accordion-down 200ms ease-out",
        "accordion-up": "accordion-up 200ms ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
