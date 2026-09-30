<template>
  <canvas ref="canvas" class="portal-particles" aria-hidden="true" />
</template>

<script setup lang="ts">
import { useAnimationFrame, useOnScreen, useReducedMotion } from "~/composables/use-motion";

// Nether portal particles drifting into whatever this is placed over.
// Coloured like Minecraft's PortalParticle: (0.9f, 0.3f, f) * brightness f.
const props = withDefaults(
  defineProps<{
    /** "area": anywhere, pulled to the middle. "edge": around the rim, only drifting partway in. */
    spawn?: "area" | "edge";
  }>(),
  { spawn: "area" },
);

const PX = 3;

interface Particle {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  age: number;
  life: number;
  size: number;
  color: string;
  wobble: number;
  phase: number;
}

const canvas = ref<HTMLCanvasElement | null>(null);
const reduced = useReducedMotion();
const onScreen = useOnScreen(canvas);
const active = computed(() => onScreen.value && !reduced.value);

let particles: Particle[] = [];
let width = 0;
let height = 0;
let last = 0;
let observer: ResizeObserver | null = null;

function resize() {
  const el = canvas.value;
  if (!el) return;
  width = Math.max(1, Math.ceil(el.clientWidth / PX));
  height = Math.max(1, Math.ceil(el.clientHeight / PX));
  el.width = width;
  el.height = height;
}

/** A random point on the rim of the canvas. */
function rimPoint() {
  let p = Math.random() * 2 * (width + height);
  if (p < width) return [p, 0];
  if ((p -= width) < height) return [width, p];
  if ((p -= height) < width) return [width - p, height];
  return [0, height - (p - width)];
}

function spawn(): Particle {
  const f = Math.random() * 0.6 + 0.4;
  let x0 = Math.random() * width;
  let y0 = Math.random() * height;
  let x1 = width * (0.25 + Math.random() * 0.5);
  let y1 = height * (0.3 + Math.random() * 0.4);
  if (props.spawn === "edge") {
    [x0, y0] = rimPoint();
    const inward = 0.15 + Math.random() * 0.2;
    x1 = x0 + (width / 2 - x0) * inward;
    y1 = y0 + (height / 2 - y0) * inward;
  }
  return {
    x0,
    y0,
    x1,
    y1,
    age: 0,
    life: 1.5 + Math.random() * 2.5,
    size: Math.random() < (props.spawn === "edge" ? 0.5 : 0.3) ? 2 : 1,
    color: `rgb(${(f * 0.9 * 255) | 0},${(f * 0.3 * 255) | 0},${(f * 255) | 0})`,
    wobble: 2 + Math.random() * 6,
    phase: Math.random() * Math.PI * 2,
  };
}

useAnimationFrame(active, (time) => {
  const ctx = canvas.value?.getContext("2d");
  if (!ctx || !width) return;
  const dt = last ? Math.min(0.1, (time - last) / 1000) : 0;
  last = time;

  const target = Math.round(props.spawn === "edge" ? (width + height) / 2.5 : (width * height) / 900);
  particles = particles.filter((p) => (p.age += dt) < p.life);
  while (particles.length < target) particles.push(spawn());

  ctx.clearRect(0, 0, width, height);
  for (const p of particles) {
    const t = p.age / p.life;
    const pull = t * t;
    const x = p.x0 + (p.x1 - p.x0) * pull + Math.sin(p.phase + t * 6) * p.wobble * (1 - t);
    const y = p.y0 + (p.y1 - p.y0) * pull + Math.cos(p.phase + t * 5) * p.wobble * 0.5 * (1 - t);
    ctx.globalAlpha = Math.min(1, t * 8, (1 - t) * 4);
    ctx.fillStyle = p.color;
    ctx.fillRect(x | 0, y | 0, t > 0.7 ? 1 : p.size, t > 0.7 ? 1 : p.size);
  }
});

watch(active, (on) => {
  if (!on) last = 0;
});

onMounted(() => {
  resize();
  observer = new ResizeObserver(resize);
  if (canvas.value) observer.observe(canvas.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
.portal-particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  image-rendering: pixelated;
}
</style>
