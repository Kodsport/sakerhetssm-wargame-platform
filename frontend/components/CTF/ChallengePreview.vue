<template>
  <div class="card h-100 challenge-card" :class="getBackgroundClass()">
    <div class="card-body pb-2">
      <h5 class="title-text">{{ props.chall.title }}</h5>
    </div>
    <div class="card-body d-flex justify-content-between">
      <div v-if="!props.hideSolves" class="align-items-end d-flex solve-text">
        <template v-if="props.chall.numTeamsSolved !== undefined">
          <span v-if="props.chall.numTeamsSolved > 0"
            >{{ props.chall.numTeamsSolved }} lag</span
          >
          <span v-else>Olöst</span>
        </template>
        <template v-else>
          <span v-if="props.chall.numUsersSolved || props.chall.solves"
            >{{ props.chall.numUsersSolved || props.chall.solves }} lösare</span
          >
          <span v-else>Olöst</span>
        </template>
      </div>
      <h3 class="align-items-end d-flex mb-0 score-text">
        {{ props.chall.score }}
      </h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useCTFStore } from "~/store/ctf";

const ctfStore = useCTFStore();
const props = defineProps(["chall", "hideSolves"]);

function getBackgroundClass() {
  // färger beroende på hur en chall e löst
  if (props.chall.solved) {
    return "is-solved"; // ifall solvern är den som är inloggad
  }

  if (props.chall.solved_in_team) {
    return "is-team-solved"; // ifall nån i temeat har löst den men inte den som är inloggad
  }

  return ""; // ingen i laget har löst den/ du har inte löst den heller
}
</script>
<style>
.title-text {
  font-size: 1.3rem;
  min-height: 50px;
}
.score-text {
  font-size: 1.5rem;
}
.solve-text span {
  font-size: 0.9rem;
}
</style>
