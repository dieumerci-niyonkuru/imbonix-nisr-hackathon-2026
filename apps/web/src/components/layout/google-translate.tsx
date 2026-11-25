"use client";

import { useEffect } from "react";

/**
 * Google's free Website Translator (translate_a/element.js) translates the whole page into Kinyarwanda with no API key,
 * no account and no server. The flag switcher sets the `googtrans` cookie and reloads; Google reads it and delivers the
 * page translated. Google's own dropdown and top banner are hidden in globals.css.
 *
 * This is a display-layer translation: English stays the source of truth in the code.
 */
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement: new (options: unknown, element: string) => unknown } };
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      const api = window.google?.translate;
      if (api) {
        new api.TranslateElement(
          { pageLanguage: "en", includedLanguages: "en,rw", autoDisplay: false },
          "google_translate_element",
        );
      }
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);
  }, []);

  return (
    <div id="google_translate_element" style={{ position: "absolute", left: 0, top: 0, opacity: 0, pointerEvents: "none", zIndex: -1 }} />
  );
}
