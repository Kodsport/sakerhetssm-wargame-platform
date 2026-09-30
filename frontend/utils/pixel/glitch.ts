import type { Bitmap, Mask, RGBA } from "./raster";
import { hex } from "./raster";
import type { XorShift128 } from "./rng";

// Glitch effects, mostly from render/glitch.rs of the poster code.

/** Colours of the corrupted bars across the letters on the 2027 poster. */
export const GLITCH_COLORS: RGBA[] = ["#f76efc", "#6cddf3", "#ecdd60", "#c8b2de", "#6574ff", "#f84c5d", "#ffffff"].map(
  (c) => hex(c),
);

/**
 * Moves the pixels of rows [y, y+h) that lie in columns [x0, x1) sideways.
 * `ghost` keeps the original under the moved copy.
 */
export function shiftRows(b: Bitmap, y: number, h: number, dx: number, ghost = false, x0 = 0, x1 = b.w) {
  const row = b.w * 4;
  const left = Math.max(0, Math.min(x0, x0 + dx));
  const right = Math.min(b.w, Math.max(x1, x1 + dx));
  for (let r = Math.max(0, y); r < Math.min(b.h, y + h); r++) {
    const src = b.d.slice(r * row, (r + 1) * row);
    if (!ghost) b.d.fill(0, r * row + Math.max(0, x0) * 4, r * row + Math.min(b.w, x1) * 4);
    for (let x = left; x < right; x++) {
      const sx = x - dx;
      if (sx < x0 || sx >= x1 || sx < 0 || sx >= b.w || src[sx * 4 + 3] === 0) continue;
      b.d.set(src.subarray(sx * 4, sx * 4 + 4), r * row + x * 4);
    }
  }
}

/** Chromatic aberration: red and blue channels pulled apart horizontally. */
export function splitRows(b: Bitmap, y: number, h: number, dx: number) {
  const row = b.w * 4;
  for (let r = Math.max(0, y); r < Math.min(b.h, y + h); r++) {
    const src = b.d.slice(r * row, (r + 1) * row);
    for (let x = 0; x < b.w; x++) {
      const i = r * row + x * 4;
      const left = Math.min(b.w - 1, Math.max(0, x - dx)) * 4;
      const right = Math.min(b.w - 1, Math.max(0, x + dx)) * 4;
      b.d[i] = src[left];
      b.d[i + 2] = src[right + 2];
      b.d[i + 3] = Math.max(src[left + 3], src[x * 4 + 3], src[right + 3]);
    }
  }
}

/**
 * A bar of thin horizontal stripes in two or three colours, only on pixels
 * inside `clip` (or on any opaque pixel). `unit` is the stripe granularity.
 */
export function stripes(
  b: Bitmap,
  clip: Mask | null,
  x0: number,
  y0: number,
  w: number,
  h: number,
  rng: XorShift128,
  unit = 1,
) {
  const palette = [rng.pick(GLITCH_COLORS), rng.pick(GLITCH_COLORS), rng.pick(GLITCH_COLORS)];
  let y = y0;
  while (y < y0 + h) {
    const band = (1 + rng.int(2)) * unit;
    const color = rng.float() < 0.2 ? null : palette[rng.int(palette.length)];
    for (let r = Math.max(0, y); r < Math.min(y + band, y0 + h, b.h); r++) {
      for (let x = Math.max(0, x0); x < Math.min(b.w, x0 + w); x++) {
        const p = r * b.w + x;
        if (!color || (clip ? !clip.d[p] : b.d[p * 4 + 3] === 0)) continue;
        b.d.set(color, p * 4);
      }
    }
    y += band;
  }
}

