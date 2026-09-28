"""Generate the IMBONIX colours from the brand cyan (apps/web/src/lib/palette.ts).

    python scripts/brand/generate_palette.py

The website uses two colours only: bright cyan #02A5DC and white. Text is a neutral near black so it can be read,
data scales are steps of the cyan, and a neutral grey marks missing data, baselines and anything that recedes.

Each ramp keeps one brand hue and steps evenly in OKLCH lightness from 0.775 to 0.32, reducing chroma only where a
colour falls outside sRGB. The script prints each brand colour in OKLCH, each ramp, the contrast of its lightest step
against white, the weakest label contrast (near black or white text, whichever is better) and the text shades used on
light backgrounds. Standard library only.
"""
import json
import math


def srgb_to_linear(channel):
    return channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4


def linear_to_srgb(channel):
    return 12.92 * channel if channel <= 0.0031308 else 1.055 * channel ** (1 / 2.4) - 0.055


def hex_to_rgb(hex_colour):
    hex_colour = hex_colour.lstrip("#")
    return [int(hex_colour[index:index + 2], 16) / 255 for index in (0, 2, 4)]


def rgb_to_hex(rgb):
    return "#" + "".join(f"{round(max(0, min(1, channel)) * 255):02X}" for channel in rgb)


def rgb_to_oklab(rgb):
    red, green, blue = [srgb_to_linear(channel) for channel in rgb]
    long_cone = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue
    medium_cone = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue
    short_cone = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue
    long_cone, medium_cone, short_cone = [value ** (1 / 3) for value in (long_cone, medium_cone, short_cone)]
    return [
        0.2104542553 * long_cone + 0.7936177850 * medium_cone - 0.0040720468 * short_cone,
        1.9779984951 * long_cone - 2.4285922050 * medium_cone + 0.4505937099 * short_cone,
        0.0259040371 * long_cone + 0.7827717662 * medium_cone - 0.8086757660 * short_cone,
    ]


def oklab_to_rgb(lightness, axis_a, axis_b):
    long_cone = (lightness + 0.3963377774 * axis_a + 0.2158037573 * axis_b) ** 3
    medium_cone = (lightness - 0.1055613458 * axis_a - 0.0638541728 * axis_b) ** 3
    short_cone = (lightness - 0.0894841775 * axis_a - 1.2914855480 * axis_b) ** 3
    red = 4.0767416621 * long_cone - 3.3077115913 * medium_cone + 0.2309699292 * short_cone
    green = -1.2684380046 * long_cone + 2.6097574011 * medium_cone - 0.3413193965 * short_cone
    blue = -0.0041960863 * long_cone - 0.7034186147 * medium_cone + 1.7076147010 * short_cone
    in_gamut = all(-1e-4 <= value <= 1 + 1e-4 for value in (red, green, blue))
    return [linear_to_srgb(value) if value > 0 else 0 for value in (red, green, blue)], in_gamut


def oklch(lightness, chroma, hue):
    """An OKLCH colour as hex, lowering chroma until it fits in sRGB."""
    while True:
        rgb, in_gamut = oklab_to_rgb(lightness, chroma * math.cos(math.radians(hue)), chroma * math.sin(math.radians(hue)))
        if in_gamut or chroma < 0.002:
            return rgb_to_hex(rgb)
        chroma -= 0.002


def to_oklch(hex_colour):
    lightness, axis_a, axis_b = rgb_to_oklab(hex_to_rgb(hex_colour))
    return lightness, math.hypot(axis_a, axis_b), (math.degrees(math.atan2(axis_b, axis_a)) + 360) % 360


def luminance(hex_colour):
    red, green, blue = [srgb_to_linear(channel) for channel in hex_to_rgb(hex_colour)]
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue


def contrast(first, second):
    lighter, darker = sorted([luminance(first), luminance(second)], reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


BRAND = {"cyan": "#02A5DC"}
WHITE = "#FFFFFF"
CYAN_HUE = to_oklch(BRAND["cyan"])[2]
lightness, chroma, hue = to_oklch(BRAND["cyan"])
print(f"brand cyan  {BRAND['cyan']}  OKLCH L={lightness:.3f} C={chroma:.3f} H={hue:.1f}  on white {contrast(BRAND['cyan'], WHITE):.2f}")

STEPS = [0.775, 0.665, 0.555, 0.44, 0.32]
# The cyan hue is lighter at the same lightness, so its first step starts a little darker to clear white at 2:1.
FIRST_STEP = {"cyan": 0.77}
RAMP_CHROMA = {
    "cyan": [0.08, 0.12, 0.12, 0.10, 0.08],
    # A neutral grey, with the faintest cool cast, for counts, baselines and anything that should recede.
    "grey": [0.006, 0.007, 0.008, 0.008, 0.008],
}
ramps = {}
for name, chromas in RAMP_CHROMA.items():
    steps = [FIRST_STEP.get(name, STEPS[0])] + STEPS[1:]
    ramp = [oklch(step, step_chroma, CYAN_HUE) for step, step_chroma in zip(steps, chromas)]
    ramps[name] = ramp
    labels = [max(contrast(step, "#1B1E20"), contrast(step, WHITE)) for step in ramp]
    print(f"{name:5} {ramp}  light end on white {contrast(ramp[0], WHITE):.2f}  weakest label {min(labels):.2f}")

# Text and surfaces. Text is a neutral near black, the only dark colour on the site; surfaces are white and pale
# cyan tints of the brand hue.
tokens = {
    "ink": oklch(0.235, 0.008, CYAN_HUE),
    "muted": oklch(0.50, 0.012, CYAN_HUE),
    "line": oklch(0.925, 0.008, CYAN_HUE),
    "paper": oklch(0.975, 0.010, CYAN_HUE),
    "noData": oklch(0.94, 0.006, CYAN_HUE),
    "mist": oklch(0.955, 0.018, CYAN_HUE),
    "mistStrong": oklch(0.925, 0.028, CYAN_HUE),
    "cyanSoft": oklch(0.96, 0.025, CYAN_HUE),
    "cyanHover": oklch(0.74, 0.13, CYAN_HUE),
}
# Cyan for links and small text: the lightest step of the cyan hue that keeps 4.6:1 on white and on every pale
# surface, so it stays as bright as it can while every text use passes WCAG AA.
surfaces = [WHITE, tokens["paper"], tokens["mist"], tokens["cyanSoft"]]
tokens["cyanInk"] = next(
    shade
    for shade in (oklch(step / 1000, 0.12, CYAN_HUE) for step in range(700, 300, -5))
    if min(contrast(shade, surface) for surface in surfaces) >= 4.6
)
for name, value in tokens.items():
    print(f"token {name:10} {value}  on white {contrast(value, WHITE):.2f}  on paper {contrast(value, tokens['paper']):.2f}")
print(f"ink on cyan {contrast(tokens['ink'], BRAND['cyan']):.2f}  muted on paper {contrast(tokens['muted'], tokens['paper']):.2f}")
print(json.dumps({"ramps": ramps, "tokens": tokens}, indent=1))
