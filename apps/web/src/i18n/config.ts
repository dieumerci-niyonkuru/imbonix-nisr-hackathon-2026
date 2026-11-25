/** i18n constants with no server-only imports, so both the server request config and client components can use them. */

/** The two languages IMBONIX speaks. English is the source; Kinyarwanda is the translation. */
export const LOCALES = ["en", "rw"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
/** The cookie that holds the chosen language. There is no locale in the URL, so the whole site switches in place. */
export const LOCALE_COOKIE = "IMBONIX_LOCALE";
