<template>
  <div class="container">
    <div>
        <section v-if="tankSakert" class="mc-panel tank-sakert mb-4">
          <a class="tank-sakert__logo" href="https://www.ncsc.se/tanksakert" target="_blank">
            <img src="~/assets/tank-sakert.png" alt="Tänk säkert" />
          </a>
          <h1 class="h2 mb-3">Är du smartare än en Kodsportare?</h1>
          <p>
            Under oktober är månadens utmaning en del av
            <a href="https://www.ncsc.se/tanksakert" target="_blank">Tänk säkert</a>,
            kampanjen där NCSC, Polisen och över 20 andra organisationer sprider säkra vanor på nätet.
            Alla får vara med och lösa, och du behöver inga förkunskaper för att börja.
          </p>
          <p v-if="monthly.status.value != 'success'" class="text-primary">Utmaningen släpps 1 oktober kl. 16:00.</p>
          <div class="d-flex flex-wrap gap-2">
            <a v-if="monthly.status.value == 'success'" class="btn btn-primary" href="#manadens-utmaning">Till månadens utmaning</a>
            <NuxtLink class="btn btn-secondary" to="/challenges">Ny till CTF? Börja här</NuxtLink>
          </div>
        </section>

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
        <h1 id="manadens-utmaning" class="text-primary">
          Månadens utmaning - {{ monthly.data.value.display_month }}
        </h1>
        <div class="col pt-4 pt-md-0 mb-5">
          <MonthlyChallenge :chall="monthly.data.value.challenge" />
        </div>
      </div>

      <section v-if="tankSakert" class="mc-panel mb-5">
        <h2 class="text-primary">Vilka är vi?</h2>
        <p>Säkerhets-SM är Sveriges hackingtävling för unga, och en del av en större rörelse för unga som gillar problemlösning.</p>
        <div class="row g-4">
          <div class="col-12 col-md-6">
            <a class="tank-sakert__org" href="https://www.kodsport.se/" target="_blank">
              <img src="~/assets/kodsport.png" alt="Kodsport Sverige" />
            </a>
            <p class="mb-0">
              <b>Kodsport Sverige</b> är en ideell förening för dig som gillar att lösa kluriga problem med hjälp av datorer.
              Förutom Säkerhets-SM arrangerar Kodsport Programmeringsolympiaden, AI-olympiaden, Swedish Coding Cup och läger.
            </p>
          </div>
          <div class="col-12 col-md-6">
            <a class="tank-sakert__org tank-sakert__org--light" href="https://ungvetenskapssport.se/" target="_blank">
              <img src="~/assets/uvs.png" alt="Ung Vetenskapssport" />
            </a>
            <p class="mb-0">
              <b>Ung Vetenskapssport</b> är ungdomsförbundet som Kodsport är en del av. Förbundet skapar mötesplatser och
              träningsmöjligheter för unga som gillar problemlösning, från Säkerhets-SM till matte-, fysik- och biologiläger.
            </p>
          </div>
        </div>
      </section>

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

// Tänk säkert, NCSC's campaign for the European Cybersecurity Month, links
// here as "Kodsports oktober CTF", so October gets a welcome for its visitors.
const tankSakert = useState('tank-sakert', () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', month: 'numeric' }).format(new Date()) === '10'
)

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
.tank-sakert {
  border-image: linear-gradient(90deg, #ea507c, #75da91, #53d8df) 1;
}

.tank-sakert__logo {
  display: block;
  width: min(24rem, 100%);
  margin: 0.75rem 0 1rem;
}

.tank-sakert__logo img {
  width: 100%;
  height: auto;
}

.tank-sakert__org {
  display: flex;
  align-items: center;
  height: 7.5rem;
  margin-bottom: 1rem;
}

/* The UVS logo is black on transparent, so it sits on white. */
.tank-sakert__org--light {
  width: fit-content;
  padding: 0.4rem 0.75rem;
  background: #fff;
  border: var(--mc-px) solid #000;
}

.tank-sakert__org img {
  max-width: 100%;
  max-height: 6rem;
}

.tank-sakert__org--light img {
  max-height: 100%;
}

.hover-thing {
  cursor: pointer;
}

.hover-thing:hover {
  background-color: rgba(255, 255, 255, 0.08);
}
</style>
