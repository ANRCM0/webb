#!/usr/bin/env python3
"""纯标准库的 PNG 像素比对（无 PIL 依赖）。

用法:
    python3 pngdiff.py before.png after.png [--diff out.png] [--json]

输出: 尺寸、不同像素比例、平均通道差、最大通道差；可选输出差异图（相同=白、不同=红）。
"""
import sys
import json
import zlib
import struct


def read_png(path):
    data = open(path, "rb").read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
    pos = 8
    width = height = None
    bit_depth = color_type = None
    idat = bytearray()
    while pos < len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        ctype = data[pos + 4:pos + 8]
        chunk = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if ctype == b"IHDR":
            width, height, bit_depth, color_type = struct.unpack(">IIBB", chunk[:10])
            interlace = chunk[12]
            assert bit_depth == 8, f"unsupported bit depth {bit_depth}"
            assert interlace == 0, "interlaced PNG unsupported"
        elif ctype == b"IDAT":
            idat += chunk
        elif ctype == b"IEND":
            break
    channels = {0: 1, 2: 3, 4: 2, 6: 4}[color_type]
    raw = zlib.decompress(bytes(idat))
    stride = width * channels
    out = bytearray(height * stride)
    prev = bytearray(stride)
    pos = 0
    for y in range(height):
        f = raw[pos]
        pos += 1
        line = bytearray(raw[pos:pos + stride])
        pos += stride
        if f == 1:
            for i in range(channels, stride):
                line[i] = (line[i] + line[i - channels]) & 0xFF
        elif f == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif f == 3:
            for i in range(stride):
                left = line[i - channels] if i >= channels else 0
                line[i] = (line[i] + ((left + prev[i]) >> 1)) & 0xFF
        elif f == 4:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                b = prev[i]
                c = prev[i - channels] if i >= channels else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 0xFF
        elif f != 0:
            raise ValueError(f"bad filter {f}")
        out[y * stride:(y + 1) * stride] = line
        prev = line
    return width, height, channels, out


def write_png(path, width, height, rgb):
    raw = bytearray()
    stride = width * 3
    for y in range(height):
        raw.append(0)
        raw += rgb[y * stride:(y + 1) * stride]
    def chunk(tag, payload):
        return (struct.pack(">I", len(payload)) + tag + payload
                + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF))
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    open(path, "wb").write(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header)
                           + chunk(b"IDAT", zlib.compress(bytes(raw), 6)) + chunk(b"IEND", b""))


def main():
    argv = sys.argv[1:]
    flags = {a for a in argv if a.startswith("--")}
    args = [a for a in argv if not a.startswith("--") and (argv.index(a) == 0 or argv[argv.index(a) - 1] != "--diff")]
    before, after = args[0], args[1]
    w1, h1, c1, p1 = read_png(before)
    w2, h2, c2, p2 = read_png(after)
    w, h = min(w1, w2), min(h1, h2)
    diff_out = argv[argv.index("--diff") + 1] if "--diff" in flags else None

    changed = 0
    total_delta = 0
    max_delta = 0
    diff = bytearray(w * h * 3) if diff_out else None
    for y in range(h):
        for x in range(w):
            i1 = (y * w1 + x) * c1
            i2 = (y * w2 + x) * c2
            d = 0
            for k in range(3):
                v1 = p1[i1 + k] if c1 >= 3 else p1[i1]
                v2 = p2[i2 + k] if c2 >= 3 else p2[i2]
                dd = abs(v1 - v2)
                d += dd
                max_delta = max(max_delta, dd)
            total_delta += d
            if d > 24:                      # 单像素三通道累计差 > 24 视为“不同”
                changed += 1
                if diff:
                    j = (y * w + x) * 3
                    diff[j:j + 3] = b"\xff\x40\x40"
            elif diff:
                j = (y * w + x) * 3
                diff[j:j + 3] = b"\xff\xff\xff"
    if diff_out:
        write_png(diff_out, w, h, diff)
    result = {
        "before": {"file": before, "size": [w1, h1], "channels": c1},
        "after": {"file": after, "size": [w2, h2], "channels": c2},
        "compared": [w, h],
        "size_mismatch": [w1, h1] != [w2, h2],
        "changed_pixels": changed,
        "changed_ratio": round(changed / (w * h), 6),
        "mean_channel_delta": round(total_delta / (w * h * 3), 3),
        "max_channel_delta": max_delta,
        "diff_image": diff_out,
    }
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
