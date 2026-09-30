<template>
  <div class="ssm-bg" aria-hidden="true">
    <canvas ref="base" class="ssm-bg__layer" :class="{ 'is-ready': ready }" />
    <canvas ref="fx" class="ssm-bg__layer" />
  </div>
</template>

<script setup lang="ts">
import { useReducedMotion } from "~/composables/use-motion";
import { renderBackground } from "~/utils/pixel/background";

// The warped block checkerboard from the poster, fixed behind every page.
// Every few seconds a couple of scanlines tear sideways.
const PX = 3;

const base = ref<HTMLCanvasElement | null>(null);
const fx = ref<HTMLCanvasElement | null>(null);
const ready = ref(false);
const reduced = useReducedMotion();

let width = 0;
let height = 0;
let resizeTimer: ReturnType<typeof setTimeout> | undefined;
let burstTimer: ReturnType<typeof setTimeout> | undefined;
let frameTimer: ReturnType<typeof setTimeout> | undefined;

function render() {
  const w = Math.ceil(window.innerWidth / PX);
  // Cover the tallest the viewport gets, so mobile toolbars don't cause re-renders.
  const h = Math.ceil(Math.max(window.innerHeight, screen.height) / PX);
  if (w === width && h <= height) return;
  width = w;
  height = Math.max(h, height);

  const image = renderBackground(width, height);
  for (const c of [base.value, fx.value]) {
    if (!c) continue;
    c.width = width;
    c.height = height;
    c.style.width = `${width * PX}px`;
    c.style.height = `${height * PX}px`;
  }
  base.value?.getContext("2d")?.putImageData(new ImageData(image.d, width, height), 0, 0);
  ready.value = true;
}

function scheduleBurst() {
  clearTimeout(burstTimer);
  if (reduced.value) return;
  burstTimer = setTimeout(burst, 4000 + Math.random() * 7000);
}

function burst() {
  const ctx = fx.value?.getContext("2d");
  if (!ctx || !base.value || document.hidden) return scheduleBurst();
  let frames = 2 + Math.floor(Math.random() * 4);
  const step = () => {
    ctx.clearRect(0, 0, width, height);
    if (frames-- <= 0) return scheduleBurst();
    for (let i = 1 + Math.floor(Math.random() * 3); i > 0; i--) {
      const y = Math.floor(Math.random() * height);
      const h = 1 + Math.floor(Math.random() * 6);
      const dx = Math.round((Math.random() - 0.5) * 24);
      ctx.drawImage(base.value!, 0, y, width, h, dx, y, width, h);
    }
    frameTimer = setTimeout(step, 50 + Math.random() * 60);
  };
  step();
}

function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(render, 300);
}

onMounted(() => {
  const start = () => {
    render();
    scheduleBurst();
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 500 });
  else setTimeout(start, 50);
  window.addEventListener("resize", onResize);
});

watch(reduced, scheduleBurst);

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  clearTimeout(resizeTimer);
  clearTimeout(burstTimer);
  clearTimeout(frameTimer);
});
</script>

<style scoped>
.ssm-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 30% 10%, #3b1d6e 0%, transparent 60%),
    linear-gradient(#1f1238, #0e0a1a);
}

.ssm-bg__layer {
  position: absolute;
  top: 0;
  left: 0;
  image-rendering: pixelated;
}

.ssm-bg__layer:first-child {
  opacity: 0;
  transition: opacity 0.6s steps(4, end);
}

.ssm-bg__layer.is-ready {
  opacity: 1;
}
</style>
