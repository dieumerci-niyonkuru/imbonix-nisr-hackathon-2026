import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import { BRAND, CYAN_INK, DIMENSION_COLORS, INK, LINE, MUTED, PAPER } from "./src/lib/palette";

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
        // Text: a neutral near black, the only dark colour on the site.
        ink: INK,
        // The brand colour: bands, buttons, active states and highlights, always with near black text. `ink` is the
        // deeper step for links and small text on light backgrounds, `soft` a pale background, `hover` a lighter step.
        cyan: { DEFAULT: BRAND.cyan, ink: CYAN_INK, soft: "#E3F5FF", hover: "#3EB9EE" },
        // Pale cyan surfaces for inputs, chips and panels.
        mist: { DEFAULT: "#E5F3FA", strong: "#D4EAF6" },
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
      // Nearly square corners, as on the government's sites: calm and institutional.
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 1px)",
        sm: "calc(var(--radius) - 2px)",
        xl: "0.375rem",
        "2xl": "0.5rem",
        "3xl": "0.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,31,33,0.06)",
        lift: "0 14px 32px -18px rgba(26,31,33,0.3)",
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
