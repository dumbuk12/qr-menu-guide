#!/usr/bin/env python3
"""
Crop a product photo to a centered square thumbnail, matching the sizing
used by public/images/*.jpg in this project (square, object-fit: cover).

Detects the subject against a roughly flat background (works well for
product shots on a white/plain backdrop) and centers the crop on it,
instead of a blind center-crop that can cut the subject off-center.

Usage:
    python scripts/prepare-photo.py input.jpg public/images/item-name.jpg
    python scripts/prepare-photo.py input.jpg output.jpg --size 800

Requires: pip install pillow numpy
"""
import argparse
import numpy as np
from PIL import Image


def detect_subject_bbox(im, threshold=30):
    arr = np.asarray(im.convert("RGB")).astype(int)
    h, w, _ = arr.shape
    corner_pts = np.concatenate([
        arr[0:20, 0:20].reshape(-1, 3), arr[0:20, -20:].reshape(-1, 3),
        arr[-20:, 0:20].reshape(-1, 3), arr[-20:, -20:].reshape(-1, 3),
    ])
    bg = np.median(corner_pts, axis=0)
    diff = np.sqrt(((arr - bg) ** 2).sum(axis=2))
    mask = diff > threshold
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return None
    return xs.min(), ys.min(), xs.max(), ys.max(), tuple(int(c) for c in bg)


def make_square_crop(im, cx, cy, side, out_size, bgcolor):
    half = side / 2
    left, top = cx - half, cy - half
    canvas = Image.new("RGB", (round(side), round(side)), bgcolor)
    src_left, src_top = max(0, round(left)), max(0, round(top))
    src_right = min(im.width, round(left + side))
    src_bottom = min(im.height, round(top + side))
    region = im.convert("RGB").crop((src_left, src_top, src_right, src_bottom))
    canvas.paste(region, (src_left - round(left), src_top - round(top)))
    return canvas.resize((out_size, out_size), Image.LANCZOS)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--size", type=int, default=600, help="output side length in px (default: 600)")
    p.add_argument("--padding", type=float, default=1.15, help="padding factor around detected subject (default: 1.15 = 15%% margin)")
    p.add_argument("--quality", type=int, default=88)
    args = p.parse_args()

    im = Image.open(args.input)
    bbox = detect_subject_bbox(im)

    if bbox is None:
        # No clear subject detected (busy/textured background) — fall back
        # to a plain centered square crop using the shorter image dimension.
        w, h = im.size
        side = min(w, h)
        cx, cy = w / 2, h / 2
        bg = (255, 255, 255)
    else:
        x0, y0, x1, y1, bg = bbox
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        side = max(x1 - x0, y1 - y0) * args.padding

    result = make_square_crop(im, cx, cy, side, args.size, bg)
    result.save(args.output, quality=args.quality, optimize=True)
    print(f"Saved {args.output} ({args.size}x{args.size})")


if __name__ == "__main__":
    main()
