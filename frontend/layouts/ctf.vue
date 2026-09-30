<template>
  <div class="ctf-gradient-bg ssm-layout">
    <CTFHeader />
    <div class="px-3 py-4">
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCTFStore } from "~/store/ctf";
import { useRoute } from "vue-router";
import { onMounted, onUnmounted } from "vue";

const ctfStore = useCTFStore();
const route = useRoute();
let intervalId: any;

const time = 15 * 1000; // 15 seconds

const currentTheme = "";

onMounted(async () => {
  loadTheme();
  await new Promise((resolve) => setTimeout(resolve, time));

  // Refresh the CTF data every 15 seconds
  intervalId = setInterval(async () => {
    const slug = route.params.slug as string;
    const password =
      (process.client && localStorage.getItem("ctf_password")) || undefined;
    if (slug) await ctfStore.getAll(slug, password, true);

    if (currentTheme !== ctfStore.ctf.theme) loadTheme();
  }, time);
});

watch(
  () => ctfStore.ctf.theme,
  () => {
    loadTheme();
  }
);

function loadTheme() {
  const themeName = ctfStore.ctf.theme || "default";

  const head = document.getElementsByTagName("head")[0];
  let themeEl = document.getElementById("ctf-theme") as HTMLLinkElement;

  if (!themeEl) {
    themeEl = document.createElement("link");
    themeEl.id = "ctf-theme";
    themeEl.rel = "stylesheet";
    themeEl.href = `/themes/${themeName}.css`;
    head.appendChild(themeEl);
  } else {
    themeEl.href = `/themes/${themeName}.css`;
  }
}

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>
<style scoped>
.ctf.gradient-bg {
  border-bottom: 3px solid;
  border-image: linear-gradient(to right, var(--bs-primary), #004353) 1;
}
</style>
