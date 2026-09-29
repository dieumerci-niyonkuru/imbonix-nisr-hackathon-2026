import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Pages in this section name it in their title, so a browser tab says where the page sits: "Page · Social protection". */
export const metadata: Metadata = {
  title: { template: "%s · Social protection | IMBONIX", default: "Social protection | IMBONIX" },
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
