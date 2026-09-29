import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Pages in this section name it in their title, so a browser tab says where the page sits: "Page · Poverty dynamics". */
export const metadata: Metadata = {
  title: { template: "%s · Poverty dynamics | IMBONIX", default: "Poverty dynamics | IMBONIX" },
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
