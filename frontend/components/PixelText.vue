<template>
  <span
    class="pixel-text"
    :class="{ 'is-smooth': smooth }"
    :style="
      balanced
        ? {
            marginRight: `-${size.depth}px`,
            marginBottom: `-${size.depth}px`,
            maxWidth: `calc(100% + ${size.depth}px)`,
          }
        : undefined
    "
  >
    <canvas
      ref="canvas"
      :width="size.width"
      :height="size.height"
      :style="{ width: `${size.width}px` }"
      aria-hidden="true"
    />
    <span class="visually-hidden">{{ text }}</span>
  </span>
</template>

<script setup lang="ts">
import { pixelTextSize, renderPixelText } from "~/utils/pixel/text";

// Text in the style of the poster's "Säkerhets-SM 2027": white Pixel Mecha
// Bold with a rainbow border.
const props = withDefaults(
  defineProps<{
    text: string;
    /** CSS pixels per font pixel; the poster uses 4. */
    scale?: number;
    /** Squeeze the whole title rainbow into this text, for short words like "SSM". */
    fit?: boolean;
    /** Smooth scaling, for when it's shown smaller than it is rendered. */
    smooth?: boolean;
    /** Leave the extrusion out of the layout box, so centring centres the letters. */
    balanced?: boolean;
  }>(),
  { scale: 4, fit: false, smooth: false, balanced: false },
);

const canvas = ref<HTMLCanvasElement | null>(null);
const size = computed(() => pixelTextSize(props.text, props.scale));

function paint() {
  const ctx = canvas.value?.getContext("2d");
  if (!ctx) return;
  const image = renderPixelText(props.text, { scale: props.scale, fit: props.fit });
  ctx.putImageData(new ImageData(image.d, image.w, image.h), 0, 0);
}

onMounted(paint);
watch(() => [props.text, props.scale, props.fit], () => nextTick(paint));
</script>

<style scoped>
.pixel-text {
  display: inline-block;
  line-height: 0;
  max-width: 100%;
  vertical-align: top;
}

canvas {
  display: block;
  max-width: 100%;
  height: auto;
  image-rendering: pixelated;
}

.is-smooth canvas {
  image-rendering: auto;
}
</style>
