// A tiny software rasterizer, ported from the poster generator in
// sakerhetssm-generated-graphics (2025-poster/src/render.rs). Everything works
// on plain typed arrays so it runs the same in the browser and during SSR.

export type RGBA = readonly [number, number, number, number];

/** Coverage mask, one byte (0 or 1) per pixel. */
export interface Mask {
  w: number;
  h: number;
  d: Uint8Array;
}

/** Straight-alpha RGBA pixels, laid out like ImageData. */
export interface Bitmap {
  w: number;
  h: number;
  d: Uint8ClampedArray;
}

export type Kernel = ReadonlyArray<readonly [number, number]>;
export type Paint = RGBA | ((x: number, y: number) => RGBA);

export function createMask(w: number, h: number): Mask {
  return { w, h, d: new Uint8Array(w * h) };
}

export function createBitmap(w: number, h: number): Bitmap {
  return { w, h, d: new Uint8ClampedArray(w * h * 4) };
}

export function cloneBitmap(b: Bitmap): Bitmap {
  return { w: b.w, h: b.h, d: new Uint8ClampedArray(b.d) };
}

export function hex(color: string, a = 255): RGBA {
  const n = parseInt(color.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}

export function decodeMask(glyph: { w: number; h: number; bits: string }): Mask {
  const bytes = atob(glyph.bits);
  const m = createMask(glyph.w, glyph.h);
  for (let i = 0; i < m.d.length; i++) {
    m.d[i] = (bytes.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
  }
  return m;
}

/** Copies the mask into a larger one with `p` empty pixels on every side. */
export function padMask(m: Mask, p: number): Mask {
  const out = createMask(m.w + 2 * p, m.h + 2 * p);
  for (let y = 0; y < m.h; y++) {
    out.d.set(m.d.subarray(y * m.w, (y + 1) * m.w), (y + p) * out.w + p);
  }
  return out;
}

/** Nearest-neighbour upscale, make_scaled() in the Rust code. */
export function scaleMask(m: Mask, s: number): Mask {
  if (s === 1) return m;
  const out = createMask(m.w * s, m.h * s);
  for (let y = 0; y < out.h; y++) {
    const row = ((y / s) | 0) * m.w;
    for (let x = 0; x < out.w; x++) out.d[y * out.w + x] = m.d[row + ((x / s) | 0)];
  }
  return out;
}

/** Every offset of a (2r+1)² square, like square_border(). */
export function squareKernel(r: number): Kernel {
  const k: [number, number][] = [];
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) k.push([x, y]);
  return k;
}

/** Grows the mask by every offset in the kernel. Keeps the size, so pad first. */
export function dilate(m: Mask, kernel: Kernel): Mask {
  const out = createMask(m.w, m.h);
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (!m.d[y * m.w + x]) continue;
      for (const [dx, dy] of kernel) {
        const tx = x + dx;
        const ty = y + dy;
        if (tx >= 0 && ty >= 0 && tx < m.w && ty < m.h) out.d[ty * m.w + tx] = 1;
      }
    }
  }
  return out;
}

/** Same as dilate(m, squareKernel(r)) but separable, for large radii. */
export function grow(m: Mask, r: number): Mask {
  const tmp = createMask(m.w, m.h);
  const out = createMask(m.w, m.h);
  for (let y = 0; y < m.h; y++) {
    let count = 0;
    for (let x = -r; x < m.w + r; x++) {
      if (x + r < m.w) count += m.d[y * m.w + x + r];
      if (x - r - 1 >= 0) count -= m.d[y * m.w + x - r - 1];
      if (x >= 0 && x < m.w) tmp.d[y * m.w + x] = count > 0 ? 1 : 0;
    }
  }
  for (let x = 0; x < m.w; x++) {
    let count = 0;
    for (let y = -r; y < m.h + r; y++) {
      if (y + r < m.h) count += tmp.d[(y + r) * m.w + x];
      if (y - r - 1 >= 0) count -= tmp.d[(y - r - 1) * m.w + x];
      if (y >= 0 && y < m.h) out.d[y * m.w + x] = count > 0 ? 1 : 0;
    }
  }
  return out;
}

/** Union of the mask with copies of itself moved diagonally by 1..depth pixels. */
export function extrude(m: Mask, depth: number): Mask {
  const out = createMask(m.w + depth, m.h + depth);
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (!m.d[y * m.w + x]) continue;
      for (let k = 0; k <= depth; k++) out.d[(y + k) * out.w + x + k] = 1;
    }
  }
  return out;
}

/** Source-over compositing of a straight-alpha colour onto pixel `i`. */
function blend(dst: Bitmap, i: number, c: RGBA) {
  const sa = c[3] / 255;
  if (sa <= 0) return;
  const d = dst.d;
  if (sa >= 1) {
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
    d[i + 3] = 255;
    return;
  }
  const k = (d[i + 3] / 255) * (1 - sa);
  const oa = sa + k;
  d[i] = (c[0] * sa + d[i] * k) / oa;
  d[i + 1] = (c[1] * sa + d[i + 1] * k) / oa;
  d[i + 2] = (c[2] * sa + d[i + 2] * k) / oa;
  d[i + 3] = oa * 255;
}

/**
 * Paints every set pixel of `m`, upscaled `s` times, at (ox, oy). Paint
 * functions receive the position inside the scaled mask, like draw_mask().
 */
export function drawMask(dst: Bitmap, m: Mask, ox: number, oy: number, paint: Paint, s = 1) {
  const fn = typeof paint === "function" ? paint : null;
  const color = paint as RGBA;
  for (let my = 0; my < m.h; my++) {
    for (let mx = 0; mx < m.w; mx++) {
      if (!m.d[my * m.w + mx]) continue;
      for (let sy = 0; sy < s; sy++) {
        const y = oy + my * s + sy;
        if (y < 0 || y >= dst.h) continue;
        for (let sx = 0; sx < s; sx++) {
          const x = ox + mx * s + sx;
          if (x < 0 || x >= dst.w) continue;
          blend(dst, (y * dst.w + x) * 4, fn ? fn(mx * s + sx, my * s + sy) : color);
        }
      }
    }
  }
}

/** Composites one bitmap onto another at (ox, oy). */
export function drawBitmap(dst: Bitmap, src: Bitmap, ox: number, oy: number) {
  for (let y = 0; y < src.h; y++) {
    const ty = oy + y;
    if (ty < 0 || ty >= dst.h) continue;
    for (let x = 0; x < src.w; x++) {
      const tx = ox + x;
      const i = (y * src.w + x) * 4;
      if (tx < 0 || tx >= dst.w || src.d[i + 3] === 0) continue;
      blend(dst, (ty * dst.w + tx) * 4, [src.d[i], src.d[i + 1], src.d[i + 2], src.d[i + 3]]);
    }
  }
}

export function lerp(a: number, b: number, t: number) {
  return a * (1 - t) + b * t;
}
