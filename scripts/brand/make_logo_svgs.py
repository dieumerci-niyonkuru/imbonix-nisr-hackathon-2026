"""Build the IMBONIX wordmark and tagline as outlined SVG, from the Lexend font the website already ships.

    pip install fonttools brotli
    python scripts/brand/make_logo_svgs.py

Needs apps/web/node_modules (run `npm ci` in apps/web first). Writes to apps/web/public/brand/:

  imbonix-wordmark.svg           IMBONIX in logo navy, with the gauge O and the cyan-to-blue X
  imbonix-wordmark-on-dark.svg   the same in white, for navy backgrounds
  imbonix-tagline.svg            DATA FOR INCLUSIVE PROSPERITY, in logo blue
  imbonix-tagline-on-dark.svg    the same in white at 72% opacity
  imbonix-emblem-disc.svg        the emblem on a white disc, for navy backgrounds
  imbonix-logo.svg               vertical lockup: emblem, wordmark and tagline
  imbonix-lockup.svg             horizontal lockup, as in the site header

The letters are Lexend ExtraBold (800); the tagline is Lexend SemiBold (600). Outlines mean the files look the same
everywhere, with no font to load. The emblem (imbonix-emblem.svg) and favicon mark (imbonix-mark.svg) are drawn by hand
in the same folder.
"""

import math
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

REPO = Path(__file__).resolve().parents[2]
FONT = REPO / "apps/web/node_modules/@fontsource-variable/lexend/files/lexend-latin-wght-normal.woff2"
OUT = REPO / "apps/web/public/brand"

NAVY, BLUE, AZURE, CYAN = "#002454", "#0060B4", "#0090E4", "#00C0D8"


def instance(weight: int) -> TTFont:
    return instantiateVariableFont(TTFont(FONT), {"wght": weight})


class Setter:
    """Places glyph outlines along a baseline, in SVG coordinates (y down)."""

    def __init__(self, font: TTFont, size: float, tracking: float):
        self.font, self.size, self.tracking = font, size, tracking
        self.scale = size / font["head"].unitsPerEm
        self.glyphs = font.getGlyphSet()
        self.cmap = font.getBestCmap()
        self.hmtx = font["hmtx"]

    def glyph(self, char: str) -> str:
        return self.cmap[ord(char)]

    def advance(self, char: str) -> float:
        return self.hmtx[self.glyph(char)][0] * self.scale

    def path(self, char: str, x: float, baseline: float) -> str:
        pen = SVGPathPen(self.glyphs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
        s = self.scale
        self.glyphs[self.glyph(char)].draw(TransformPen(pen, (s, 0, 0, -s, x, baseline)))
        return pen.getCommands()

    def run(self, text: str, x: float, baseline: float) -> tuple[str, float]:
        d = ""
        for char in text:
            if char != " ":
                d += self.path(char, x, baseline)
            x += self.advance(char) + self.tracking
        return d, x - self.tracking

    def ink_right(self, char: str, x: float) -> float:
        """Right edge of the glyph's outline, not its advance."""
        from fontTools.pens.boundsPen import BoundsPen

        pen = BoundsPen(self.glyphs)
        self.glyphs[self.glyph(char)].draw(pen)
        return x + pen.bounds[2] * self.scale


def wordmark(ink: str, needle: tuple[str, str], dot: str, x_gradient: tuple[str, str]) -> str:
    font = instance(800)
    size = 100
    setter = Setter(font, size, tracking=-5)
    cap = font["OS/2"].sCapHeight * setter.scale
    baseline = cap + 4
    stem = (lambda b: (b[2] - b[0]) * setter.scale)(bounds(setter, "I"))

    parts = []
    d, x = setter.run("IMB", 0, baseline)
    parts.append(f'<path d="{d}" fill="{ink}"/>')

    # The gauge O: a ring the size of Lexend's O, with a needle pointing up and to the right.
    ob = bounds(setter, "O")
    cx = x + setter.tracking + (ob[0] + (ob[2] - ob[0]) / 2) * setter.scale
    cy = baseline - cap / 2
    radius = cap / 2 - stem / 2 + 0.5
    parts.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{radius:.2f}" fill="none" stroke="{ink}" stroke-width="{stem:.2f}"/>')
    angle = math.radians(-40)
    length = cap / 2 + stem * 0.15
    nx, ny = cx + math.cos(angle) * length, cy + math.sin(angle) * length
    parts.append(
        f'<line x1="{cx:.2f}" y1="{cy:.2f}" x2="{nx:.2f}" y2="{ny:.2f}" stroke="url(#needle)" '
        f'stroke-width="{stem * 0.34:.2f}" stroke-linecap="round"/>'
    )
    parts.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{stem * 0.34:.2f}" fill="{dot}"/>')
    x += setter.tracking + setter.advance("O") + setter.tracking

    d, x = setter.run("NI", x, baseline)
    parts.append(f'<path d="{d}" fill="{ink}"/>')

    # The X stands a little apart, in the logo's cyan-to-blue gradient.
    x += size * 0.14
    parts.append(f'<path d="{setter.path("X", x, baseline)}" fill="url(#xband)"/>')
    width = setter.ink_right("X", x) + 2

    defs = (
        '<defs>'
        f'<linearGradient id="needle" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="{needle[0]}"/>'
        f'<stop offset="1" stop-color="{needle[1]}"/></linearGradient>'
        f'<linearGradient id="xband" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{x_gradient[0]}"/>'
        f'<stop offset="1" stop-color="{x_gradient[1]}"/></linearGradient>'
        '</defs>'
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.1f} {baseline + 4:.1f}" role="img" '
        f'aria-label="IMBONIX">{defs}{"".join(parts)}</svg>\n'
    )


