import { LETTER_M, LETTER_S } from "./masks";
import type { Morph } from "./morph";
import { dollar, flip, ghost, interlace, melt, pixelate, stretch, tear } from "./morph";
import type { Bitmap, Mask, RGBA } from "./raster";
import type { XorShift128 } from "./rng";
import {
  createBitmap,
  createMask,
  decodeMask,
  dilate,
  drawBitmap,
  drawMask,
  extrude,
  hex,
  lerp,
  padMask,
  scaleMask,
  squareKernel,
} from "./raster";

// The SSM logo from the 2027 poster, logo.rs in sakerhetssm-generated-graphics.
// Sizes are in letter-mask pixels; the poster draws them at three poster
// pixels each, `scale` sets canvas pixels per mask pixel here.

const OUTLINE = 3;
const DEPTH = 10;
const SHADOW = 9;
const ORIGIN = SHADOW + OUTLINE;

const LETTERS = [
  { glyph: LETTER_S, x: 0, color: hex("#ea507c") },
  { glyph: LETTER_S, x: 87, color: hex("#75da91") },
  { glyph: LETTER_M, x: 174, color: hex("#53d8df") },
];

/** The three rim colours, for glitches that swap them around. */
export const RIM_COLORS = LETTERS.map((l) => l.color);

const EDGE = hex("#070b13");
const INNER = hex("#293043");
const NEAR = hex("#24203c");
const FAR = hex("#090b19");
const SEAM_LEFT = hex("#593486");
const SEAM_RIGHT = hex("#23778a");
const SHADOW_COLOR = hex("#06030f");
const BAYER = [
  [0, 2],
  [3, 1],
];

// Where the logo sits on the 1188 px wide poster, for the seam's gradient.
const POSTER_WIDTH = 1188;
const POSTER_LEFT = 147;

/** One letter's extrusion and face, to be drawn at (x, y) on the logo canvas. */
export interface LetterLayer {
  image: Bitmap;
  x: number;
  y: number;
}

/** How a letter's face is filled: the poster's gradient, nothing, or a dark negative. */
export type Face = "fill" | "hollow" | "dark";

export interface LetterOptions {
  color?: RGBA;
  face?: Face;
  /** Where `mask` sits relative to the letter's own mask, in mask pixels. */
  dx?: number;
  dy?: number;
}

export interface LogoRender {
  image: Bitmap;
  shadow: Bitmap;
  layers: LetterLayer[];
  /** The undamaged letter masks, for glitches that reshape them. */
  masks: Mask[];
  /** Pixels covered by a letter's front face, for aiming glitches at the letters. */
  faces: Mask;
  letters: { x: number; y: number; w: number; h: number; color: RGBA }[];
  scale: number;
}

export function logoSize(scale = 2) {
  const w = ORIGIN + 174 + LETTER_M.w + OUTLINE + SHADOW + DEPTH;
  const h = ORIGIN + LETTER_M.h + OUTLINE + SHADOW + DEPTH;
  return { width: w * scale, height: h * scale };
}

function mixed(a: RGBA, b: RGBA, t: number): RGBA {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), 255];
}

/**
 * White-to-lavender Bayer-dithered gradient, tuned to the 2025 M height.
 * (ox, oy) keeps the gradient and dither in place for masks that were moved.
 */
function fillPaint(s: number, ox: number, oy: number, dark: boolean) {
  return (x: number, y: number): RGBA => {
    const p = BAYER[(((y / s) | 0) + oy) & 1][(((x / s) | 0) + ox) & 1] / 4;
    const d = Math.floor(((((y + oy * s) * 2) / s / 133) * 1.1 - 0.6) * 8 + p) / 8;
    return dark
      ? [lerp(24, 157, d), lerp(16, 143, d), lerp(48, 224, d), 255]
      : [lerp(255, 0x9d, d), lerp(255, 0x8f, d), lerp(255, 0xe0, d), 255];
  };
}

/** Pixels of `a` that are not in `b` (same size). */
function without(a: Mask, b: Mask): Mask {
  const out = createMask(a.w, a.h);
  for (let i = 0; i < a.d.length; i++) out.d[i] = a.d[i] && !b.d[i] ? 1 : 0;
  return out;
}

/**
 * Draws one letter from its mask: the extrusion from far to near in bands of
 * darkening navy with a purple-to-teal seam across the logo, then the black
 * outline, coloured rim, inner line and fill. `index` is which letter it is.
 */
export function renderLetter(mask: Mask, index: number, s: number, options: LetterOptions = {}): LetterLayer {
  const { color = LETTERS[index].color, face = "fill", dx = 0, dy = 0 } = options;
  const padded = padMask(mask, OUTLINE);
  const inner = dilate(padded, squareKernel(1));
  const rim = dilate(padded, squareKernel(2));
  const edge = dilate(padded, squareKernel(OUTLINE));
  const depth = DEPTH * s;
  const image = createBitmap(padded.w * s + depth, padded.h * s + depth);
  const x = (ORIGIN + LETTERS[index].x + dx - OUTLINE) * s;
  const y = (ORIGIN + dy - OUTLINE) * s;

  for (let k = depth; k >= 1; k--) {
    const d = (k * 3) / s; // the same depth in poster pixels
    const paint =
      d >= 24 && d <= 26
        ? (px: number): RGBA => {
            const poster = POSTER_LEFT + ((x + k + px) / s - ORIGIN) * 3;
            return mixed(SEAM_LEFT, SEAM_RIGHT, Math.min(1, Math.max(0, poster / POSTER_WIDTH)));
          }
        : mixed(NEAR, FAR, Math.floor(d / 6) / 5);
    drawMask(image, edge, k, k, paint, s);
  }

  if (face === "hollow") {
    // Just the rings, so the extrusion shows through the letter.
    drawMask(image, without(edge, rim), 0, 0, EDGE, s);
    drawMask(image, without(rim, inner), 0, 0, color, s);
    drawMask(image, without(inner, padded), 0, 0, INNER, s);
  } else {
    drawMask(image, edge, 0, 0, EDGE, s);
    drawMask(image, rim, 0, 0, color, s);
    drawMask(image, inner, 0, 0, INNER, s);
    drawMask(image, mask, OUTLINE * s, OUTLINE * s, fillPaint(s, dx, dy, face === "dark"), s);
  }
  return { image, x, y };
}

