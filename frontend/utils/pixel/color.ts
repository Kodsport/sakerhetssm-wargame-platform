import type { RGBA } from "./raster";

// Oklch -> 8-bit sRGB, as in utils/color.rs of the poster code. Out-of-gamut
// channels saturate the same way Rust's `as u8` does.

function linearToSrgb(x: number) {
  return x <= 0.0031308 ? x * 12.92 : Math.pow(x, 1 / 2.4) * 1.055 - 0.055;
}

function toByte(x: number) {
  return Math.min(255, Math.max(0, Math.floor(linearToSrgb(x) * 255)));
}

/** `h` is in radians. */
export function oklch(l: number, c: number, h: number, alpha = 255): RGBA {
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    toByte(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    toByte(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    toByte(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
    alpha,
  ];
}
