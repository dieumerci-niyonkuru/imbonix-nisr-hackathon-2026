# Screenshots

These images illustrate the [main README](../../README.md) and the submission. The full set —
`homepage.png`, `imbonix-ai.png`, `intervention-planner.png`, `priority-ranking.png`, `district-map.png`,
`district-profile.png` and `mobile.png` — is **already in the repo and rendering**. Use this guide to
**refresh** them when the design changes — keep the same filenames and every document updates automatically.

Capture against the running app (`npm run dev` in `apps/web`, or the live URL). Use a clean browser window (no
dev-tools, no extensions bar). PNG; keep each around 1 MB or less.

| Filename | Page | Viewport | What to show |
| --- | --- | --- | --- |
| `homepage.png` | `/` | 1440×900 desktop | The hero and the headline figures at the top of the homepage |
| `imbonix-ai.png` | any page, panel open | 1440×900 desktop | The IMBONIX AI panel open, showing a grounded answer with its source |
| `intervention-planner.png` | `/social-protection/intervention-planner` | 1440×900 desktop | A problem, group and place chosen, with the evidence and options |
| `priority-ranking.png` | `/social-protection/priority-districts` | 1440×900 desktop | The policy levers and the districts each one flags |
| `district-map.png` | `/poverty-dynamics/district-map` | 1440×900 desktop | The interactive map, a district selected so its sectors show |
| `district-profile.png` | `/districts/gicumbi` | 1440×900 desktop | A district profile with its indicators and confidence intervals |
| `mobile.png` | `/` | 390×844 phone | The homepage on a phone (narrow column) |

## How to capture

- **Chrome/Edge:** open the page, press `F12` → device toolbar (`Ctrl+Shift+M`) to set an exact viewport, then
  `Ctrl+Shift+P` → "Capture screenshot" (or "Capture full size screenshot" for a whole page).
- **Firefox:** right-click → "Take Screenshot".
- **macOS:** `Cmd+Shift+4` for a region; **Windows:** `Win+Shift+S` (Snipping Tool).

Dev note: on first load each page compiles for a few seconds in `npm run dev` — wait for it to settle before capturing,
or use `npm run build && npm run start` for instant, production-looking pages.

Replacing a file here (same name) updates the README and the submission docs automatically — no edit needed. If you
add a new screenshot under a new name, reference it from the [main README](../../README.md) or the relevant doc.
