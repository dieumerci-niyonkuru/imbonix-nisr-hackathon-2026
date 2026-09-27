// Copy MapLibre GL's worker modules into public/ so the browser can load them.
// MapLibre 6 runs its worker from a separate ES module (maplibre-gl-worker.mjs, which imports
// maplibre-gl-shared.mjs); bundlers do not emit it, so it is served from /vendor/maplibre/.
// Runs automatically before `npm run dev` and `npm run build`; the copies are gitignored.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const source = path.join(process.cwd(), "node_modules", "maplibre-gl", "dist");
const target = path.join(process.cwd(), "public", "vendor", "maplibre");
mkdirSync(target, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(path.join(source, file), path.join(target, file));
}
const { version } = JSON.parse(readFileSync(path.join(source, "..", "package.json"), "utf8"));
console.log(`maplibre-gl ${version} worker copied to public/vendor/maplibre/`);
