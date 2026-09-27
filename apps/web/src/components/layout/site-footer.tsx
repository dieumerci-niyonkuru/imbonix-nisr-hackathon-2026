import pkg from "../../../package.json";
import { BrandLogo } from "@/components/layout/logo";

/** A minimal footer: who made IMBONIX, where the numbers come from, and the credits the data licences ask for. */
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page flex flex-col gap-8 py-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <BrandLogo />
        </div>
        <p className="shrink-0 text-[12.5px] text-muted">© 2026 IMBONIX team · Version {pkg.version}</p>
      </div>
    </footer>
  );
}
