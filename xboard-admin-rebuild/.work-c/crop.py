#!/usr/bin/env python3
"""裁剪 PNG 区域并（可选）整数放大，纯标准库。用法: crop.py in.png out.png x0 y0 x1 y1 [scale]"""
import sys, zlib, struct
sys.path.insert(0, "/workspace/reconstruction/tools")
from pngdiff import read_png


def write_png(path, w, h, ch, px):
    out = px if ch in (3, 4) else bytearray()
    stride = w * ch
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw += out[y * stride:(y + 1) * stride]
    ct = {1: 0, 2: 4, 3: 2, 4: 6}[ch]
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, ct, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 6))
    png += chunk(b"IEND", b"")
    open(path, "wb").write(png)


def main(src, dst, x0, y0, x1, y1, scale=1):
    w, h, ch, px = read_png(src)
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(w, x1), min(h, y1)
    cw, chh = x1 - x0, y1 - y0
    ow, oh = cw * scale, chh * scale
    out = bytearray(ow * oh * ch)
    for y in range(oh):
        sy = y0 + y // scale
        for x in range(ow):
            sx = x0 + x // scale
            si = (sy * w + sx) * ch
            di = (y * ow + x) * ch
            out[di:di + ch] = px[si:si + ch]
    write_png(dst, ow, oh, ch, out)
    print(f"{dst}: {ow}x{oh} from {src}[{x0},{y0}-{x1},{y1}] scale={scale}")


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a[0], a[1], int(a[2]), int(a[3]), int(a[4]), int(a[5]), int(a[6]) if len(a) > 6 else 1)
