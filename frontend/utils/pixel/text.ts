import { oklch } from "./color";
import { PIXEL_MECHA_BOLD } from "./pixel-mecha-bold";
import type { Bitmap, Mask, RGBA } from "./raster";
import { createBitmap, createMask, drawMask, grow, hex, lerp, padMask, scaleMask } from "./raster";

// The event title from the 2027 poster, rainbow_outline() in typography.rs:
// white Pixel Mecha Bold with a thin Oklch rainbow border, extruded down and
// to the right like the logo.

/** The poster's title. `fit` squeezes its rainbow into shorter text. */
export const POSTER_TITLE = "Säkerhets-SM 2027";

const WORD_SPACING = 5;
const NEAR = hex("#24203c");
const FAR = hex("#090b19");

/** Glyph width as bitfont.rs measures it: the highest set bit of any row. */
function glyphWidth(rows: readonly number[]) {
  let w = 0;
  for (const row of rows) w = Math.max(w, 31 - Math.clz32(row));
  return w;
}

/**
 * Monochrome text at one pixel per font pixel, make_text_decal() in
 * bitfont.rs, cropped below the last inked row (the cells are 16 rows but
 * capitals only use 12).
 */
export function textMask(text: string): Mask {
  const glyphs = [...text].map((ch) => (ch === " " ? null : PIXEL_MECHA_BOLD[ch])).filter((g) => g !== undefined);
  let width = 0;
  let height = 0;
  for (const rows of glyphs) {
    if (!rows) {
      width += WORD_SPACING;
      continue;
    }
    width += glyphWidth(rows);
    rows.forEach((row, y) => {
      if (row) height = Math.max(height, y + 1);
    });
  }
  const m = createMask(width + 1, height);
  let cursor = 0;
  for (const rows of glyphs) {
    if (!rows) {
      cursor += WORD_SPACING;
      continue;
    }
    const w = glyphWidth(rows);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x <= w; x++) if (rows[y] & (1 << x)) m.d[y * m.w + cursor + x] = 1;
    }
    cursor += w;
  }
  return m;
}

/** The poster draws the title at scale 4 with these borders; other scales keep the proportions. */
function borders(scale: number) {
  return {
    rainbow: scale,
    dark: Math.floor(scale / 2),
    outline: Math.max(1, Math.round(scale / 4)),
    depth: 2 * scale,
  };
}

export interface PixelTextOptions {
  /** Canvas pixels per font pixel; 4 on the poster. */
  scale?: number;
  /** Stretch the rainbow of the full poster title over this text instead of cutting it short. */
  fit?: boolean;
}

export function pixelTextSize(text: string, scale = 4) {
  const m = textMask(text);
  const b = borders(scale);
  const pad = b.rainbow + b.outline;
  return { width: m.w * scale + 2 * pad + b.depth, height: m.h * scale + 2 * pad + b.depth, depth: b.depth };
}

export function renderPixelText(text: string, { scale = 4, fit = false }: PixelTextOptions = {}): Bitmap {
  const s = scale;
  const b = borders(s);
  const mask = textMask(text);
  // Font pixels per turn of the hue wheel.
  const period = fit ? (150 * mask.w) / textMask(POSTER_TITLE).w : 150;

  const glyphs = padMask(scaleMask(mask, s), b.rainbow + b.outline);
  const rainbow = grow(glyphs, b.rainbow);
  const outline = grow(rainbow, b.outline);
  const image = createBitmap(glyphs.w + b.depth, glyphs.h + b.depth);

  for (let d = b.depth; d >= 1; d--) {
    const t = d / b.depth;
    const shade: RGBA = [lerp(NEAR[0], FAR[0], t), lerp(NEAR[1], FAR[1], t), lerp(NEAR[2], FAR[2], t), 255];
    drawMask(image, outline, d, d, shade);
  }
  drawMask(image, outline, 0, 0, [0, 0, 0, 255]);
  // The hue is measured from the rainbow's own left edge, as in the Rust code.
  drawMask(image, rainbow, 0, 0, (x) => oklch(0.56, 0.13, ((x - b.outline) / (period * s)) * 2 * Math.PI));
  if (b.dark) drawMask(image, grow(glyphs, b.dark), 0, 0, [0, 0, 0, 180]);
  drawMask(image, glyphs, 0, 0, [255, 255, 255, 255]);
  return image;
}
