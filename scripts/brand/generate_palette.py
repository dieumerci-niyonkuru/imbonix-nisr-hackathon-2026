"""Generate the IMBONIX colour ramps from the two brand colours (apps/web/src/lib/palette.ts).

    python scripts/brand/generate_palette.py

The website uses two brand colours only: deep navy #022657 (main) and bright cyan #02A5DC (the accent). Every
other colour is a lighter or darker step of one of them, plus a neutral blue grey for missing data and baselines.

Each ramp keeps one brand hue and steps evenly in OKLCH lightness from 0.775 to 0.32, reducing chroma only where a
colour falls outside sRGB. The script prints each brand colour in OKLCH, each ramp, the contrast of its lightest step
against white, the weakest label contrast (navy or white text, whichever is better) and the text shades used on
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


BRAND = {"navy": "#022657", "cyan": "#02A5DC"}
WHITE, PAPER, MIST = "#FFFFFF", "#F4F7FB", "#EEF3F9"
for name, value in BRAND.items():
    lightness, chroma, hue = to_oklch(value)
    print(f"brand {name:5} {value}  OKLCH L={lightness:.3f} C={chroma:.3f} H={hue:.1f}  on white {contrast(value, WHITE):.2f}")

HUES = {name: to_oklch(value)[2] for name, value in BRAND.items()}
STEPS = [0.775, 0.665, 0.555, 0.44, 0.32]
# The cyan hue is lighter at the same lightness, so its first step starts a little darker to clear white at 2:1.
FIRST_STEP = {"cyan": 0.77}
RAMP_CHROMA = {
    "navy": [0.05, 0.08, 0.10, 0.11, 0.10],
    "cyan": [0.08, 0.12, 0.12, 0.10, 0.08],
    # A neutral blue grey on the navy hue, for counts, baselines and anything that should recede.
    "steel": [0.02, 0.03, 0.04, 0.045, 0.045],
}
ramps = {}
for name, chromas in RAMP_CHROMA.items():
    hue = HUES["navy" if name == "steel" else name]
    steps = [FIRST_STEP.get(name, STEPS[0])] + STEPS[1:]
    ramp = [oklch(lightness, chroma, hue) for lightness, chroma in zip(steps, chromas)]
    ramps[name] = ramp
    labels = [max(contrast(step, BRAND["navy"]), contrast(step, WHITE)) for step in ramp]
    print(f"{name:5} {ramp}  light end on white {contrast(ramp[0], WHITE):.2f}  weakest label {min(labels):.2f}")

# Shades for the interface: cyan text on light backgrounds, pale surfaces, a hover step, and navy surface steps.
tokens = {
    "cyanSoft": oklch(0.96, 0.025, HUES["cyan"]),
    "cyanHover": oklch(0.74, 0.13, HUES["cyan"]),
    "navyDeep": oklch(0.20, 0.08, HUES["navy"]),
    "navy800": oklch(0.33, 0.10, HUES["navy"]),
    "navy700": oklch(0.39, 0.11, HUES["navy"]),
    "navy600": oklch(0.45, 0.12, HUES["navy"]),
}
# Cyan for links and small text: the lightest step of the cyan hue that keeps 4.6:1 on white, paper, mist and the
# pale cyan surface, so it stays as bright as it can while every text use passes WCAG AA.
surfaces = [WHITE, PAPER, MIST, tokens["cyanSoft"]]
tokens["cyanInk"] = next(
    shade
    for shade in (oklch(step / 1000, 0.12, HUES["cyan"]) for step in range(700, 300, -5))
    if min(contrast(shade, surface) for surface in surfaces) >= 4.6
)
for name, value in tokens.items():
    print(f"token {name:9} {value}  on white {contrast(value, WHITE):.2f}  on paper {contrast(value, PAPER):.2f}")
print(f"navy text on cyan {contrast(BRAND['navy'], BRAND['cyan']):.2f}  cyan on navy {contrast(BRAND['cyan'], BRAND['navy']):.2f}")
print(json.dumps({"ramps": ramps, "tokens": tokens}, indent=1))
