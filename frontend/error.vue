<template>
  <div class="error-page">
    <GlitchBackground />
    <main class="error-page__screen mc-panel">
      <h1 class="error-page__title">{{ status }}</h1>
      <p class="error-page__message">{{ message }}</p>
      <div class="error-page__buttons">
        <button class="btn btn-secondary" @click="back">{{ $t('error.back') }}</button>
        <button class="btn btn-primary" @click="home">{{ $t('error.toHome') }}</button>
      </div>
      <p v-if="props.error?.statusMessage" class="error-page__detail">{{ props.error.statusMessage }}</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";
import { useI18n } from "vue-i18n";

const props = defineProps<{ error: NuxtError }>();

const route = useRoute();
const { t } = useI18n();
const status = computed(() => props.error?.statusCode ?? 500);
const message = computed(() => {
  if (status.value === 404) return t('error.notFound', { path: route.path });
  if (status.value === 401 || status.value === 403) return t('error.forbidden');
  if (status.value >= 500) return t('error.serverError');
  return t('error.generic');
});

useHead({ title: computed(() => `${status.value} - SSM`) });

function back() {
  const back = window.history.state?.back;
  clearError({ redirect: typeof back === "string" ? back : "/" });
}

function home() {
  clearError({ redirect: "/" });
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  text-align: center;
}

.error-page__screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(32rem, 100%);
}

.error-page__title {
  margin-bottom: 1rem;
  font-size: 3.375rem;
  color: var(--bs-primary);
}

.error-page__buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(20rem, 100%);
  margin-top: 1rem;
}

.error-page__detail {
  margin: 1.5rem 0 0;
  color: var(--bs-secondary-color);
}
</style>
