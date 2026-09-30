import type { Mask } from "./raster";
import { createMask, padMask } from "./raster";
import type { XorShift128 } from "./rng";

// Damage done to a letter's shape before it is drawn, so the outline, rim
// and extrusion follow the damage instead of being painted over.

export interface Morph {
  mask: Mask;
  /** Where the new mask's origin sits relative to the letter's own, in mask pixels. */
  dx: number;
  dy: number;
}

function set(m: Mask, x: number, y: number) {
  if (x >= 0 && y >= 0 && x < m.w && y < m.h) m.d[y * m.w + x] = 1;
}

/** Horizontal bands of the letter slide sideways. */
export function tear(m: Mask, rng: XorShift128): Morph {
  const reach = 14;
  const out = createMask(m.w + 2 * reach, m.h);
  for (let y = 0; y < m.h; ) {
    const band = 3 + rng.int(14);
    const shift = rng.float() < 0.45 ? 0 : (rng.float() < 0.5 ? -1 : 1) * (3 + rng.int(reach - 3));
    for (let r = y; r < Math.min(y + band, m.h); r++) {
      for (let x = 0; x < m.w; x++) if (m.d[r * m.w + x]) set(out, x + reach + shift, r);
    }
    y += band;
  }
  return { mask: out, dx: -reach, dy: 0 };
}

/** Mirrored, the Ƨ of an S or the upside-down M. */
export function flip(m: Mask, vertical: boolean): Morph {
  const out = createMask(m.w, m.h);
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (m.d[y * m.w + x]) set(out, vertical ? x : m.w - 1 - x, vertical ? m.h - 1 - y : y);
    }
  }
  return { mask: out, dx: 0, dy: 0 };
}

/** Low resolution: each block is solid if at least half of it was. */
export function pixelate(m: Mask, block: number): Morph {
  const out = createMask(m.w, m.h);
  for (let by = 0; by < m.h; by += block) {
    for (let bx = 0; bx < m.w; bx += block) {
      let count = 0;
      let total = 0;
      for (let y = by; y < Math.min(by + block, m.h); y++) {
        for (let x = bx; x < Math.min(bx + block, m.w); x++) {
          count += m.d[y * m.w + x];
          total++;
        }
      }
      if (count * 2 < total) continue;
      for (let y = by; y < Math.min(by + block, m.h); y++) {
        for (let x = bx; x < Math.min(bx + block, m.w); x++) out.d[y * m.w + x] = 1;
      }
    }
  }
  return { mask: out, dx: 0, dy: 0 };
}

/** Columns drip down from the bottom edges, like sorted pixels. */
export function melt(m: Mask, rng: XorShift128): Morph {
  const reach = 22;
  const out = createMask(m.w, m.h + reach);
  out.d.set(m.d);
  for (let x = 0; x < m.w; x += 2) {
    if (rng.float() > 0.4) continue;
    const length = 2 + rng.int(reach - 2);
    for (let y = m.h - 1; y >= 0; y--) {
      if (!m.d[y * m.w + x]) continue;
      // Only drip from pixels with nothing below them.
      if (y + 1 < m.h && m.d[(y + 1) * m.w + x]) continue;
      for (let k = 1; k <= length; k++) {
        set(out, x, y + k);
        set(out, x + 1, y + k);
      }
    }
  }
  return { mask: out, dx: 0, dy: 0 };
}

/** A slanted bar through the letter, turning S into $. */
export function dollar(m: Mask): Morph {
  const pad = 9;
  const out = padMask(m, pad);
  // Follow the letter's slant: a least-squares line through its row centres.
  let n = 0;
  let sy = 0;
  let sx = 0;
  let syy = 0;
  let sxy = 0;
  for (let y = 0; y < m.h; y++) {
    let count = 0;
    let sum = 0;
    for (let x = 0; x < m.w; x++) {
      if (m.d[y * m.w + x]) {
        count++;
        sum += x;
      }
    }
    if (!count) continue;
    const cx = sum / count;
    n++;
    sy += y;
    sx += cx;
    syy += y * y;
    sxy += y * cx;
  }
  const slope = (n * sxy - sy * sx) / (n * syy - sy * sy);
  const offset = (sx - slope * sy) / n;
  for (let y = -pad + 1; y < m.h + pad - 1; y++) {
    const cx = Math.round(offset + slope * y);
    for (let x = cx - 3; x <= cx + 3; x++) set(out, x + pad, y + pad);
  }
  return { mask: out, dx: -pad, dy: -pad };
}

/** Every other few rows are gone, like a dropped interlaced field. */
export function interlace(m: Mask, rows: number): Morph {
  const out = createMask(m.w, m.h);
  for (let y = 0; y < m.h; y++) {
    if (((y / rows) | 0) % 2) continue;
    out.d.set(m.d.subarray(y * m.w, (y + 1) * m.w), y * m.w);
  }
  return { mask: out, dx: 0, dy: 0 };
}

/** A band of rows stretched downwards, pushing the rest of the letter down. */
export function stretch(m: Mask, rng: XorShift128): Morph {
  const from = rng.int(m.h - 20);
  const band = 8 + rng.int(12);
  const extra = band;
  const out = createMask(m.w, m.h + extra);
  for (let y = 0; y < out.h; y++) {
    const src = y < from ? y : y < from + band * 2 ? from + ((y - from) >> 1) : y - extra;
    out.d.set(m.d.subarray(src * m.w, (src + 1) * m.w), y * m.w);
  }
  return { mask: out, dx: 0, dy: 0 };
}

/** The letter and a copy of itself a few pixels over, merged. */
export function ghost(m: Mask, rng: XorShift128): Morph {
  const shift = 4 + rng.int(6);
  const out = createMask(m.w + shift, m.h);
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (!m.d[y * m.w + x]) continue;
      set(out, x, y);
      if (((y / 3) | 0) % 2 === 0) set(out, x + shift, y);
    }
  }
  return { mask: out, dx: 0, dy: 0 };
}
