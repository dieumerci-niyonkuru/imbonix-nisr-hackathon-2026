/**
 * The IMBONIX AI mark: a rounded conversation bubble holding a single four-point insight spark. It reads as a helpful
 * assistant (the bubble) that turns data into an answer (the spark), and it is distinct from the generic sparkle icon.
 * Both shapes are drawn in `currentColor`, so the mark takes its colour from the text colour of whatever carries it
 * (white on the cyan launcher, near-black on a white chip). Size it with a `className` such as `h-6 w-6`.
 */
export function AiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M7 3H17A4 4 0 0 1 21 7V12A4 4 0 0 1 17 16H10.5L6.5 20L8 16H7A4 4 0 0 1 3 12V7A4 4 0 0 1 7 3Z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M12 6.8 12.9 8.9 15 9.8 12.9 10.7 12 12.8 11.1 10.7 9 9.8 11.1 8.9Z" fill="currentColor" />
    </svg>
  );
}
