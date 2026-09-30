<template>
  <div class="modal-backdrop fade show"></div>
  <div class="modal modal-xl d-block" tabindex="-1" @click="goBack" ref="modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="pt-3 d-flex justify-content-center">
          <h2 class="modal-title text-primary fw-bold">
            {{ props.chall.title }}
          </h2>
        </div>
        <div class="d-flex justify-content-center">
          <div class="badge bg-primary me-1">{{ props.chall.category }}</div>
        </div>

        <h5>
          <div class="d-flex justify-content-center pt-3">
            <span class="mx-3 d-flex">
              <span class="me-1">
                {{ props.chall.score }}
              </span>
              <span class="material-symbols-outlined"
                >control_point_duplicate</span
              >
            </span>
            <span class="mx-3 d-flex">
              <span class="me-1">
                {{ props.chall.solves }}
              </span>
              <span class="material-symbols-outlined">flag</span>
            </span>
          </div>
        </h5>
        <div
          class="d-flex justify-content-center"
          v-if="props.chall.numUsersInYourTeamSolved !== undefined"
        >
          <span class="badge bg-secondary mx-1"
            >{{ props.chall.numUsersInYourTeamSolved }} i ditt lag</span
          >
        </div>
        <div
          class="d-flex justify-content-center"
          v-if="
            props.chall.numUsersSolved !== undefined &&
            props.chall.numTeamsSolved !== undefined
          "
        >
          <span class="badge bg-info mx-1"
            >{{ props.chall.numUsersSolved }} användare totalt</span
          >
        </div>

        <div class="modal-body">
          <div class="row">
            <div
              class="col-12 col-lg-6 order-2 order-lg-1 text-break"
              v-html="renderMarkdown(props.chall.description)"
            ></div>
            <div class="col-12 col-lg-6 order-1 order-lg-2 mb-3 mb-lg-0">
              <div v-if="props.chall?.authors?.length">
                <span class="material-symbols-outlined pe-1">group</span>
                <span class="material-symbols-outlined pe-1">edit</span>
                <span>
                  <template v-for="a in props.chall.authors">
                    <nuxt-link
                      v-if="a.publish"
                      class="author"
                      :to="`/author/${a.slug}`"
                    >
                      {{ a.full_name }}
                    </nuxt-link>
                    <span v-else class="author">
                      {{ a.full_name }}
                    </span>
                  </template>
                </span>
              </div>
              <div class="d-flex" v-for="service in props.chall.services">
                <span class="material-symbols-outlined pe-2">router</span>
                <a
                  v-if="service.hyperlink"
                  :href="service.user_display"
                  target="_blank"
                  rel="nofollow"
                  >{{ service.user_display }}</a
                >
                <span v-else>{{ service.user_display }}</span>
              </div>
              <div v-for="file in props.chall.files">
                <FileDownload :file="file" />
              </div>
              <div class="pt-2">
                <div class="mb-2" v-if="chall.num_solves_in_team">
                  <strong
                    >Lösningar inom laget:
                    {{ chall.num_solves_in_team }}</strong
                  >
                  <ol
                    v-if="chall.solvers_in_team && chall.solvers_in_team.length"
                    class="solver-list"
                  >
                    <li
                      v-for="(user, idx) in chall.solvers_in_team"
                      :key="user.id"
                    >
                      <span class="solver-rank">{{ idx + 1 }}.</span>
                      {{ user.full_name }}
                      <span v-if="user.solved_at" class="badge bg-info ms-2">{{
                        timeAgo(user.solved_at)
                      }}</span>
                    </li>
                  </ol>
                </div>
                <div class="mb-2" v-if="chall.num_team_solves">
                  <strong>Lag som löst: {{ chall.num_team_solves }}</strong>
                  <ol
                    v-if="chall.team_solvers && chall.team_solvers.length"
                    class="solver-list"
                  >
                    <li
                      v-for="(team, idx) in chall.team_solvers"
                      :key="team.id"
                    >
                      <span class="solver-rank">{{ idx + 1 }}.</span>
                      {{ team.full_name }}
                      <span v-if="team.solved_at" class="badge bg-info ms-2">{{
                        timeAgo(team.solved_at)
                      }}</span>
                    </li>
                  </ol>
                </div>
                <div class="mb-2" v-if="chall.solves">
                  <strong>Totala lösningar: {{ chall.solves }}</strong>
                  <ol
                    v-if="chall.solvers && chall.solvers.length"
                    class="solver-list"
                  >
                    <li v-for="(user, idx) in chall.solvers" :key="user.id">
                      <span class="solver-rank">{{ idx + 1 }}.</span>
                      {{ user.full_name }}
                      <span v-if="user.solved_at" class="badge bg-info ms-2">{{
                        timeAgo(user.solved_at)
                      }}</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            <!-- <div class="pt-3" v-if="props.chall.solvers">
              <b>Första lösarna</b>
              <ol>
                <li v-for="(solver, idx) in props.chall.solvers">
                  <span class="solver-rank">{{ idx + 1 }}.</span>
                  {{ solver.full_name }}
                  <span class="badge bg-info">{{
                    timeAgo(solver.solved_at)
                  }}</span>
                </li>
              </ol>
            </div>-->
          </div>
        </div>
        <div class="p-3">
          <div>
            <CTFFlagInput
              :class="{ 'is-wrong': warn }"
              v-model="flag"
              @keypress.enter="submitFlag"
              :solved="props.chall.solved"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import renderMarkdown from "~/utils/markdown";
