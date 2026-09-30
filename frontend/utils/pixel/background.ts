import { crunch, shiftRows, sortColumns } from "./glitch";
import type { Bitmap, RGBA } from "./raster";
import { createBitmap, hex } from "./raster";
import { XorShift128 } from "./rng";

// The warped checkerboard of purple and slate "blocks" behind the 2027
// poster, rendered at low resolution and scaled up with pixelated sampling.

const TILE = 18;
const TEXEL = 2;
const PURPLE = ["#43207c", "#4b238c", "#562592", "#5f24a3", "#6b24b1", "#7220bc"].map((c) => hex(c));
const SLATE = ["#161f29", "#1a2530", "#22303f", "#263446", "#293f49", "#2a324c"].map((c) => hex(c));

/** Cheap integer hash to [0, 1), stable per texel so the texture follows the warp. */
function hash(x: number, y: number, seed: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function shade(c: RGBA, k: number, out: Uint8ClampedArray, i: number) {
  out[i] = c[0] * k;
  out[i + 1] = c[1] * k;
  out[i + 2] = c[2] * k;
  out[i + 3] = 255;
}

export function renderBackground(w: number, h: number, seed = 2027): Bitmap {
  const image = createBitmap(w, h);
  const rng = new XorShift128(seed);
  const p1 = rng.float() * 6.28;
  const p2 = rng.float() * 6.28;
  const p3 = rng.float() * 6.28;

  for (let y = 0; y < h; y++) {
    // Darker towards the bottom, like the stone at the foot of the poster.
    const fade = 0.82 - 0.4 * Math.pow(y / h, 1.3);
    for (let x = 0; x < w; x++) {
      const u = x + 0.35 * y + 7 * Math.sin(y * 0.035 + p1) + 3 * Math.sin(x * 0.09 + p2);
      const v = y - 0.2 * x + 6 * Math.sin(x * 0.025 + p3) + 2 * Math.sin(y * 0.11 + p1);
      const tu = Math.floor(u / TILE);
      const tv = Math.floor(v / TILE);
      const n = hash(Math.floor(u / TEXEL), Math.floor(v / TEXEL), seed);
      const tone = hash(tu, tv, seed + 1);
      const palette = (tu + tv) & 1 ? PURPLE : SLATE;
      // Each block has its own tone; texels only nudge it, like a block texture.
      const index = Math.min(palette.length - 1, Math.floor((n * 0.35 + tone * 0.65) * palette.length));
      const edge = x / w;
      const vignette = 1 - 0.25 * Math.pow(Math.abs(edge - 0.5) * 2, 3);
      shade(palette[index], fade * vignette, image.d, (y * w + x) * 4);
    }
  }

  // Corrupted blocks, like glitch_dct_lite() in the diploma code.
  for (let by = 0; by < h; by += 16) {
    for (let bx = 0; bx < w; bx += 16) {
      if (rng.int(16) < 2) crunch(image, bx, by, rng);
    }
  }
  // A few sorted streaks and torn rows.
  for (let i = 0; i < Math.ceil(w / 160); i++) {
    const y0 = rng.int(h);
    sortColumns(image, rng.int(w), 1 + rng.int(8), y0, y0 + 20 + rng.int(h / 3));
  }
  for (let i = 0; i < Math.ceil(h / 120); i++) {
    shiftRows(image, rng.int(h), 1 + rng.int(4), rng.int(24) - 12, true);
  }
  return image;
}