/** Speckles of random colours in `unit`-sized cells, spilling over edges. */
export function noise(b: Bitmap, x0: number, y0: number, w: number, h: number, rng: XorShift128, unit = 1, density = 0.5) {
  const palette = [...GLITCH_COLORS, [0, 0, 0, 255] as RGBA, [7, 11, 19, 255] as RGBA];
  for (let cy = y0; cy < y0 + h; cy += unit) {
    for (let cx = x0; cx < x0 + w; cx += unit) {
      if (rng.float() > density) continue;
      const color = rng.pick(palette);
      for (let y = Math.max(0, cy); y < Math.min(b.h, cy + unit); y++) {
        for (let x = Math.max(0, cx); x < Math.min(b.w, cx + unit); x++) b.d.set(color, (y * b.w + x) * 4);
      }
    }
  }
}

/** Minecraft's missing-texture checkerboard. */
export function missingTexture(b: Bitmap, clip: Mask | null, x0: number, y0: number, w: number, h: number, cell: number) {
  for (let y = Math.max(0, y0); y < Math.min(b.h, y0 + h); y++) {
    for (let x = Math.max(0, x0); x < Math.min(b.w, x0 + w); x++) {
      const p = y * b.w + x;
      if (clip ? !clip.d[p] : b.d[p * 4 + 3] === 0) continue;
      const on = (((x - x0) / cell) | 0) + (((y - y0) / cell) | 0);
      b.d.set(on & 1 ? [0, 0, 0, 255] : [248, 0, 248, 255], p * 4);
    }
  }
}

/** Sorts the pixels of each column by red, vertical_sort() in the poster code. */
export function sortColumns(b: Bitmap, x0: number, w: number, y0: number, y1: number) {
  const top = Math.max(0, y0);
  const bottom = Math.min(b.h, y1);
  for (let x = Math.max(0, x0); x < Math.min(b.w, x0 + w); x++) {
    const column: number[][] = [];
    for (let y = top; y < bottom; y++) {
      const i = (y * b.w + x) * 4;
      column.push([b.d[i], b.d[i + 1], b.d[i + 2], b.d[i + 3]]);
    }
    column.sort((a, c) => a[0] * a[3] - c[0] * c[3]);
    column.forEach((px, k) => b.d.set(px, ((top + k) * b.w + x) * 4));
  }
}

const N = 16;
const COS = new Float32Array(N * N);
const NORM = new Float32Array(N);
for (let u = 0; u < N; u++) {
  NORM[u] = Math.sqrt((u === 0 ? 1 : 2) / N);
  for (let x = 0; x < N; x++) COS[u * N + x] = Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N));
}

function dct(src: Float32Array, out: Float32Array, tmp: Float32Array) {
  for (let v = 0; v < N; v++) {
    for (let u = 0; u < N; u++) {
      let sum = 0;
      for (let x = 0; x < N; x++) sum += src[v * N + x] * COS[u * N + x];
      tmp[v * N + u] = NORM[u] * sum;
    }
  }
  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      let sum = 0;
      for (let y = 0; y < N; y++) sum += tmp[y * N + u] * COS[v * N + y];
      out[v * N + u] = NORM[v] * sum;
    }
  }
}

function idct(src: Float32Array, out: Float32Array, tmp: Float32Array) {
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let sum = 0;
      for (let u = 0; u < N; u++) sum += NORM[u] * src[y * N + u] * COS[u * N + x];
      tmp[y * N + x] = sum;
    }
  }
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      let sum = 0;
      for (let v = 0; v < N; v++) sum += NORM[v] * tmp[v * N + x] * COS[v * N + y];
      out[y * N + x] = sum;
    }
  }
}

const channels = Array.from({ length: 4 }, () => new Float32Array(N * N));
const coeffs = new Float32Array(N * N);
const scratch = new Float32Array(N * N);

/**
 * JPEG-style corruption of one 16×16 block, glitch_dct() in the poster code:
 * every channel loses a random amount of its high frequencies, which is what
 * gives the blocks their colour fringes. Works on premultiplied alpha so
 * transparent edges smear instead of turning black.
 */
