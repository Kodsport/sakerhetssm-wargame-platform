<template>
  <div>
    <div class="alert-box mc-tooltip" v-if="text">
      {{ text }}
    </div>
    <div class="timeline-container" v-if="ctfStore.ctf.slug && !hasEnded && !hasNotStarted">
      <div class="timeline-labels">
        <span>{{ formatTime(ctfStore.ctf.start_time) }}</span>
        <span>{{ formatTime(ctfStore.ctf.end_time) }}</span>
      </div>
      <div class="timeline-level" title="Procent av tävlingen som har gått">{{ Math.floor(progress) }}%</div>
      <div class="timeline-bar">
        <div class="timeline-progress" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useCTFStore } from "~/store/ctf";
import moment from "moment";

const ctfStore = useCTFStore();

const now = ref(Date.now());
let timer: any = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const hasEnded = computed(() => {
  if (!ctfStore.ctf.slug) return false;
  return new Date(ctfStore.ctf.end_time).getTime() < now.value;
});

const hasNotStarted = computed(() => {
  if (!ctfStore.ctf.slug) return false;
  return new Date(ctfStore.ctf.start_time).getTime() > now.value;
});

const isFrozen = computed(() => {
  if (!ctfStore.ctf.scoreboard_freeze_start || !ctfStore.ctf.scoreboard_freeze_end) return false;
  const freezeStart = new Date(ctfStore.ctf.scoreboard_freeze_start).getTime();
  const freezeEnd = new Date(ctfStore.ctf.scoreboard_freeze_end).getTime();
  return now.value >= freezeStart && now.value < freezeEnd;
});

const beforeFreeze = computed(() => {
  if (!ctfStore.ctf.scoreboard_freeze_start) return false;
  return now.value < new Date(ctfStore.ctf.scoreboard_freeze_start).getTime();
});

const text = computed(() => {
  if (hasNotStarted.value)
    return (
      "CTF:en har inte börjat ännu! Den börjar " +
      moment(new Date(ctfStore.ctf.start_time)).format("YYYY-MM-DD HH:mm:ss") +
      "."
    );
  if (hasEnded.value) return "CTF:en har avslutats!";
  
  if (isFrozen.value) {
    return (
      "Poängtavlan är fryst! Lösningar räknas fortfarande men visas inte förrän " +
      moment(new Date(ctfStore.ctf.scoreboard_freeze_end)).format("YYYY-MM-DD HH:mm:ss") +
      "."
    );
  }
  
  if (beforeFreeze.value && ctfStore.ctf.scoreboard_freeze_start) {
    return (
      "Poängtavlan kommer att frysas " +
      moment(new Date(ctfStore.ctf.scoreboard_freeze_start)).format("YYYY-MM-DD HH:mm:ss") +
      "."
    );
  }
  
  return "";
});

const progress = computed(() => {
  if (!ctfStore.ctf.slug) return 0;
  const start = new Date(ctfStore.ctf.start_time).getTime();
  const end = new Date(ctfStore.ctf.end_time).getTime();
  if (now.value <= start) return 0;
  if (now.value >= end) return 100;
  return ((now.value - start) / (end - start)) * 100;
});

function formatTime(time: string) {
  return moment(new Date(time)).format("YYYY-MM-DD HH:mm");
}
</script>
<style scoped>
.alert-box {
  color: white;
  padding: 10px 14px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.timeline-container {
  margin: 10px 0 10px 0;
}
.timeline-labels {
  display: flex;
  justify-content: space-between;
  color: #ccc;
  margin-bottom: 4px;
}
.timeline-level {
  margin-bottom: 4px;
  text-align: center;
  color: #ccc;
}
.timeline-bar {
  width: 100%;
  height: 14px;
  background: #1c1228;
  border: 2px solid #4a3a66;
  overflow: hidden;
  position: relative;
}
.timeline-progress {
  height: 100%;
  background: linear-gradient(90deg, #ea507c, #75da91, #53d8df);
  transition: width 0.5s;
}
</style>
