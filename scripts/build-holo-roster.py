#!/usr/bin/env python3
"""Build Route-1 commemorative stills + OG + pool.json for every official portrait.

Official 384×384 busts only. Soft card-space veil hides the hard crop.
No gothic-moon / cathedral house frame. Character-forward plate with a slim
holographic rim. Optional break-out uses only existing official alpha
(hair, ears, hands, tassels) overflowing a slightly smaller card window —
never invents anatomy. MIT effect ideas adapted from deepslit/holo-card-3d
v2.4.0 (break-the-frame mask: top mode, until_v, feather, contact shadow);
their theme-pack art is not used.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
CHARS_JSON = ROOT / "public" / "data" / "characters.json"
PORTRAIT_DIR = ROOT / "public" / "img" / "characters"
OUT_CARDS = ROOT / "public" / "holo" / "cards"
OUT_OG = ROOT / "public" / "holo" / "og"
OUT_POOL = ROOT / "public" / "holo" / "pool.json"
OUT_TS = ROOT / "src" / "lib" / "holo-pool.generated.ts"
WORKER_POOL = ROOT / "workers" / "holo" / "src" / "pool.json"
FONT_REG = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
FONT_BOLD = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"

CANVAS_W, CANVAS_H = 1200, 1600
OUT_W, OUT_H = 690, 960
OG_W, OG_H = 1200, 630

# Card body insets on the 1200×1600 master. CSS .card-fx-clip must stay in sync:
#   left/right = BODY_INSET_X / CANVAS_W = 4.333%
#   top        = BODY_INSET_TOP / CANVAS_H = 5.500%
#   bottom     = BODY_INSET_BOTTOM / CANVAS_H = 3.500%
BODY_INSET_X = 52
BODY_INSET_TOP = 88
BODY_INSET_BOTTOM = 56
CORNER_RADIUS = 52

# Character-forward placement: square is slightly wider than the body so
# official edge pixels can overflow the slim rim. Top sits above the body.
TARGET_WIDTH_FRAC = 0.992
PORTRAIT_OVERHANG_TOP = 52

SRC_FADE_BOTTOM = 18
SRC_FADE_SIDE = 16
EDGE_TOUCH_MIN = 18
ALPHA_TOUCH = 16
VEIL_START = 0.62
VEIL_END = 1.00

# deepslit/holo-card-3d v2.4.0 breakout defaults (top mode).
BREAKOUT_UNTIL_V = 0.62
BREAKOUT_FEATHER = 0.05

# Soft-launch alias folders. This pass rebuilds their pixels (frame removed).
LEGACY_ART = {
    107501: "daring_tact_107501",
    100101: "special_week_100101",
    100701: "gold_ship_100701",
}


def smoothstep(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def fade_source_borders(arr):
    a = arr[..., 3].astype(np.float32)
    h, w = a.shape
    fade = np.ones((h, w), np.float32)

    touch = a[h - 1] >= ALPHA_TOUCH
    if int(touch.sum()) >= EDGE_TOUCH_MIN:
        yy = np.arange(h)
        fade[:, touch] = np.minimum(fade[:, touch], smoothstep(((h - 1) - yy) / SRC_FADE_BOTTOM)[:, None])

    touch = a[:, 0] >= ALPHA_TOUCH
    if int(touch.sum()) >= EDGE_TOUCH_MIN:
        xx = np.arange(w)
        fade[touch, :] = np.minimum(fade[touch, :], smoothstep(xx / SRC_FADE_SIDE)[None, :])

    touch = a[:, w - 1] >= ALPHA_TOUCH
    if int(touch.sum()) >= EDGE_TOUCH_MIN:
        xx = np.arange(w)
        fade[touch, :] = np.minimum(fade[touch, :], smoothstep((w - 1 - xx) / SRC_FADE_SIDE)[None, :])

    out = arr.copy()
    out[..., 3] = np.clip(a * fade, 0, 255).astype(np.uint8)
    return out


def sample_hem_color(arr):
    y0 = int(arr.shape[0] * 0.62)
    region = arr[y0:, ...]
    band = region[..., 3] >= 80
    if int(band.sum()) < 50:
        region = arr
        band = region[..., 3] >= 80
    rgb = region[..., :3][band]
    med = np.median(rgb, axis=0)
    med = np.clip(med.astype(np.float32) * 0.85 + 40, 0, 255)
    if med.mean() > 230:
        med = np.array([210, 224, 235], dtype=np.float32)
    return tuple(int(c) for c in med)


def sample_accent(arr):
    a = arr[..., 3] >= 80
    rgb = arr[..., :3][a].astype(np.float32)
    if len(rgb) < 20:
        return (120, 150, 200)
    # Prefer mid-sat colors (skip near-white skin and near-black hair)
    luma = rgb @ np.array([0.2126, 0.7152, 0.0722])
    mx = rgb.max(axis=1)
    mn = rgb.min(axis=1)
    sat = np.where(mx > 1e-6, (mx - mn) / np.maximum(mx, 1e-6), 0)
    mask = (luma > 40) & (luma < 210) & (sat > 0.18)
    pick = rgb[mask] if int(mask.sum()) >= 30 else rgb
    med = np.median(pick, axis=0)
    return tuple(int(c) for c in med)


def make_mist(size, color, cy, rx, ry, strength=90):
    w, h = size
    ys, xs = np.ogrid[:h, :w]
    nx = (xs - w / 2) / max(rx, 1)
    ny = (ys - cy) / max(ry, 1)
    d = np.sqrt(nx * nx + ny * ny)
    fall = np.clip(1.0 - d, 0, 1)
    fall = fall * fall * (3 - 2 * fall)
    alpha = (fall * strength).astype(np.uint8)
    layer = Image.new("RGBA", size, color + (0,))
    la = np.array(layer)
    la[..., 3] = alpha
    return Image.fromarray(la, "RGBA").filter(ImageFilter.GaussianBlur(radius=max(10, ry // 7)))


def apply_card_veil(placed, top, left, tw, th):
    arr = np.array(placed)
    a = arr[..., 3].astype(np.float32)
    h, w = a.shape
    ys = np.arange(h)[:, None]
    xs = np.arange(w)[None, :]
    cx = left + tw / 2
    nx = (xs - cx) / (tw / 2)
    arc = 1.0 - 0.10 * np.clip(nx * nx, 0, 1)
    start = top + VEIL_START * th
    end = top + VEIL_END * th * arc
    t = (end - ys) / np.clip(end - start, 1, None)
    veil = smoothstep(t)
    side_pad = tw * 0.04
    x0, x1 = left, left + tw
    sx = np.ones((1, w), np.float32)
    sx = np.minimum(sx, smoothstep((xs - x0) / side_pad))
    sx = np.minimum(sx, smoothstep((x1 - xs) / side_pad))
    lower = smoothstep((ys - (top + 0.45 * th)) / (0.12 * th))
    side = 1.0 - lower * (1.0 - sx)
    veil = veil * side
    arr[..., 3] = np.clip(a * veil, 0, 255).astype(np.uint8)
    zone = ((veil < 0.98) & (a > 0)).astype(np.float32)
    blur = np.array(Image.fromarray(arr[..., 3], "L").filter(ImageFilter.GaussianBlur(radius=3.0)), dtype=np.float32)
    arr[..., 3] = np.clip(arr[..., 3].astype(np.float32) * (1 - zone) + blur * zone, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def rounded_mask(size, radius) -> Image.Image:
    w, h = size
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=255)
    return m


def load_font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size=size, index=index)
    except Exception:
        return ImageFont.load_default()


def text_width(draw, text, font):
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0]


def draw_nameplate(canvas: Image.Image, left: str, right: str) -> Image.Image:
    """Small dark capsule near the lower window, matching the approved stills."""
    im = canvas.copy()
    draw = ImageDraw.Draw(im)
    font = load_font(FONT_REG, 28)
    left = (left or "").strip()
    right = (right or "").strip()
    label = "  ·  ".join(p for p in (left, right) if p)
    if not label:
        return im
    # Shrink if too long
    max_w = 720
    size = 28
    while text_width(draw, label, font) > max_w and size > 18:
        size -= 1
        font = load_font(FONT_REG, size)
    tw = text_width(draw, label, font)
    pad_x, pad_y = 28, 12
    bw, bh = tw + pad_x * 2, size + pad_y * 2
    cx, cy = CANVAS_W // 2, 1472
    x0, y0 = cx - bw // 2, cy - bh // 2
    x1, y1 = x0 + bw, y0 + bh
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((x0, y0, x1, y1), radius=bh // 2, fill=(10, 12, 18, 200), outline=(220, 228, 240, 70), width=2)
    im = Image.alpha_composite(im, overlay)
    draw = ImageDraw.Draw(im)
    # Vertically center text
    bbox = draw.textbbox((0, 0), label, font=font)
    th = bbox[3] - bbox[1]
    draw.text((cx - tw / 2, cy - th / 2 - bbox[1]), label, font=font, fill=(236, 240, 246, 255))
    return im


def add_soft_sheen(card: Image.Image) -> Image.Image:
    """A faint baked diagonal highlight so stills don't look dead when foil JS is off."""
    w, h = card.size
    ys, xs = np.ogrid[:h, :w]
    t = ((xs / w) * 0.7 + (ys / h) * 0.3)
    band = np.exp(-((t - 0.42) ** 2) / (2 * 0.055 ** 2))
    # Soft plate highlight only — no edge boost that would read as a drawn frame.
    alpha = (band * 36).astype(np.uint8)
    sheen = np.zeros((h, w, 4), np.uint8)
    # iridescent-ish: shift rgb along the band
    sheen[..., 0] = 200
    sheen[..., 1] = 230
    sheen[..., 2] = 255
    sheen[..., 3] = alpha
    layer = Image.fromarray(sheen, "RGBA")
    return Image.alpha_composite(card, layer)


