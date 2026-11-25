"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/** Each language with its flag (SVGs in public/flags) and English name, as shown in the picker. */
const LANGUAGES = [
  { code: "en", label: "English", flag: "/flags/en.svg" },
  { code: "rw", label: "Kinyarwanda", flag: "/flags/rw.svg" },
] as const;

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return value === "rw" ? value : "en";
}

/** A small flag chip, drawn as a background image so it renders identically on every platform (no emoji fallback). */
function Flag({ src }: { src: string }) {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-6 shrink-0 rounded-[2px] bg-cover bg-center ring-1 ring-line"
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}

/**
 * Switch the whole site between English, Kinyarwanda and French — instantly, with no page reload. The choice is saved
 * (cookie + localStorage, so it's remembered on the next visit) and announced with an `imbonix:setlocale` event; the
 * GoogleTranslate widget (mounted in the layout) drives Google's free Website Translator to match. The trigger shows the
 * current flag and name, and flips to white when the header sits over the hero photo, matching the tabs beside it.
 */
export function LanguageSwitcher({ onDark = false }: { onDark?: boolean }) {
  const [active, setActive] = useState<Locale>("en");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setActive(readCookieLocale());
  }, []);

  const current = LANGUAGES.find((language) => language.code === active) ?? LANGUAGES[0];

  const choose = (code: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    try {
      localStorage.setItem(LOCALE_COOKIE, code);
    } catch {
      /* storage may be unavailable */
    }

    // Set Google's own googtrans cookie (it reads this on page load to decide the target language) and reload.
    // This is the only fully reliable approach — combo-driving the hidden <select> is fragile and often silently
    // fails, especially in React apps where the widget's mount element competes with virtual-DOM reconciliation.
    const host = window.location.hostname;
    const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
    if (code === "en") {
      document.cookie = `googtrans=; path=/; expires=${expired}`;
      document.cookie = `googtrans=; path=/; domain=${host}; expires=${expired}`;
    } else {
      document.cookie = `googtrans=/en/${code}; path=/`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=${host}`;
    }
    window.location.reload();
  };

  return (
    <div className="imbonix-lang-switcher notranslate relative" translate="no" data-no-translate>
      {open && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setOpen(false)}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Language: ${current.label}. Change language`}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full px-2.5 text-[14px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-3",
          onDark
            ? "text-white hover:bg-white/15 focus-visible:ring-white"
            : "text-cyan-ink hover:bg-cyan-soft focus-visible:ring-cyan-ink",
        )}
      >
        <Flag src={current.flag} />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDownIcon className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 z-50 mt-1.5 w-48 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-lift"
        >
          {LANGUAGES.filter((language) => language.code !== active).map((language) => (
            <li key={language.code} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => choose(language.code)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[14.5px] font-semibold text-ink transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-ink"
              >
                <Flag src={language.flag} />
                {language.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
