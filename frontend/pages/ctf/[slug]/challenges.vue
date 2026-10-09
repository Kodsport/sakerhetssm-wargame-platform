<template>
  <div class="container">
    <h1>{{ $t('ctf.challenges') }}</h1>
    <CTFAlert v-if="ctfStore?.ctf" />
    <client-only>
      <div
        v-for="category in categories"
        :key="category"
        v-if="ctfStore.challenges?.length"
      >
        <div
          v-if="
            ctfStore.challenges.filter((c) => c.category == category).length
          "
        >
          <div class="text-primary gradient-border pt-2 pb-2">
            <h4 class="text-lowercase">{{ category }}</h4>
          </div>

          <div class="ssm-grid pt-3 pb-2">
            <div
              v-for="chall in ctfStore.challenges
                .filter((c) => c.category == category)
                .sort((a, b) => Number(a.score) - Number(b.score))
                .sort(
                  (a, b) => Number(a.display_order) - Number(b.display_order)
                )"
              :key="chall.id"
            >
              <CTFChallengePreview
                class="pointer"
                @click="nav(chall.slug)"
                :chall="chall"
              />
            </div>
          </div>
        </div>
      </div>
    </client-only>
  </div>
  <NuxtPage />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import useHttp from "@/composables/use-http";
import { useCTFStore } from "~/store/ctf";
import { useAuthStore } from "~/store/auth";

definePageMeta({
  layout: "ctf",
  middleware: "ctf",
});

const route = useRoute();
const router = useRouter();
const slug = route.params.slug as string;
const ctfStore = useCTFStore();

// order
const order = [
  "introduktion",
  "web",
  "crypto",
  "forensics",
  "osint",
  "pwn",
  "reversing",
  // the rest of the categories
];

const categories = computed(() => {
  const cats = ctfStore.challenges?.map((c) => c.category) || [];
  const unique = Array.from(new Set(cats));

  return unique.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);

    const aUnknown = ia === -1;
    const bUnknown = ib === -1;

    if (aUnknown && bUnknown) return a.localeCompare(b);
    if (aUnknown) return 1;
    if (bUnknown) return -1;
    return ia - ib;
  });
});

function nav(challSlug: string) {
  router.push(`/ctf/${slug}/challenges/${challSlug}`);
}
</script>
<style scoped>
.pointer {
  cursor: pointer;
}

.ssm-grid {
  display: grid;
  /* Magic auto-sizing grid: https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/ */
  grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
  gap: 1rem;
}
.gradient-border {
  border-bottom: 3px solid;
  border-image: linear-gradient(to right, var(--bs-primary), #ffc869) 1;
}
</style>
