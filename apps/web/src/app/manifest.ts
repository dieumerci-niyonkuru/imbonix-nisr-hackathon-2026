import type { MetadataRoute } from "next";
import { BRAND, PAPER } from "@/lib/palette";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IMBONIX: Rwanda's data for financial inclusion and poverty reduction",
    short_name: "IMBONIX",
    description:
      "IMBONIX turns Rwanda's data into actionable intelligence for financial inclusion and poverty reduction, built on NISR statistics.",
    start_url: "/",
    display: "standalone",
    background_color: PAPER,
    theme_color: BRAND.navy,
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
