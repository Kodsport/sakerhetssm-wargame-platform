<template>
  <div class="container">
    <h1>{{ $t('ctf.scoreboard') }}</h1>
    <CTFAlert v-if="ctfStore?.ctf" />
    <table class="table table-hover align-middle scoreboard-table mt-4">
      <thead class="table-active">
        <tr>
          <th>#</th>
          <th>{{ ctfStore?.ctf.team_based ? $t('ctf.teamName') : $t('common.name') }}</th>
          <th>{{ $t('common.score') }}</th>
          <th>{{ $t('challenge.solutions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in ctfStore.scoreboard"
          :key="row.username"
          :class="{
            'scoreboard-gold': i === 0,
            'scoreboard-silver': i === 1,
            'scoreboard-bronze': i === 2,
            'scoreboard-user': auth.ctfUser.username === row.username && i > 2,
          }"
          @click="$router.push(`/ctf/${route.params.slug}/user/${row.id}`)"
        >
          <td class="fw-bold">{{ i + 1 }}</td>
          <td>{{ row.username }}</td>
          <td class="fw-bold">{{ row.score }}</td>
          <td>{{ row.solves ? row.solves.length : 0 }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCTFStore } from "../../../store/ctf";
import { useAuthStore } from "../../../store/auth";

definePageMeta({
  layout: "ctf",
  middleware: "ctf",
});

const route = useRoute();
const ctfStore = useCTFStore();
const auth = useAuthStore();
</script>

<style scoped>
tbody > tr {
  cursor: pointer;
}

.scoreboard-table {
  font-size: 1.1rem;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.table > :not(caption) > * > * {
  background-color: #00000000;
}

.scoreboard-table th,
.scoreboard-table td {
  vertical-align: middle;
}

.scoreboard-gold td {
  background: #a1862a !important;
  color: #fff6d3 !important;
  font-weight: bold;
}

.scoreboard-silver td {
  background: #52575c !important;
  color: #e7e7e7 !important;
  font-weight: bold;
}

.scoreboard-bronze td {
  background: #7a4e21 !important;
  color: #ffe3c6 !important;
  font-weight: bold;
}

.scoreboard-user td {
  background: #0000002d !important;
  font-weight: bold;
}
</style>
