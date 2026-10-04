import { FocusAreaPage, focusAreaMetadata } from "@/components/focus/focus-area-page";

export const metadata = focusAreaMetadata("protection");

/** Social protection overview: the key evidence, then the pages that go deeper. */
export default function SocialProtectionPage() {
  return <FocusAreaPage areaId="protection" />;
}