export function crunch(b: Bitmap, x0: number, y0: number, rng: XorShift128) {
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const bx = x0 + x;
      const by = y0 + y;
      const inside = bx >= 0 && by >= 0 && bx < b.w && by < b.h;
      const i = (by * b.w + bx) * 4;
      const a = inside ? b.d[i + 3] / 255 : 0;
      for (let c = 0; c < 3; c++) channels[c][y * N + x] = inside ? b.d[i + c] * a : 0;
      channels[3][y * N + x] = a * 255;
    }
  }
  for (const ch of channels) {
    const cu = 1 + rng.int(N - 1);
    const cv = 1 + rng.int(N - 1);
    dct(ch, coeffs, scratch);
    for (let v = 0; v < N; v++) for (let u = 0; u < N; u++) if (u >= cu || v >= cv) coeffs[v * N + u] = 0;
    idct(coeffs, ch, scratch);
  }
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const bx = x0 + x;
      const by = y0 + y;
      if (bx < 0 || by < 0 || bx >= b.w || by >= b.h) continue;
      const i = (by * b.w + bx) * 4;
      const a = Math.min(255, Math.max(0, channels[3][y * N + x]));
      b.d[i + 3] = a;
      if (a < 1) continue;
      for (let c = 0; c < 3; c++) b.d[i + c] = channels[c][y * N + x] / (a / 255);
    }
  }
}

export interface GlitchTarget {
  faces: Mask;
  letters: { x: number; y: number; w: number; h: number }[];
}

/**
 * The poster's logo corruption: displaced slices, colour bars across the
 * letters, crunched blocks and sorted streaks. `strength` ~0.5 is the calm
 * printed look, 2 is a proper burst.
 */
export function glitchLogo(b: Bitmap, target: GlitchTarget, rng: XorShift128, strength = 1) {
  const s = Math.max(1, Math.round(b.w / 332));
  const count = (base: number) => Math.round(base * strength + rng.float() * strength);
  const letter = () => rng.pick(target.letters);

  for (let i = count(1.2); i > 0; i--) {
    const l = letter();
    const y = l.y + rng.int(l.h);
    const dx = (rng.float() < 0.5 ? -1 : 1) * (3 + rng.int(strength < 1 ? 6 : 14)) * s;
    shiftRows(b, y, (2 + rng.int(10)) * s, dx, rng.float() < 0.5, l.x - 8 * s, l.x + l.w + 8 * s);
  }
  for (let i = count(1.5); i > 0; i--) {
    const l = letter();
    const w = (14 + rng.int(34)) * s;
    const h = (5 + rng.int(12)) * s;
    stripes(b, target.faces, l.x + rng.int(Math.max(1, l.w - w)), l.y + rng.int(Math.max(1, l.h - h)), w, h, rng, s);
  }
  for (let i = count(1); i > 0; i--) {
    const l = letter();
    const w = (6 + rng.int(14)) * s;
    const h = (6 + rng.int(18)) * s;
    noise(b, l.x + rng.int(l.w), l.y + rng.int(l.h), w, h, rng, s, 0.35 + rng.float() * 0.4);
  }
  for (let i = count(1.5); i > 0; i--) {
    const l = letter();
    const x = l.x - 8 + rng.int(l.w);
    const y = l.y - 8 + rng.int(l.h);
    const cluster = 1 + rng.int(3);
    for (let k = 0; k < cluster; k++) crunch(b, x + (k % 2) * 16, y + (k >> 1) * 16, rng);
  }
  if (rng.float() < 0.4 * strength) {
    const l = letter();
    const w = (6 + rng.int(12)) * s;
    missingTexture(b, target.faces, l.x + rng.int(Math.max(1, l.w - w)), l.y + rng.int(l.h), w, (3 + rng.int(6)) * s, 2 * s);
  }
  if (rng.float() < 0.5 * strength) {
    const y = rng.int(b.h);
    splitRows(b, y, (4 + rng.int(20)) * s, (1 + rng.int(3)) * s);
  }
  if (rng.float() < 0.35 * strength) {
    const l = letter();
    const y = l.y + rng.int(l.h >> 1);
    sortColumns(b, l.x + rng.int(l.w), (1 + rng.int(5)) * s, y, y + (20 + rng.int(60)) * s);
  }
}
