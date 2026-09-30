<template>
  <div class="container">
    <div>
        <div>
          <h2 class="text-primary ">Vad är månadens problem?</h2>
        </div>
        <div class="mc-panel mb-4">
          <div class="row g-4">
            <div class="col-12 col-md-6">
              <div>
                <h4 class="text-primary mb-1 text-center">Beskrivning</h4>
                <p class="text-white">Månadens problem är en utmaning i varierande svårighetsgrad skapad av medlemmar i CTF-gemenskapen.</p>
                <p class="text-white">Den första varje månad 16:00 publiceras månadens utmaning. Pris ges ut en eller flera slumpmässigt valda lösare i slutet av månaden.</p>
                <p class="text-white">Som lösare får du en speciell roll på <a :href="discordUrl" target="_blank">Kodsports Discordserver</a>. Rollen är enbart aktiv under månaden.</p>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div>
                <h4 class="text-primary mb-1 text-center">Regler</h4>
                <p class="text-white">För att vara behörig till pris behöver lösaren vara i grund eller gymnasieålder.</p>
                <p class="test-white">Det går inte att vinna mer än ett pris under samma månad.</p>
                <p class="text-white">Vill du vara med och skapa nästa månadens utmaning? Kontakta då Allan (<a :href="monthlyOrg" target="_blank">@alanoo079</a> på Discord) så kokar vi ihop något roligt!</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="monthly.status.value == 'success'">
        <h1 class="text-primary">
          Månadens utmaning - {{ monthly.data.value.display_month }}
        </h1>
        <div class="col pt-4 pt-md-0 mb-5">
          <MonthlyChallenge :chall="monthly.data.value.challenge" />
        </div>
      </div>

      <h1 class="text-primary">Förra månaders utmaningar</h1>
      <div
        v-for="prev_monthly in prev_monthlies.data.value.filter(
          (e) => monthly?.data?.value?.challenge_id !== e.challenge_id
        )"
        v-if="prev_monthlies.status.value == 'success'"
        class="mb-2"
      >
        <div class="mc-tooltip">
          <div
            class="text-primary p-4 d-flex justify-content-between align-items-center hover-thing"
            v-if="show_prev_monthly != prev_monthly.challenge_id"
            @click="show_prev_monthly = prev_monthly.challenge_id"
          >
            <div>
              {{ prev_monthly.challenge.title }} -

              {{ prev_monthly.display_month }}
              {{ new Date(prev_monthly.start_date * 1000).getFullYear() }}
            </div>

            <div class="badge bg-primary">
              {{ prev_monthly.challenge.category }}
            </div>
          </div>

          <MonthlyChallenge
            v-if="show_prev_monthly == prev_monthly.challenge_id"
            :chall="prev_monthly.challenge"
            :displayMonth="
              prev_monthly.display_month +
              ' ' +
              new Date(prev_monthly.start_date * 1000).getFullYear()
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../store/auth";

const http = useHttp();
const auth = useAuthStore();

const discordUrl = 'https://discord.gg/edKFKKU'
const monthlyOrg = 'https://discord.com/users/468779292705161216'

const monthly = await useAsyncData("monthly", () =>
  http("/current_monthly_challenge")
);

const show_prev_monthly = ref("");

const prev_monthlies = await useAsyncData("prev_monthly", () =>
  http("/monthly_challenges")
);

watch(
  () => auth.user,
  () => {
    if (auth.user.id) {
      monthly.refresh();
      prev_monthlies.refresh();
    }
  }
);
</script>
<style scoped>
.hover-thing {
  cursor: pointer;
}

.hover-thing:hover {
  background-color: rgba(255, 255, 255, 0.08);
}
</style>