def make_og(card: Image.Image) -> Image.Image:
    """1.91:1 social crop, character-centered, no letterbox."""
    w, h = card.size
    target_ratio = OG_W / OG_H
    crop_h = w / target_ratio
    if crop_h > h:
        crop_h = h
        crop_w = h * target_ratio
        x0 = int((w - crop_w) / 2)
        y0 = 0
        crop = card.crop((x0, 0, x0 + int(crop_w), h))
    else:
        # Bias up so the face stays in frame (bust is upper-mid)
        y0 = int(h * 0.10)
        if y0 + crop_h > h:
            y0 = int(h - crop_h)
        crop = card.crop((0, y0, w, int(y0 + crop_h)))
    # Flatten onto dark in case of residual alpha
    rgb = Image.new("RGB", crop.size, (8, 10, 18))
    rgb.paste(crop, mask=crop.split()[-1] if crop.mode == "RGBA" else None)
    return rgb.resize((OG_W, OG_H), Image.Resampling.LANCZOS)



def body_box():
    return (
        BODY_INSET_X,
        BODY_INSET_TOP,
        CANVAS_W - BODY_INSET_X,
        CANVAS_H - BODY_INSET_BOTTOM,
    )


def body_mask_image() -> Image.Image:
    x0, y0, x1, y1 = body_box()
    m = Image.new("L", (CANVAS_W, CANVAS_H), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle((x0, y0, x1 - 1, y1 - 1), radius=CORNER_RADIUS, fill=255)
    return m


def place_portrait(official: Image.Image) -> tuple[Image.Image, int, int, int, int]:
    cleaned = fade_source_borders(np.array(official))
    cleaned_im = Image.fromarray(cleaned, "RGBA")
    target_w = int(CANVAS_W * TARGET_WIDTH_FRAC)
    scale = target_w / official.width
    tw, th = target_w, int(round(official.height * scale))
    top = BODY_INSET_TOP - PORTRAIT_OVERHANG_TOP
    if top < 8:
        top = 8
    left = (CANVAS_W - tw) // 2
    scaled = cleaned_im.resize((tw, th), Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    layer.paste(scaled, (left, top), scaled)
    layer = apply_card_veil(layer, top, left, tw, th)
    return layer, top, left, tw, th


def make_backdrop(accent: tuple[int, int, int], seed: int) -> Image.Image:
    """Original dark plate — not a copied theme pack, not a cathedral."""
    w, h = CANVAS_W, CANVAS_H
    ys, xs = np.ogrid[:h, :w]
    rng = np.random.default_rng(seed)
    # Base navy → slightly lifted mid
    t = ys / max(h - 1, 1)
    base = np.zeros((h, w, 3), np.float32)
    base[..., 0] = 8 + 10 * t
    base[..., 1] = 10 + 14 * t
    base[..., 2] = 18 + 22 * t
    # Radial glow behind the bust (upper-mid)
    cx, cy = w / 2, h * 0.38
    rx, ry = w * 0.46, h * 0.40
    nx = (xs - cx) / rx
    ny = (ys - cy) / ry
    fall = np.clip(1.0 - np.sqrt(nx * nx + ny * ny), 0, 1)
    fall = fall * fall * (3 - 2 * fall)
    acc = np.array(accent, dtype=np.float32)
    glow = acc * 0.38 + np.array([30, 48, 90], dtype=np.float32)
    base = base * (1.0 - 0.42 * fall[..., None]) + glow * (0.42 * fall[..., None])
    # Subtle seed-stable temperature so the set is not identical
    warm = float(rng.uniform(-10, 14))
    base[..., 0] = np.clip(base[..., 0] + warm * 0.35, 0, 255)
    base[..., 2] = np.clip(base[..., 2] - warm * 0.22, 0, 255)
    # Soft vignette
    vx = (xs - w / 2) / (w * 0.72)
    vy = (ys - h / 2) / (h * 0.72)
    vig = np.clip(1.0 - 0.28 * np.sqrt(vx * vx + vy * vy), 0.55, 1.0)
    base *= vig[..., None]
    # Very faint diagonal prism on the plate (effect, not a frame)
    band = np.exp(-((((xs / w) * 0.7 + (ys / h) * 0.3) - 0.46) ** 2) / (2 * 0.09 ** 2))
    base[..., 0] = np.clip(base[..., 0] + band * 12, 0, 255)
    base[..., 1] = np.clip(base[..., 1] + band * 8, 0, 255)
    base[..., 2] = np.clip(base[..., 2] + band * 16, 0, 255)
    im = Image.fromarray(base.astype(np.uint8), "RGB").convert("RGBA")
    return im


def breakout_ramp(top: int, th: int) -> np.ndarray:
    """Upstream top-mode ramp: 1 above until_v of the portrait, feathered down."""
    h = CANVAS_H
    until = top + BREAKOUT_UNTIL_V * th
    feather = max(BREAKOUT_FEATHER * th, 1.0)
    v = np.arange(h, dtype=np.float32)
    t = 1.0 - np.clip((v - until) / feather, 0.0, 1.0)
    ramp = t * t * (3.0 - 2.0 * t)
    return ramp[:, None]


def contact_shadow(alpha_u8: np.ndarray, body_m: np.ndarray) -> Image.Image:
    """Soft contact shadow where overflow sits on the rim (upstream idea, original pixels)."""
    a = Image.fromarray(alpha_u8, "L")
    shifted = Image.new("L", a.size, 0)
    shifted.paste(a, (0, 6))
    blurred = shifted.filter(ImageFilter.GaussianBlur(radius=7))
    ba = np.array(blurred, dtype=np.float32) / 255.0
    # Only darken the card body / rim, not the page around the overflow
    shade = np.clip(ba * (body_m.astype(np.float32) / 255.0) * 0.34, 0, 1)
    layer = np.zeros((CANVAS_H, CANVAS_W, 4), np.uint8)
    layer[..., 3] = (shade * 255).astype(np.uint8)
    return Image.fromarray(layer, "RGBA")


def compose_card(portrait: Image.Image, plate_l: str, plate_r: str, seed: int) -> Image.Image:
    accent = sample_accent(np.array(portrait.convert("RGBA")))
    mid, top, left, tw, th = place_portrait(portrait)
    color = sample_hem_color(np.array(mid))
    mist_cy = int(top + 0.86 * th)
    mist_back = make_mist((CANVAS_W, CANVAS_H), color, mist_cy, rx=int(tw * 0.62), ry=int(th * 0.16), strength=88)
    mist_core = make_mist((CANVAS_W, CANVAS_H), (236, 240, 248), mist_cy, rx=int(tw * 0.36), ry=int(th * 0.10), strength=48)
    mist_low = make_mist((CANVAS_W, CANVAS_H), color, int(CANVAS_H * 0.82), rx=int(CANVAS_W * 0.42), ry=int(CANVAS_H * 0.20), strength=56)

    backdrop = make_backdrop(accent, seed)
    plate = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    plate = Image.alpha_composite(plate, backdrop)
    plate = Image.alpha_composite(plate, mist_back)
    plate = Image.alpha_composite(plate, mist_core)
    plate = Image.alpha_composite(plate, mist_low)
    plate = Image.alpha_composite(plate, mid)

    bmask = body_mask_image()
    body_a = bmask
    # Clip the plate to the rounded card body
    clipped = plate.copy()
    clipped.putalpha(ImageChops.multiply(clipped.split()[-1], body_a))

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas = Image.alpha_composite(canvas, clipped)
    canvas = add_soft_sheen(canvas)
    # Re-clip sheen to the body so it does not bloom onto overflow hair
    canvas.putalpha(ImageChops.multiply(canvas.split()[-1], body_a))

    # Break-out: official upper-alpha redrawn over the card-body edge and into the padding.
    mid_a = np.array(mid.split()[-1], dtype=np.float32)
    ramp = breakout_ramp(top, th)
    bo = np.clip(mid_a * ramp, 0, 255).astype(np.uint8)
    # Only keep official pixels (already true) — no invented fill.
    # Contact shadow under overflow where it meets the body.
    if int((bo > 12).sum()) >= 80:
        canvas = Image.alpha_composite(canvas, contact_shadow(bo, np.array(body_a)))
        bo_layer = mid.copy()
        # Scale mid alpha by the ramp
        arr = np.array(bo_layer)
        arr[..., 3] = bo
        bo_layer = Image.fromarray(arr, "RGBA")
        canvas = Image.alpha_composite(canvas, bo_layer)

    canvas = draw_nameplate(canvas, plate_l, plate_r)

    # Slight grade, preserve combined alpha (body ∪ official overflow)
    alpha = canvas.split()[-1]
    rgb = canvas.convert("RGB")
    rgb = ImageEnhance.Contrast(rgb).enhance(1.04)
    rgb = ImageEnhance.Color(rgb).enhance(1.06)
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def make_card_back() -> Image.Image:
    """Unofficial original back: dark plate, monogram. No official art, no house frame, no drawn rim."""
    accent = (160, 180, 210)
    canvas = make_backdrop(accent, seed=0)
    bmask = body_mask_image()
    canvas.putalpha(bmask)
    canvas = add_soft_sheen(canvas)
    canvas.putalpha(ImageChops.multiply(canvas.split()[-1], bmask))
    draw = ImageDraw.Draw(canvas)
    font = load_font(FONT_BOLD, 54)
    label = "UMAMUSUMEDB"
    tw = text_width(draw, label, font)
    draw.text(((CANVAS_W - tw) / 2, CANVAS_H * 0.46), label, font=font, fill=(210, 220, 235, 220))
    font2 = load_font(FONT_REG, 28)
    sub = "commemorative preview"
    tw2 = text_width(draw, sub, font2)
    draw.text(((CANVAS_W - tw2) / 2, CANVAS_H * 0.53), sub, font=font2, fill=(160, 175, 200, 180))
    return canvas


def jp_base(c: dict) -> str:
    if c.get("base_name_jp"):
        return c["base_name_jp"]
    n = c.get("name_jp") or ""
    for sep in ("（", "("):
        if sep in n:
            return n.split(sep)[0].strip()
    return c.get("base_name_en") or c.get("name_en") or ""


def locale_bits(c: dict) -> dict:
    i18n = c.get("i18n") or {}
    def grab(key, name_fallback, title_fallback):
        block = i18n.get(key) or {}
        return {
            "name": block.get("name") or name_fallback,
            "title": block.get("title") or title_fallback,
        }
    base_en = c.get("base_name_en") or c.get("name_en") or ""
    title_en = c.get("title_en") or ""
    title_jp = c.get("title_jp") or ""
    return {
        "zh": grab("zh", base_en, title_en),
        "zh-tw": grab("zh_tw", base_en, title_en),
        "ko": grab("ko", base_en, title_en),
        "ja": {"name": jp_base(c), "title": title_jp or title_en},
        "en": {"name": base_en, "title": title_en},
    }


def save_webp(im: Image.Image, dest: Path, quality=84, lossless=False):
    dest.parent.mkdir(parents=True, exist_ok=True)
    params = {"quality": quality, "method": 4}
    if im.mode == "RGBA":
        im.save(dest, "WEBP", **params)
    else:
        im.save(dest, "WEBP", **params)


def build_record(c: dict, art_url: str, og_url: str) -> dict:
    card_id = int(c["card_id"])
    slug = c["id"]
    aliases = []
    if card_id in LEGACY_ART:
        aliases.append(LEGACY_ART[card_id])
    return {
        "id": slug,
        "card_id": card_id,
        "aliases": aliases,
        "art": art_url,
        "og": og_url,
        "nameEn": c.get("name_en") or "",
        "nameJp": c.get("name_jp") or "",
        "baseEn": c.get("base_name_en") or c.get("name_en") or "",
        "baseJp": jp_base(c),
        "titleEn": c.get("title_en") or "",
        "titleJp": c.get("title_jp") or "",
        "i18n": locale_bits(c),
        "weight": 1,
    }


def write_pool(records: list[dict]):
    payload = {
        "version": 6,
        "count": len(records),
        "cards": records,
    }
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    OUT_POOL.parent.mkdir(parents=True, exist_ok=True)
    OUT_POOL.write_text(text)
    WORKER_POOL.parent.mkdir(parents=True, exist_ok=True)
    WORKER_POOL.write_text(text)
    # Small TS helper so the site can import the pool without fetch.
    ids = [r["id"] for r in records]
    alias_map = {}
    for r in records:
        for a in r.get("aliases") or []:
            alias_map[a] = r["id"]
    ts = (
        "/* AUTO-GENERATED by scripts/build-holo-roster.py — do not edit by hand. */\n"
        "export const HOLO_ROSTER_COUNT = "
        + str(len(records))
        + ";\n"
        "export const HOLO_POOL_SLUGS: readonly string[] = "
        + json.dumps(ids, ensure_ascii=False)
        + ";\n"
        "export const HOLO_LEGACY_ALIASES: Record<string, string> = "
        + json.dumps(alias_map, ensure_ascii=False, indent=2)
        + ";\n"
    )
    OUT_TS.parent.mkdir(parents=True, exist_ok=True)
    OUT_TS.write_text(ts)



def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Build only the first N missing cards (plus legacy).")
    parser.add_argument("--only", type=str, default="", help="Comma-separated card_ids or slugs to (re)build.")
    parser.add_argument("--force", action="store_true", help="Rebuild even if the still exists, including legacy alias folders.")
    args = parser.parse_args()

    chars = json.loads(CHARS_JSON.read_text())
    only = {s.strip() for s in args.only.split(",") if s.strip()}

    skipped = []
    built = []
    reused = []
    records = []

    back = make_card_back()
    back_small = back.resize((OUT_W, OUT_H), Image.Resampling.LANCZOS)
    save_webp(back_small, OUT_CARDS / "back.webp", quality=86)

    def write_still(card: Image.Image, dest_card: Path, dest_og: Path):
        small = card.resize((OUT_W, OUT_H), Image.Resampling.LANCZOS)
        save_webp(small, dest_card, quality=86)
        save_webp(make_og(card), dest_og, quality=84)

    for c in chars:
        slug = c.get("id")
        try:
            card_id = int(c["card_id"])
        except (TypeError, ValueError, KeyError):
            skipped.append({"id": slug, "reason": "missing card_id"})
            continue
        portrait_path = PORTRAIT_DIR / f"{card_id}.webp"
        if not portrait_path.exists():
            alt = PORTRAIT_DIR / f"{slug}.webp"
            if alt.exists():
                portrait_path = alt
            else:
                skipped.append({"id": slug, "card_id": card_id, "reason": f"no official portrait at {card_id}.webp"})
                continue
        if only:
            if slug not in only and str(card_id) not in only:
                dest_card = OUT_CARDS / str(card_id) / "card.webp"
                dest_og = OUT_OG / f"{card_id}.webp"
                if dest_card.exists():
                    art_url = f"/holo/cards/{card_id}/card.webp"
                    if card_id in LEGACY_ART:
                        art_url = f"/holo/cards/{LEGACY_ART[card_id]}/card.webp"
                    records.append(build_record(c, art_url, f"/holo/og/{card_id}.webp" if dest_og.exists() else f"/holo/og/{LEGACY_ART.get(card_id, card_id)}.webp"))
                continue

        dest_dir = OUT_CARDS / str(card_id)
        dest_card = dest_dir / "card.webp"
        dest_og = OUT_OG / f"{card_id}.webp"
        is_legacy = card_id in LEGACY_ART
        alias_dir = OUT_CARDS / LEGACY_ART[card_id] if is_legacy else None
        alias_still = (alias_dir / "card.webp") if alias_dir else None
        alias_og = OUT_OG / f"{LEGACY_ART[card_id]}.webp" if is_legacy else None

        if dest_card.exists() and dest_og.exists() and not args.force:
            art_url = f"/holo/cards/{card_id}/card.webp"
            og_url = f"/holo/og/{card_id}.webp"
            if is_legacy and alias_still and alias_still.exists():
                art_url = f"/holo/cards/{LEGACY_ART[card_id]}/card.webp"
                if alias_og and alias_og.exists():
                    og_url = f"/holo/og/{LEGACY_ART[card_id]}.webp"
            records.append(build_record(c, art_url, og_url))
            reused.append(slug)
            continue

        if args.limit and len(built) >= args.limit:
            if dest_card.exists():
                records.append(build_record(c, f"/holo/cards/{card_id}/card.webp", f"/holo/og/{card_id}.webp"))
            continue

        portrait = Image.open(portrait_path).convert("RGBA")
        if portrait.size[0] < 64 or portrait.size[1] < 64:
            skipped.append({"id": slug, "card_id": card_id, "reason": f"portrait too small {portrait.size}"})
            continue

        plate_l = (c.get("title_jp") or c.get("title_en") or "").strip()
        plate_r = (c.get("base_name_en") or c.get("name_en") or "").strip()
        card = compose_card(portrait, plate_l, plate_r, seed=card_id)
        write_still(card, dest_card, dest_og)
        art_url = f"/holo/cards/{card_id}/card.webp"
        og_url = f"/holo/og/{card_id}.webp"
        if is_legacy and alias_dir is not None:
            alias_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(dest_card, alias_dir / "card.webp")
            if alias_og is not None:
                shutil.copy2(dest_og, alias_og)
            art_url = f"/holo/cards/{LEGACY_ART[card_id]}/card.webp"
            og_url = f"/holo/og/{LEGACY_ART[card_id]}.webp"
        records.append(build_record(c, art_url, og_url))
        built.append(slug)
        if len(built) % 25 == 0:
            print(f"built {len(built)} … last {slug}", flush=True)

    write_pool(records)
    report = {
        "built": len(built),
        "reused": len(reused),
        "pool": len(records),
        "skipped": skipped,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not skipped or records else 1


if __name__ == "__main__":
    sys.exit(main())