import { useAuthStore } from "~/store/auth";
import { useCTFStore } from "~/store/ctf";
import { useRoute } from "vue-router";
import * as moment from "moment";

const route = useRoute();
const auth = useAuthStore();
const http = useHttp();
const store = useCTFStore();

const props = defineProps(["chall"]);
const emit = defineEmits(["back"]);

const modal = ref(null);

const chall = computed(() => store.getBySlug(route.params.challslug as string));

const flag = ref("");
const warn = ref(false);

const ctfSlug = route.params.slug as string;
async function submitFlag() {
  try {
    await http(`/ctfs/${ctfSlug}/attempt`, {
      method: "POST",
      body: {
        flag: flag.value.trim(),
        challenge_id: chall.value.id,
        password: auth.ctfUser.password,
      },
    });

    store.getChallenges(route.params.slug as string, auth.ctfUser.password);
    store.getScoreboard(route.params.slug as string);
  } catch (error) {
    console.log(error);
    warn.value = true;
    setTimeout(() => {
      warn.value = false;
    }, 1000);
  }
}

function timeAgo(unixTime) {
  return moment.default(new Date(unixTime * 1000)).fromNow();
}

function goBack(event) {
  if (event.target == modal.value) {
    emit("back");
  }
}
</script>

<style scoped>
.author:after {
  content: ",";
  padding-right: 0.5em;
  text-decoration: none;
  display: inline-block;
  color: #ffffff;
  /* todo, use variable */
}

.author:last-child:after {
  content: none;
}

.first-list {
  margin-top: 2px;
  font-size: 0.95em;
  color: #6c757d;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.first-item {
  background: #e9ecef;
  border-radius: 4px;
  padding: 2px 8px;
  margin-right: 2px;
  margin-bottom: 2px;
  font-weight: 500;
}
.first-sep {
  margin-right: 4px;
  color: #adb5bd;
}

.solver-list {
  margin: 0.25em 0 0.5em 0;
  padding-left: 0.2em;
  font-size: 1em;
  color: var(--ctf-text, #fff);
}
.solver-list li {
  margin-bottom: 2px;
  display: flex;
  align-items: center;
}
.solver-rank {
  font-weight: bold;
  margin-right: 0.4em;
  color: var(--ctf-accent, #ffb300);
}
</style>
