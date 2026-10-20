#!/usr/bin/env python3
"""按水平带/垂直带统计两张 PNG 的差异分布（纯标准库，复用 pngdiff.read_png）。"""
import sys, json
sys.path.insert(0, "/workspace/reconstruction/tools")
from pngdiff import read_png

def main(a, b, band=50):
    wa, ha, ca, pa = read_png(a)[:4] if len(read_png(a)) >= 4 else (0,0,0,None)
    img_a = read_png(a)
    img_b = read_png(b)
    # normalise: read_png returns (w,h,channels,pixels?) — detect shape
    def unpack(img):
        if len(img) == 4:
            w, h, ch, px = img
        else:
            raise SystemExit("unexpected read_png shape: %d" % len(img))
        return w, h, ch, px
    wa, ha, cha, pa = unpack(img_a)
    wb, hb, chb, pb = unpack(img_b)
    if (wa, ha) != (wb, hb):
        raise SystemExit(f"size mismatch {wa}x{ha} vs {wb}x{hb}")
    ch = min(cha, chb)
    rows = []
    for y0 in range(0, ha, band):
        y1 = min(y0 + band, ha)
        diff = 0
        total = 0
        for y in range(y0, y1):
            base = y * wa * ch
            for x in range(wa):
                i = base + x * ch
                total += 1
                if abs(pa[i] - pb[i]) > 8 or abs(pa[i+1] - pb[i+1]) > 8 or abs(pa[i+2] - pb[i+2]) > 8:
                    diff += 1
        rows.append({"y0": y0, "y1": y1, "pct": round(diff / max(total, 1) * 100, 2)})
    cols = []
    for x0 in range(0, wa, band):
        x1 = min(x0 + band, wa)
        diff = 0
        total = 0
        for y in range(ha):
            for x in range(x0, x1):
                i = (y * wa + x) * ch
                total += 1
                if abs(pa[i] - pb[i]) > 8 or abs(pa[i+1] - pb[i+1]) > 8 or abs(pa[i+2] - pb[i+2]) > 8:
                    diff += 1
        cols.append({"x0": x0, "x1": x1, "pct": round(diff / max(total, 1) * 100, 2)})
    print(json.dumps({"rows": rows, "cols": cols}, indent=1))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 50)
