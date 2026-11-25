import { fileURLToPath } from "node:url";

const isDev = process.env.NODE_ENV !== "production";

// The browser loads code only from this site. The one outside host is the background map (tiles, fonts, sprites).
// Next.js inlines small scripts for hydration, which needs 'unsafe-inline' unless every page uses a per-request
// nonce; the dev server additionally needs eval and a websocket for hot reloading.
const contentSecurityPolicy = [
  "default-src 'self'",
  // Google's free Website Translator (translate_a/element.js) pulls scripts, fonts, images and translation calls from
  // these Google hosts, used by the language switcher.
  `script-src 'self' 'unsafe-inline' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://www.gstatic.com https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://tiles.openfreemap.org https://www.gstatic.com https://www.google.com https://fonts.gstatic.com https://translate.googleapis.com https://translate-pa.googleapis.com https://translate.google.com http://translate.google.com",
  "font-src 'self' data: https://fonts.gstatic.com https://www.gstatic.com",
  `connect-src 'self' https://tiles.openfreemap.org https://translate.googleapis.com https://translate-pa.googleapis.com https://translate.google.com${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // The widget frames the current page itself as an internal bridge (a hidden same-origin iframe), alongside its own
  // translate.google.com frames — 'self' here is only for that; frame-ancestors below still stops anyone framing us.
  "frame-src 'self' https://translate.google.com",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The assistant's voice input uses the Web Speech API, which the browser gates on the microphone permission. Allow
  // the microphone to this origin only (so the browser can prompt). The AI's location context comes from the server's
  // IP geolocation (no browser prompt), so camera, geolocation, payment and USB all stay blocked.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** Earlier page addresses and where each page lives now. */
const MOVED_PAGES = [
  ["/focus/exclusion", "/financial-exclusion"],
  ["/focus/poverty", "/poverty-dynamics"],
  ["/focus/protection", "/social-protection"],
  ["/access-vs-use", "/financial-exclusion/access-and-use"],
  ["/model", "/financial-exclusion/risk-model"],
  ["/map", "/poverty-dynamics/district-map"],
  ["/vulnerability", "/poverty-dynamics/overlapping-needs"],
  ["/priorities", "/social-protection/priority-districts"],
  ["/scenarios", "/social-protection/policy-scenarios"],
  ["/interventions", "/social-protection/intervention-planner"],
  ["/dashboard", "/data/key-figures"],
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
