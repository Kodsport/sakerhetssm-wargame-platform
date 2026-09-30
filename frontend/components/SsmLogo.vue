<template>
  <div
    ref="root"
    class="ssm-logo"
    :class="{ 'is-ready': ready }"
    @pointerenter="hovering = true"
    @pointerleave="hovering = false"
    @click="burst(900)"
  >
    <canvas ref="canvas" :width="size.width" :height="size.height" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { useOnScreen, useReducedMotion } from "~/composables/use-motion";
import { glitchLogo } from "~/utils/pixel/glitch";
import type { LetterLayer, LogoRender } from "~/utils/pixel/logo";
import { logoSize, renderGlitchedLetter, renderLogo } from "~/utils/pixel/logo";
import type { Bitmap } from "~/utils/pixel/raster";
import { cloneBitmap } from "~/utils/pixel/raster";
import { XorShift128 } from "~/utils/pixel/rng";

// The poster logo, rendered from the same masks as the print. Every so often
// a letter twitches; every few seconds the letters themselves break: torn,
// mirrored, melting, turned into $, swapped around. More while hovered, a
// lot when clicked.
const props = withDefaults(defineProps<{ animated?: boolean }>(), { animated: true });

/** Damaged versions pre-rendered per letter while the browser is idle. */
const VARIANTS = 6;

interface Layer {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
}

const size = logoSize(2);
const root = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const ready = ref(false);
const hovering = ref(false);
const reduced = useReducedMotion();
const onScreen = useOnScreen(root);
const animating = computed(() => props.animated && !reduced.value && onScreen.value);

let ctx: CanvasRenderingContext2D | null = null;
let work: CanvasRenderingContext2D | null = null;
let logo: LogoRender | null = null;
let calm: Bitmap | null = null;
let shadow: HTMLCanvasElement | null = null;
let letters: Layer[] = [];
let variants: Layer[][] = [];
const rng = new XorShift128((Math.random() * 2 ** 32) >>> 0);
let frameTimer: ReturnType<typeof setTimeout> | undefined;
let idleTimer: ReturnType<typeof setTimeout> | undefined;

function toCanvas(b: Bitmap) {
  const c = document.createElement("canvas");
  c.width = b.w;
  c.height = b.h;
  c.getContext("2d")?.putImageData(new ImageData(b.d, b.w, b.h), 0, 0);
  return c;
}

function toLayer(l: LetterLayer): Layer {
  return { canvas: toCanvas(l.image), x: l.x, y: l.y };
}

function show(b: Bitmap) {
  ctx?.putImageData(new ImageData(b.d, b.w, b.h), 0, 0);
}

/** A letter cut into bands that each slide a little. */
function drawSliced(g: CanvasRenderingContext2D, layer: Layer, x: number, y: number) {
  const { canvas: c } = layer;
  for (let sy = 0; sy < c.height; ) {
    const h = Math.min(c.height - sy, (3 + rng.int(18)) * 2);
    const shift = rng.float() < 0.5 ? 0 : (rng.float() < 0.5 ? -1 : 1) * (2 + rng.int(12)) * 2;
    g.drawImage(c, 0, sy, c.width, h, x + shift, y + sy, c.width, h);
    sy += h;
  }
}

/**
 * Builds one glitched frame. `only` limits the damage to one letter and
 * skips the overlays, for the small twitches between bursts.
 */
