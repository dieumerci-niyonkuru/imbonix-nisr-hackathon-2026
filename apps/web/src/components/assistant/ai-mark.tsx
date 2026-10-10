/* eslint-disable @next/next/no-img-element -- a small vector brand mark, not a photo: nothing to optimise */

/**
 * The IMBONIX AI mark: the IMBONIX brand emblem. It is shown beside a short "AI" label on the assistant launcher and in
 * the panel header, so the assistant reads as IMBONIX's own — the logo plus AI. Size it with a `className` such as
 * `h-6 w-6`; it sits on a white chip, so the full-colour emblem is used.
 */
export function AiMark({ className }: { className?: string }) {
  return <img src="/brand/imbonix-emblem.svg" alt="" aria-hidden="true" className={className} />;
}
