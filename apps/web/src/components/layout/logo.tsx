/* eslint-disable @next/next/no-img-element -- small vector files, not photos: nothing for the image optimiser to do */
import { cn } from "@/lib/utils";

/** Width / height of the outlined SVGs in public/brand (made by scripts/brand/make_logo_svgs.py). */
const WORDMARK_RATIO = 504.7 / 78;
const TAGLINE_RATIO = 891 / 40;

const SIZES = {
  md: { emblem: 46, wordmark: 26, tagline: 8 },
  lg: { emblem: 58, wordmark: 31, tagline: 9.5 },
} as const;

/** Below 360px the header logo steps down a size (and drops the tagline) so the search and menu buttons fit. */
const COMPACT = {
  md: { emblem: "h-10 w-10 min-[360px]:h-[46px] min-[360px]:w-[46px]", wordmark: "h-5 w-auto min-[360px]:h-[26px]" },
  lg: { emblem: "", wordmark: "" },
} as const;

/**
 * The stacked logo for the footer, set like a university crest: the wordmark and tagline over the full colour emblem,
 * in the logo's own colours on white.
 */
export function StackedBrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex flex-col items-center", className)}>
      <img src="/brand/imbonix-wordmark.svg" alt="IMBONIX" width={Math.round(44 * WORDMARK_RATIO)} height={44} />
      <img
        src="/brand/imbonix-tagline.svg"
        alt="Data for Inclusive Prosperity"
        width={Math.round(13 * TAGLINE_RATIO)}
        height={13}
        className="mt-3"
      />
      <img src="/brand/imbonix-emblem.svg" alt="" width={92} height={92} className="mt-6" />
    </span>
  );
}

/**
 * The IMBONIX logo: the vector emblem beside the wordmark and tagline, all drawn from the logo's own colours.
 *
 * Below 360px the header logo steps down a size and hides the tagline, so a phone header keeps room for its buttons. The favicon uses the simplified mark
 * (public/brand/imbonix-mark.svg).
 */
export function BrandLogo({
  size = "md",
  showTagline = true,
  className,
}: {
  size?: keyof typeof SIZES;
  showTagline?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <img
        src="/brand/imbonix-emblem.svg"
        alt=""
        width={s.emblem}
        height={s.emblem}
        className={cn("shrink-0", COMPACT[size].emblem)}
        fetchPriority="high"
      />
      <span className="flex flex-col justify-center">
        <img
          src="/brand/imbonix-wordmark.svg"
          alt="IMBONIX"
          width={Math.round(s.wordmark * WORDMARK_RATIO)}
          height={s.wordmark}
          className={COMPACT[size].wordmark}
          fetchPriority="high"
        />
        {showTagline && (
          <img
            src="/brand/imbonix-tagline.svg"
            alt="Data for Inclusive Prosperity"
            width={Math.round(s.tagline * TAGLINE_RATIO)}
            height={s.tagline}
            className="mt-1.5 hidden min-[360px]:block"
          />
        )}
      </span>
    </span>
  );
}
