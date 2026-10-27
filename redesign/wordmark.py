# Outlines "VibeFounder" from Schibsted Grotesk at one weight with the site's own kerning, and replaces the tittle of
# the i by two overlapping squares: cobalt and marigold, the duo colour where they overlap.
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.recordingPen import RecordingPen, DecomposingRecordingPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
f = instantiateVariableFont(TTFont(sys.argv[1]), {"wght": 860})
gs = f.getGlyphSet(); cmap = f.getBestCmap(); hmtx = f['hmtx']
text = "VibeFounder"
kern = {"Vi": -40, "ib": -10, "be": -20, "eF": -70, "Fo": -60, "ou": -20, "un": -14, "nd": -20, "de": -24, "er": -16}
x = 0; d = []; dot = None
for i, ch in enumerate(text):
    g = cmap[ord(ch)]
    rec = DecomposingRecordingPen(gs); gs[g].draw(rec)
    contours, cur = [], []
    for op in rec.value:
        cur.append(op)
        if op[0] in ('closePath', 'endPath'): contours.append(cur); cur = []
    for c in contours:
        b = BoundsPen(gs); r = RecordingPen(); r.value = c; r.replay(b)
        if ch == 'i' and b.bounds[1] > 1000:
            dot = (x + b.bounds[0], b.bounds[1], x + b.bounds[2], b.bounds[3]); continue
        pen = SVGPathPen(gs); r.replay(TransformPen(pen, (1, 0, 0, -1, x, 1500))); d.append(pen.getCommands())
    x += hmtx[g][0] + (kern.get(text[i:i+2], -12) if i + 1 < len(text) else 0)
x0, y0, x1, y1 = dot; s = (x1 - x0) * 0.78; cx = (x0 + x1) / 2; top = 1500 - y1 - 60
ax, ay = cx - s * 0.9, top; bx, by = cx - s * 0.25, top + s * 0.45
w = round(x)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {min(0, ay - 20):.0f} {w} {1560 - min(0, ay - 20):.0f}" role="img" aria-label="VibeFounder">
<path fill="#6c2443" d="{' '.join(d)}"/>
<rect x="{ax:.0f}" y="{ay:.0f}" width="{s:.0f}" height="{s:.0f}" fill="#2f4fd8"/>
<rect x="{bx:.0f}" y="{by:.0f}" width="{s:.0f}" height="{s:.0f}" fill="#f2ad1c"/>
<rect x="{bx:.0f}" y="{by:.0f}" width="{ax + s - bx:.0f}" height="{ay + s - by:.0f}" fill="#de5397"/>
</svg>'''
print(svg)
