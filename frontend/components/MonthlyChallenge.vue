<template>
  <div class="mc-panel position-relative">
    <div class="d-flex justify-content-between align-items-start">
      <h4>
        {{ props.chall.title }}
        {{ props.displayMonth ? ` - ${props.displayMonth}` : "" }}
      </h4>

      <div class="badge bg-primary">
        {{ props.chall.category }}
      </div>
    </div>

    <div class="pb-2" v-if="props.chall.authors?.length">
      <span class="material-symbols-outlined pe-1">group</span>
      <span class="material-symbols-outlined pe-1">edit</span>
      <span>{{ props.chall.authors.map((a) => a.full_name).join(", ") }}</span>
    </div>

    <div
      v-if="props.chall.files?.length"
      class="pb-2 d-none d-md-flex"
      v-for="file in props.chall.files"
    >
      <FileDownload :file="file" />
    </div>

    <div class="d-flex pb-2" v-for="service in props.chall.services">
      <span class="material-symbols-outlined pe-2">router</span>
      <a
        class="text-break"
        v-if="service.hyperlink"
        :href="service.user_display"
        target="_blank"
        >{{ service.user_display }}</a
      >
      <span v-else class="text-break">{{ service.user_display }}</span>
    </div>

    <div v-html="renderedDescription"></div>

    <div class="py-3">
      <div class="d-none d-md-inline">
        <client-only>
          <FlagInput :class="{ 'is-wrong': warn }" v-model="flag" @keypress.enter="submitFlag"
              :solved="props.chall.solved" />
          <template #fallback>
            <InputReplacer text="Logga in för att skicka in flaggor" />
          </template>
        </client-only>
      </div>
      <div class="d-inline d-md-none">
        <p class="alert alert-warning">
          Gå in på sidan med en dator för att lösa utmaningen!
        </p>
      </div>
    </div>

    <p>{{ props.chall.solves }} lösare</p>
  </div>
</template>

<script setup lang="ts">
import { useChallengeStore } from "../store/challenges";
import { useAuthStore } from "../store/auth";
import renderMarkdown from "../utils/markdown";

const challs = useChallengeStore();
const auth = useAuthStore();
const props = defineProps({
  chall: Object,
  displayMonth: String,
});
const http = useHttp();

const flag = ref("");
const warn = ref(false);

const renderedDescription = computed(() =>
  renderMarkdown(props.chall.description)
);

async function submitFlag() {
  let f = flag.value.trim();
  if (f == "") {
    return;
  }
  try {
    await http(`/challenges/${props.chall.id}/attempt`, {
      method: "POST",
      body: {
        flag: f,
      },
    });

    challs.getChallenges();
    challs.getMonthlies();
    props.chall.solved = true;
  } catch (error) {
    console.log(error);
    warn.value = true;
    setTimeout(() => {
      warn.value = false;
    }, 1000);
  }
}
</script>
