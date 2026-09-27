import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/lexend";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderNav } from "@/components/layout/site-header-nav";
import { BRAND } from "@/lib/palette";

export const metadata: Metadata = {
  title: {
    default: "IMBONIX | Rwanda resilience atlas",
    template: "%s | IMBONIX",
  },
  description:
    "IMBONIX brings together NISR data on poverty, financial inclusion, nutrition, social protection and shocks to show where Rwandan households are vulnerable, and why.",
};

export const viewport: Viewport = {
  themeColor: BRAND.navy,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-body">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeaderNav />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
