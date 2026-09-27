"""Generate the IMBONIX data colour ramps from the logo's hues (apps/web/src/lib/palette.ts).

    python scripts/brand/generate_palette.py

Each ramp keeps one logo hue (gold, blue, cyan, navy, azure) or a neutral, and steps evenly in OKLCH lightness from
0.76 to 0.31, reducing chroma only where a colour falls outside sRGB. The script prints the logo hues, each ramp, the
contrast of its lightest step against white, the weakest label contrast (navy or white text, whichever is better)
and the contrast of step 4 as text. Standard library only.
"""
import math, json

def srgb_to_lin(c): return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
def lin_to_srgb(c): return 12.92*c if c <= 0.0031308 else 1.055*c**(1/2.4)-0.055
def hex_to_rgb(h): h=h.lstrip('#'); return [int(h[i:i+2],16)/255 for i in (0,2,4)]
def rgb_to_hex(rgb): return '#'+''.join(f'{round(max(0,min(1,c))*255):02X}' for c in rgb)
def rgb_to_oklab(rgb):
    r,g,b=[srgb_to_lin(c) for c in rgb]
    l=0.4122214708*r+0.5363325363*g+0.0514459929*b; m=0.2119034982*r+0.6806995451*g+0.1073969566*b; s=0.0883024619*r+0.2817188376*g+0.6299787005*b
    l,m,s=[x**(1/3) for x in (l,m,s)]
    return [0.2104542553*l+0.7936177850*m-0.0040720468*s, 1.9779984951*l-2.4285922050*m+0.4505937099*s, 0.0259040371*l+0.7827717662*m-0.8086757660*s]
def oklab_to_rgb(L,a,b):
    l=L+0.3963377774*a+0.2158037573*b; m=L-0.1055613458*a-0.0638541728*b; s=L-0.0894841775*a-1.2914855480*b
    l,m,s=l**3,m**3,s**3
    r=4.0767416621*l-3.3077115913*m+0.2309699292*s; g=-1.2684380046*l+2.6097574011*m-0.3413193965*s; bb=-0.0041960863*l-0.7034186147*m+1.7076147010*s
    return [lin_to_srgb(x) if x>0 else 0 for x in (r,g,bb)], all(-1e-4<=x<=1+1e-4 for x in (r,g,bb))
def oklch(L,C,H):
    # reduce chroma until in gamut
    while True:
        rgb, ok = oklab_to_rgb(L, C*math.cos(math.radians(H)), C*math.sin(math.radians(H)))
        if ok or C < 0.002: return rgb_to_hex(rgb)
        C -= 0.002
def hue_of(h):
    L,a,b = rgb_to_oklab(hex_to_rgb(h)); return L, math.hypot(a,b), (math.degrees(math.atan2(b,a))+360)%360
def lum(h):
    r,g,b=[srgb_to_lin(c) for c in hex_to_rgb(h)]; return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
    x,y=sorted([lum(a),lum(b)],reverse=True); return (x+0.05)/(y+0.05)

LOGO = {"navy":"#002454","blue":"#0060B4","azure":"#0090E4","cyan":"#00C0D8","gold":"#F8B828"}
for k,v in LOGO.items():
    L,C,H = hue_of(v); print(f"logo {k:5} {v} OKLCH L={L:.3f} C={C:.3f} H={H:.1f}")

Ls = [0.76, 0.65, 0.54, 0.425, 0.31]
def ramp(hues, chromas): return [oklch(L,c,h) for L,c,h in zip(Ls, chromas, hues)]
FAM = {
  # dimension: (hues per step, chroma per step)
  "poverty":   ([82, 76, 68, 60, 52],       [0.12, 0.15, 0.15, 0.12, 0.09]),   # logo gold -> bronze
  "finance":   ([252]*5,                    [0.08, 0.13, 0.16, 0.16, 0.12]),   # logo blue
  "nutrition": ([212, 214, 216, 218, 220],  [0.09, 0.12, 0.12, 0.10, 0.08]),   # logo cyan
  "shocks":    ([266]*5,                    [0.05, 0.08, 0.10, 0.10, 0.09]),   # logo navy (indigo side)
  "digital":   ([238]*5,                    [0.09, 0.13, 0.15, 0.13, 0.10]),   # logo azure
  "work":      ([250]*5,                    [0.025, 0.035, 0.045, 0.05, 0.05]),# steel
  "health":    ([196]*5,                    [0.08, 0.11, 0.11, 0.09, 0.07]),   # teal side of cyan
  "people":    ([255]*5,                    [0.012, 0.015, 0.018, 0.02, 0.02]),# neutral slate
}
INK="#002454"
out={}
for name,(h,c) in FAM.items():
    r=ramp(h,c); out[name]=r
    labels=[max(cr(x,INK),cr(x,'#FFFFFF')) for x in r]
    print(f"{name:9} {r}  light-end vs white {cr(r[0],'#FCFCFB'):.2f}  min label {min(labels):.2f}  step4 as text {cr(r[3],'#FFFFFF'):.2f}/{cr(r[3],'#F4F7FB'):.2f}")
print(json.dumps(out, indent=1))
