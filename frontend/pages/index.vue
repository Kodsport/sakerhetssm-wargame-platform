<template>
  <div class="container">
    <section class="ssm-hero">
      <h1 class="visually-hidden">Säkerhets-SM 2027</h1>
      <div class="ssm-hero__logo">
        <div class="ssm-hero__particles">
          <PortalParticles />
        </div>
        <SsmLogo />
        <!-- Twice the poster's size, shown at the logo's scale (2/3 of the poster). -->
        <PixelText class="ssm-hero__subtitle" text="Säkerhets-SM 2027" :scale="8" smooth />
        <SplashText class="ssm-hero__splash" />
      </div>

      <p class="ssm-hero__tagline mc-tooltip">{{ $t('home.tagline') }}</p>

      <div class="ssm-hero__facts">
        <div class="mc-panel">
          <span class="mc-label">{{ $t('home.qualOnline') }}</span>
          <span class="ssm-hero__fact">{{ $t('home.qualDate') }}</span>
        </div>
        <div class="mc-panel">
          <strong class="d-block">{{ $t('home.teamSize') }}</strong>
          <span class="text-muted">{{ $t('home.teamSizeDesc') }}</span>
        </div>
        <div class="mc-panel">
          <span class="mc-label">{{ $t('home.finalStockholm') }}</span>
          <span class="ssm-hero__fact">{{ $t('home.finalDate') }}</span>
        </div>
      </div>

      <a class="btn btn-primary btn-lg" href="https://ctf.sakerhetssm.se/">{{ $t('home.toPlatform') }}</a>
    </section>

    <div class="row g-4">
      <div class="col-12 col-lg-6">
        <div class="mc-panel">
          <h2 class="text-primary">{{ $t('home.whatIs') }}</h2>
          <p>
            {{ $t('home.whatIsText') }}
          </p>
          <p>
            <span class="material-symbols-outlined">azm</span>
            {{ $t('home.bestTeams') }}
            <a href="https://snht.se/">{{ $t('home.nationalSelection') }}</a> &
            <a href="https://ico-official.net/">{{ $t('home.ico') }}</a>
          </p>
          <p>
            {{ $t('home.joinPrompt') }}
            <a :href="discordUrl">{{ $t('home.discordServer') }}</a>
            {{ $t('home.joinPromptMid') }}
            <a href="https://mail.sakerhetssm.se/subscription/form">{{ $t('home.mailingList') }}</a>
            {{ $t('home.mailingListEnd') }}
          </p>

          <form method="post" action="https://mail.sakerhetssm.se/subscription/form" class="listmonk-form">
            <input type="hidden" name="nonce" class="form-control" />
            <input id="f6b65" type="hidden" name="l" checked :value="mailFormId" />

            <div class="input-group">
              <input class="form-control" type="email" name="email" required placeholder="E-mail" />
              <button class="btn btn-outline-primary" type="submit">{{ $t('home.subscribe') }}</button>
            </div>
          </form>

          <a class="btn mt-3 ssm-discord" :href="discordUrl">{{ $t('home.joinDiscord') }}</a>
        </div>
      </div>

      <div class="col-12 col-lg-6" v-if="monthly.status.value == 'success'">
        <h2 class="text-primary">{{ $t('home.monthlyChallenge') }} - {{ monthly.data.value.display_month }}</h2>
        <MonthlyChallenge :chall="monthly.data.value.challenge" />
      </div>
      <div v-else-if="scoreboard.nonUniScores" class="col-12 col-lg-6">
        <div class="mc-panel">
          <h2 class="text-primary">{{ $t('home.scoreboard') }}</h2>
          <table class="table">
            <thead>
              <tr>
                <th>{{ $t('common.rank') }}</th>
                <th>{{ $t('common.name') }}</th>
                <th>{{ $t('common.score') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(score, i) in scoreboard.nonUniScores.slice(0, 10)" :class="`rank-${i + 1}`">
                <td>{{ i + 1 }}</td>
                <td>{{ score.school_name }}</td>
                <td>{{ score.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="col-12">
        <div class="mc-panel text-center">
          <h3>{{ $t('home.inCollabWith') }}</h3>
          <a href="https://www.fra.se/" class="d-inline-block my-4">
            <img class="img-fluid ssm-partner" src="~/assets/fra.png" alt="FRA - Försvarets Radioanstalt" />
          </a>
          <p class="mb-0">
            {{ $t('home.infraSponsored') }}
            <a href="https://glesys.com/">GleSYS</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChallengeStore } from "../store/challenges";
import { useScoreboardStore } from "../store/scoreboard";
import { useAuthStore } from "../store/auth";

const http = useHttp();
const scoreboard = useScoreboardStore();
const challs = useChallengeStore();
const auth = useAuthStore();

const discordUrl = "https://discord.gg/edKFKKU";
const mailFormId = "f6b65d3d-5ba1-4da9-8c42-4e3be8b6277f";

import { useI18n } from "vue-i18n";

const { t } = useI18n();
const url = useRequestURL();
useHead({
  title: computed(() => t("home.title")),
  link: {
    rel: "canonical",
    href: `${url.protocol}//${url.host}/`,
  },
});

const monthly = await useAsyncData("monthly", () =>
  http("/current_monthly_challenge"),
);
if (monthly.error.value) {
  await useAsyncData("scoreboard", scoreboard.getSchoolScoreboards);
}

watch(
  () => auth.user,
  () => {
    if (auth.user.id) {
      monthly.refresh();
    }
  },
);

onMounted(() => {
  challs.getChallenges();
  monthly.refresh();
});
</script>

<style scoped>
.ssm-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  text-align: center;
}

.ssm-hero__logo {
  position: relative;
  width: min(664px, 100%);
  margin-top: 1rem;
}

.ssm-hero__particles {
  position: absolute;
  inset: -12% -8%;
  pointer-events: none;
}

/* Where the poster puts it: under the S's, ending before the M. */
.ssm-hero__subtitle {
  position: absolute;
  left: 4.42%;
  top: 73.25%;
  width: 50%;
}

.ssm-hero__splash {
  position: absolute;
  top: 6%;
  right: -6%;
}

.ssm-hero__tagline {
  margin: 1.5rem 0 0;
  padding: 0.5rem 1.25rem;
  font-size: 1.6875rem;
}

.ssm-hero__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  width: 100%;
  text-align: left;
}

.ssm-hero__fact {
  display: block;
  font-size: 1.6875rem;
  line-height: 1.3;
}

.ssm-discord {
  background-color: #5865f2;
  color: #fff;
}

.ssm-partner {
  max-width: min(22rem, 100%);
}

@media (max-width: 991.98px) {
  .ssm-hero__facts {
    grid-template-columns: 1fr;
  }

  .ssm-hero__splash {
    right: -2%;
  }
}
</style>
