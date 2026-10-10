# Screenshots

Put the images the README and the submission use in **this folder**, with the exact filenames below. The README already
references them (currently commented out) — once a file is here, uncomment its tag in the README and it renders.

Capture against the running app (`npm run dev` in `apps/web`, or the live URL). Use a clean browser window (no
dev-tools, no extensions bar). PNG, retina/2× if you can; keep each under ~1 MB.

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

After adding the files, uncomment the image tags in the repository [`README.md`](../../README.md) (search for
"Screenshots").