def bounds(setter: Setter, char: str):
    from fontTools.pens.boundsPen import BoundsPen

    pen = BoundsPen(setter.glyphs)
    setter.glyphs[setter.glyph(char)].draw(pen)
    return pen.bounds


def tagline(fill: str) -> str:
    size = 40
    setter = Setter(instance(600), size, tracking=size * 0.14)
    d, _ = setter.run("DATA FOR INCLUSIVE PROSPERITY", 0, 30)
    width = setter.ink_right("Y", _ - setter.advance("Y")) + 1
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.1f} 40" role="img" '
        f'aria-label="Data for Inclusive Prosperity"><path d="{d}" fill="{fill}"/></svg>\n'
    )


def inner(svg: str) -> tuple[str, str]:
    """The viewBox and inner markup of an SVG file, so several can be nested in one lockup."""
    import re

    view_box = re.search(r'viewBox="([^"]+)"', svg).group(1)
    body = svg[svg.index(">") + 1 : svg.rindex("</svg>")]
    return view_box, body


def nest(svg: str, x: float, y: float, width: float, height: float) -> str:
    view_box, body = inner(svg)
    return f'<svg x="{x:.1f}" y="{y:.1f}" width="{width:.1f}" height="{height:.1f}" viewBox="{view_box}">{body}</svg>'


def lockups(files: dict[str, str]) -> dict[str, str]:
    """Emblem on a white disc, and vertical and horizontal lockups of emblem, wordmark and tagline."""
    emblem = (OUT / "imbonix-emblem.svg").read_text(encoding="utf-8")
    _, emblem_body = inner(emblem)
    disc = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="IMBONIX emblem">'
        '<circle cx="256" cy="256" r="256" fill="#FFFFFF"/>'
        f'<g transform="translate(24 24) scale(0.90625)">{emblem_body}</g></svg>\n'
    )

    def ratio(svg: str) -> float:
        w, h = [float(v) for v in inner(svg)[0].split()[2:]]
        return w / h

    word, tag = files["imbonix-wordmark.svg"], files["imbonix-tagline.svg"]
    # Vertical: emblem over wordmark over tagline, centred.
    width = 560.0
    word_w = 520.0
    word_h = word_w / ratio(word)
    tag_w = 420.0
    tag_h = tag_w / ratio(tag)
    vertical = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.0f} {420 + word_h + 24 + tag_h + 20:.0f}" role="img" '
        'aria-label="IMBONIX: Data for Inclusive Prosperity">'
        + nest(emblem, (width - 380) / 2, 10, 380, 380)
        + nest(word, (width - word_w) / 2, 410, word_w, word_h)
        + nest(tag, (width - tag_w) / 2, 410 + word_h + 24, tag_w, tag_h)
        + "</svg>\n"
    )
    # Horizontal: emblem beside the wordmark and tagline, as in the site header.
    size = 120.0
    word_w = 340.0
    word_h = word_w / ratio(word)
    tag_h = 14.0
    tag_w = tag_h * ratio(tag)
    text_h = word_h + 10 + tag_h
    horizontal = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size + 24 + max(word_w, tag_w):.0f} {size:.0f}" role="img" '
        'aria-label="IMBONIX: Data for Inclusive Prosperity">'
        + nest(emblem, 0, 0, size, size)
        + nest(word, size + 24, (size - text_h) / 2, word_w, word_h)
        + nest(tag, size + 24, (size - text_h) / 2 + word_h + 10, tag_w, tag_h)
        + "</svg>\n"
    )
    return {"imbonix-emblem-disc.svg": disc, "imbonix-logo.svg": vertical, "imbonix-lockup.svg": horizontal}


def main() -> None:
    files = {
        "imbonix-wordmark.svg": wordmark(NAVY, (BLUE, CYAN), BLUE, (CYAN, AZURE)),
        "imbonix-wordmark-on-dark.svg": wordmark("#FFFFFF", (AZURE, CYAN), AZURE, (CYAN, AZURE)),
        "imbonix-tagline.svg": tagline(BLUE),
        "imbonix-tagline-on-dark.svg": tagline("#FFFFFF"),
    }
    files["imbonix-tagline-on-dark.svg"] = files["imbonix-tagline-on-dark.svg"].replace(
        'fill="#FFFFFF"', 'fill="#FFFFFF" fill-opacity="0.72"'
    )
    files.update(lockups(files))
    for name, svg in files.items():
        (OUT / name).write_text(svg, encoding="utf-8")
        print(f"-> {name} ({len(svg) / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