/**
 * One letter with its shape, face or rim colour damaged, for the animation
 * to swap in for the real one. The S's can turn into $, the M can flip over.
 */
export function renderGlitchedLetter(render: LogoRender, index: number, rng: XorShift128): LetterLayer {
  const mask = render.masks[index];
  const isS = LETTERS[index].glyph === LETTER_S;
  const shapes: (() => Morph)[] = [
    () => tear(mask, rng),
    () => flip(mask, !isS),
    () => pixelate(mask, 4 + rng.int(4)),
    () => melt(mask, rng),
    () => (isS ? dollar(mask) : ghost(mask, rng)),
    () => interlace(mask, 2 + rng.int(3)),
    () => stretch(mask, rng),
    () => ghost(mask, rng),
    () => ({ mask, dx: 0, dy: 0 }),
  ];
  const morph = rng.pick(shapes)();
  const roll = rng.float();
  let face: Face = roll < 0.18 ? "hollow" : roll < 0.32 ? "dark" : "fill";
  const color = rng.float() < 0.3 ? rng.pick(RIM_COLORS.filter((_, i) => i !== index)) : undefined;
  // An untouched shape must at least change its face.
  if (morph.mask === mask && face === "fill" && !color) face = rng.float() < 0.5 ? "hollow" : "dark";
  return renderLetter(morph.mask, index, render.scale, { dx: morph.dx, dy: morph.dy, face, color });
}

const SINGLE: Mask = { w: 1, h: 1, d: new Uint8Array([1]) };

/**
 * The soft shadow around the extruded letters, stepped on the mask-pixel grid:
 * alpha falls off with distance in six steps, out to SHADOW pixels.
 */
function drawShadow(image: Bitmap, solid: Mask, s: number) {
  // Distance to the nearest solid pixel along each row (capped), then the
  // exact Euclidean distance by searching SHADOW rows up and down.
  const far = SHADOW + 1;
  const row = new Float32Array(solid.w * solid.h).fill(far);
  for (let y = 0; y < solid.h; y++) {
    let last = -far;
    for (let x = 0; x < solid.w; x++) {
      if (solid.d[y * solid.w + x]) last = x;
      row[y * solid.w + x] = Math.min(far, x - last);
    }
    last = solid.w + far;
    for (let x = solid.w - 1; x >= 0; x--) {
      if (solid.d[y * solid.w + x]) last = x;
      row[y * solid.w + x] = Math.min(row[y * solid.w + x], last - x);
    }
  }
  for (let y = 0; y < solid.h; y++) {
    for (let x = 0; x < solid.w; x++) {
      if (solid.d[y * solid.w + x]) continue;
      let best = SHADOW * SHADOW + 1;
      for (let dy = -SHADOW; dy <= SHADOW; dy++) {
        const sy = y + dy;
        if (sy < 0 || sy >= solid.h) continue;
        const dx = row[sy * solid.w + x];
        best = Math.min(best, dx * dx + dy * dy);
      }
      const d = Math.sqrt(best) / SHADOW;
      if (d > 1) continue;
      const alpha = (Math.ceil((1 - d) ** 2 * 6) / 6) * 170;
      drawMask(image, SINGLE, x * s, y * s, [SHADOW_COLOR[0], SHADOW_COLOR[1], SHADOW_COLOR[2], alpha], s);
    }
  }
}

export function renderLogo(scale = 2): LogoRender {
  const s = scale;
  const { width, height } = logoSize(s);
  const masks = LETTERS.map((l) => decodeMask(l.glyph));

  const solid = createMask(width / s, height / s);
  const faces = createMask(width, height);
  masks.forEach((mask, i) => {
    const padded = padMask(mask, OUTLINE);
    const mx = ORIGIN - OUTLINE + LETTERS[i].x;
    const my = ORIGIN - OUTLINE;
    stamp(solid, extrude(dilate(padded, squareKernel(OUTLINE)), DEPTH), mx, my);
    stamp(faces, scaleMask(dilate(padded, squareKernel(1)), s), mx * s, my * s);
  });
  const shadow = createBitmap(width, height);
  drawShadow(shadow, solid, s);

  // One letter at a time, so each outline cuts into its neighbour as in logo.rs.
  const layers = masks.map((mask, i) => renderLetter(mask, i, s));
  const image = createBitmap(width, height);
  drawBitmap(image, shadow, 0, 0);
  for (const layer of layers) drawBitmap(image, layer.image, layer.x, layer.y);

  return {
    image,
    shadow,
    layers,
    masks,
    faces,
    letters: masks.map((mask, i) => ({
      x: (ORIGIN + LETTERS[i].x) * s,
      y: ORIGIN * s,
      w: mask.w * s,
      h: mask.h * s,
      color: LETTERS[i].color,
    })),
    scale: s,
  };
}

function stamp(dst: Mask, m: Mask, ox: number, oy: number) {
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (m.d[y * m.w + x]) dst.d[(oy + y) * dst.w + ox + x] = 1;
    }
  }
}
