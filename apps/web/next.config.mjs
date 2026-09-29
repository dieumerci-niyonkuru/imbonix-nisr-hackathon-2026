import { fileURLToPath } from "node:url";

const isDev = process.env.NODE_ENV !== "production";

// The browser loads code only from this site. The one outside host is the background map (tiles, fonts, sprites).
// Next.js inlines small scripts for hydration, which needs 'unsafe-inline' unless every page uses a per-request
// nonce; the dev server additionally needs eval and a websocket for hot reloading.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://tiles.openfreemap.org",
  "font-src 'self' data:",
  `connect-src 'self' https://tiles.openfreemap.org${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** Earlier page addresses and where each page lives now. */
const MOVED_PAGES = [
  ["/focus/exclusion", "/financial-exclusion"],
  ["/focus/poverty", "/poverty-dynamics"],
  ["/focus/protection", "/social-protection"],
  ["/access-vs-use", "/financial-exclusion/who-uses-financial-services"],
  ["/model", "/financial-exclusion/who-is-most-at-risk"],
  ["/map", "/poverty-dynamics/district-map"],
  ["/vulnerability", "/poverty-dynamics/where-needs-overlap"],
  ["/priorities", "/social-protection/where-to-act-first"],
  ["/scenarios", "/social-protection/test-a-policy-target"],
  ["/interventions", "/social-protection/plan-an-intervention"],
  ["/dashboard", "/data/rwanda-in-figures"],
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // No floating Next.js badge in development, so reviews of the design show only the site.
  devIndicators: false,
  // The Docker build sets NEXT_OUTPUT=standalone for a self-contained server that needs no node_modules
  // (see apps/web/Dockerfile). Local builds keep the default output, so `npm run start` works as usual.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  // Trace server files from this app, not from a lockfile that may exist higher up the machine's folders.
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Each page now sits under the focus area it answers (for example /poverty-dynamics/district-map). The earlier
  // addresses redirect permanently, keeping any query string, so shared links and bookmarks still open the right page.
  async redirects() {
    return MOVED_PAGES.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
