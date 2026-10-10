# Screenshots

These images illustrate the [main README](../../README.md) and the submission. The current set (`home.png`,
`home-mobile.png`, `priorities.png`, `district.png`, `map.png`) is **already in the repo and rendering**. Use this guide
to **refresh** them when the design changes — keep the same filenames and the README updates automatically.

Capture against the running app (`npm run dev` in `apps/web`, or the live URL). Use a clean browser window (no
dev-tools, no extensions bar). PNG; keep each around 1 MB or less.

| Filename | Page | Viewport | What to show |
| --- | --- | --- | --- |
| `home.png` | `/` | 1440×900 desktop | The hero and the headline figures at the top of the homepage |
| `map.png` | `/poverty-dynamics/district-map` | 1440×900 desktop | The interactive map, a district selected so its sectors show |
| `district.png` | `/districts/gicumbi` | 1440×900 desktop | A district profile with its indicators and confidence intervals |
| `priorities.png` | `/social-protection/priority-districts` | 1440×900 desktop | The policy levers and the districts each one flags |
| `home-mobile.png` | `/` | 390×844 phone | The homepage on a phone (narrow column) |
| `ai.png` _(optional but recommended)_ | any page | 1440×900 desktop | The IMBONIX AI panel open, showing a grounded answer with its source |

## How to capture

- **Chrome/Edge:** open the page, press `F12` → device toolbar (`Ctrl+Shift+M`) to set an exact viewport, then
  `Ctrl+Shift+P` → "Capture screenshot" (or "Capture full size screenshot" for a whole page).
- **Firefox:** right-click → "Take Screenshot".
- **macOS:** `Cmd+Shift+4` for a region; **Windows:** `Win+Shift+S` (Snipping Tool).

Dev note: on first load each page compiles for a few seconds in `npm run dev` — wait for it to settle before capturing,
or use `npm run build && npm run start` for instant, production-looking pages.

Replacing a file here (same name) updates the README automatically — no edit needed. The optional `ai.png` is referenced
nowhere yet; add it to the README if you capture it.
