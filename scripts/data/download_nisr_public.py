"""Download public (no-login) NISR publications and tables listed in the manifest.

Usage (from the repository root):

    python scripts/data/download_nisr_public.py                 # core files only
    python scripts/data/download_nisr_public.py --priority all  # everything
    python scripts/data/download_nisr_public.py --group eicv7 --group lfs

Files are saved under data/raw/nisr/published/<group>/, which git ignores.
Microdata is NOT covered here: it needs a NADA account (see docs/data).
"""

import argparse
import hashlib
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
MANIFEST = REPO / "data" / "dictionaries" / "nisr-public-files.json"
OUT_DIR = REPO / "data" / "raw" / "nisr" / "published"
PRIORITY_LEVELS = {"core": ["core"], "supporting": ["core", "supporting"], "all": ["core", "supporting", "optional"]}


def download(url: str, dest: Path, retries: int = 3) -> tuple[int, str]:
    # www.statistics.gov.rw serves a certificate for statistics.gov.rw only.
    url = url.replace("https://www.statistics.gov.rw", "https://statistics.gov.rw")
    request = urllib.request.Request(url, headers={"User-Agent": "IMBONIX-research/1.0"})
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                data = response.read()
            dest.parent.mkdir(parents=True, exist_ok=True)
            tmp = dest.with_suffix(dest.suffix + ".part")
            tmp.write_bytes(data)
            tmp.replace(dest)
            return len(data), hashlib.sha256(data).hexdigest()
        except (urllib.error.URLError, TimeoutError, ConnectionError) as error:
            if attempt == retries:
                raise
            print(f"    retry {attempt}/{retries - 1} after error: {error}")
            time.sleep(3 * attempt)
    raise RuntimeError("unreachable")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--priority", choices=PRIORITY_LEVELS, default="core")
    parser.add_argument("--group", action="append", help="limit to one or more manifest groups")
    parser.add_argument("--force", action="store_true", help="re-download files that already exist")
    args = parser.parse_args()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    wanted = [
        entry for entry in manifest["files"]
        if entry["priority"] in PRIORITY_LEVELS[args.priority]
        and (not args.group or entry["group"] in args.group)
    ]
    log_path = OUT_DIR / "_download_log.json"
    log = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else {}
    failures = []

    for index, entry in enumerate(wanted, 1):
        dest = OUT_DIR / entry["group"] / entry["filename"]
        label = f"[{index}/{len(wanted)}] {entry['group']}/{entry['filename']}"
        if dest.exists() and dest.stat().st_size > 0 and not args.force:
            print(f"{label}: already present")
            continue
        print(f"{label}: downloading")
        try:
            size, digest = download(entry["url"], dest)
        except Exception as error:  # keep going; report at the end
            print(f"    FAILED: {error}")
            failures.append((entry["url"], str(error)))
            continue
        log[f"{entry['group']}/{entry['filename']}"] = {
            "url": entry["url"], "bytes": size, "sha256": digest,
            "downloaded": time.strftime("%Y-%m-%dT%H:%M:%S"),
        }
        log_path.parent.mkdir(parents=True, exist_ok=True)
        log_path.write_text(json.dumps(log, indent=1), encoding="utf-8")

    print(f"\nDone: {len(wanted) - len(failures)} ok, {len(failures)} failed. Files in {OUT_DIR}")
    for url, error in failures:
        print(f"  failed: {url} ({error})")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
