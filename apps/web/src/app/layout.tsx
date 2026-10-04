import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/lexend";
import "./globals.css";
import { ScrollControls } from "@/components/layout/scroll-controls";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BRAND } from "@/lib/palette";

export const metadata: Metadata = {
  title: {
    default: "IMBONIX | Financial inclusion and poverty in Rwanda",
    template: "%s | IMBONIX",
  },
  description:
    "IMBONIX brings together NISR data on poverty, financial inclusion, nutrition, social protection and shocks to show where Rwandan households are vulnerable, and why.",
};

export const viewport: Viewport = {
  themeColor: BRAND.cyan,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-body">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-cyan focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
        <ScrollControls />
      </body>
    </html>
  );
}