function compose(strength: number, only?: number): Bitmap {
  const g = work!;
  const { width, height } = size;
  g.clearRect(0, 0, width, height);
  g.drawImage(shadow!, 0, 0);

  // Big bursts sometimes put the letters in the wrong order.
  const slots = [0, 1, 2];
  if (only === undefined && strength >= 3 && rng.float() < 0.35) {
    for (let i = slots.length - 1; i > 0; i--) {
      const j = rng.int(i + 1);
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
  }

  letters.forEach((base, i) => {
    const hit = only === undefined ? rng.float() < 0.3 * strength : i === only;
    const pool = variants[i];
    const layer = hit && pool.length && rng.float() < 0.75 ? rng.pick(pool) : base;
    let x = layer.x + logo!.letters[slots[i]].x - logo!.letters[i].x;
    let y = layer.y;
    if (hit && rng.float() < 0.4) {
      x += (rng.float() < 0.5 ? -1 : 1) * (1 + rng.int(6)) * 2;
      y += (rng.int(5) - 2) * 2;
    }
    const effect = hit ? rng.float() : 1;
    if (effect < 0.25) {
      drawSliced(g, layer, x, y);
    } else if (effect < 0.4) {
      // Squashed or stretched from the top edge.
      const c = layer.canvas;
      const fx = 0.85 + rng.float() * 0.3;
      const fy = 0.7 + rng.float() * 0.55;
      g.drawImage(c, x, y, c.width * fx, c.height * fy);
    } else {
      g.drawImage(layer.canvas, x, y);
    }
  });

  const frame = g.getImageData(0, 0, width, height);
  const bitmap: Bitmap = { w: width, h: height, d: frame.data };
  if (only === undefined) glitchLogo(bitmap, logo!, rng, strength * 0.7);
  return bitmap;
}

function scheduleIdle() {
  clearTimeout(idleTimer);
  if (!animating.value) return;
  const wait = hovering.value ? 250 + rng.float() * 450 : 900 + rng.float() * 1900;
  idleTimer = setTimeout(() => {
    if (hovering.value || rng.float() < 0.35) burst();
    else twitch();
  }, wait);
}

/** One letter misbehaves for a single frame. */
function twitch() {
  if (!animating.value || !calm) return scheduleIdle();
  show(compose(1, rng.int(3)));
  frameTimer = setTimeout(() => {
    show(calm!);
    scheduleIdle();
  }, 60 + rng.float() * 60);
}

function burst(duration = 200 + rng.float() * 300) {
  if (!animating.value || !calm) return;
  clearTimeout(frameTimer);
  const end = performance.now() + duration;
  const strength = duration > 600 ? 3 : hovering.value ? 2.4 : 1.8;
  const step = () => {
    if (performance.now() >= end) {
      show(calm!);
      scheduleIdle();
      return;
    }
    show(compose(strength));
    frameTimer = setTimeout(step, 45 + rng.float() * 50);
  };
  step();
}

/** Renders the damaged letters one at a time, in the browser's spare time. */
function prepareVariants() {
  const whenIdle = (fn: () => void) =>
    "requestIdleCallback" in window ? window.requestIdleCallback(fn, { timeout: 1000 }) : setTimeout(fn, 30);
  const next = () => {
    if (!logo || reduced.value) return;
    const index = variants.findIndex((pool) => pool.length < VARIANTS);
    if (index < 0) return;
    variants[index].push(toLayer(renderGlitchedLetter(logo, index, rng)));
    whenIdle(next);
  };
  whenIdle(next);
}

onMounted(() => {
  // Let hydration finish before spending ~100 ms on the render.
  requestAnimationFrame(() => {
    ctx = canvas.value?.getContext("2d") ?? null;
    const scratch = document.createElement("canvas");
    scratch.width = size.width;
    scratch.height = size.height;
    work = scratch.getContext("2d", { willReadFrequently: true });
    if (work) work.imageSmoothingEnabled = false;

    logo = renderLogo(2);
    shadow = toCanvas(logo.shadow);
    letters = logo.layers.map(toLayer);
    variants = letters.map(() => []);
    calm = cloneBitmap(logo.image);
    // The permanent damage from the print, same seed every time.
    glitchLogo(calm, logo, new XorShift128(2027), 0.8);
    show(calm);
    ready.value = true;
    scheduleIdle();
    prepareVariants();
  });
});

watch([animating, hovering], scheduleIdle);

onBeforeUnmount(() => {
  clearTimeout(frameTimer);
  clearTimeout(idleTimer);
});
</script>

<style scoped>
.ssm-logo {
  display: inline-block;
  line-height: 0;
  max-width: 100%;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

canvas {
  width: 664px;
  max-width: 100%;
  height: auto;
  image-rendering: pixelated;
  opacity: 0;
}

.is-ready canvas {
  opacity: 1;
  animation: ssm-boot 0.45s steps(6, end);
}

@media (prefers-reduced-motion: reduce) {
  .is-ready canvas {
    animation: none;
  }
}
</style>
