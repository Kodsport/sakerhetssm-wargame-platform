<template>
  <div class="container">
    <h1>{{ ctfStore?.ctf.name || "CTF" }}</h1>
    <p>{{ ctfStore?.ctf.description || "" }}</p>
    <div class="gradient-border mb-4 mt-4"></div>
    <client-only>
      <section v-if="!auth.ctfUser.id">
        <h2>{{ $t('ctf.register') }}</h2>
        <p>{{ $t('ctf.registerHint') }}</p>
        <form @submit.prevent="register">
          <input
            class="form-control"
            v-model="username"
            :placeholder="$t('ctf.namePlaceholder')"
            required
          />
          <input
            v-if="ctfStore.ctf.team_based"
            class="form-control mt-2"
            v-model="teamCode"
            :placeholder="$t('ctf.teamCode')"
          />
          <button class="btn btn-primary mt-2" type="submit">
            {{ $t('ctf.register') }}
          </button>
        </form>
        <p v-if="registrationError" class="text-danger mt-2">
          {{ registrationError }}
        </p>
        <h2 class="mt-4">{{ $t('ctf.loginHeading') }}</h2>
        <p>{{ $t('ctf.usePassword') }}</p>
        <form @submit.prevent="login">
          <input
            class="form-control"
            v-model="password"
            placeholder="correct-horse-battery-staple"
            required
          />
          <button class="btn btn-primary mt-2" type="submit">{{ $t('ctf.login') }}</button>
        </form>
        <p v-if="loginError" class="text-danger mt-2">{{ loginError }}</p>
      </section>
      <section v-if="auth.ctfUser.id">
        <p class="mb-2">
          {{ $t('ctf.registeredAs') }} {{ auth.ctfUser.username || ""
          }}<span v-if="ctfStore.ctf.team_based && auth.ctfUser.teamname">
            {{ $t('ctf.inTeam') }} {{ auth.ctfUser.teamname }} </span
          >{{ $t('ctf.passwordIs') }}
          <span id="passwordHover" class="hover" @click="copyPassword">{{
            auth.ctfUser.password || ""
          }}</span
          >{{ $t('ctf.copyHint') }}
        </p>
        <button
          class="btn btn-primary me-2"
          @click="router.push(`/ctf/${slug}/challenges`)"
        >
          {{ $t('ctf.goToChallenges') }}
        </button>
        <button class="btn btn-danger" @click="logout">{{ $t('nav.logout') }}</button>
      </section>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCTFStore } from "../../../store/ctf";
import { useAuthStore } from "../../../store/auth";
import useHttp from "@/composables/use-http";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

definePageMeta({
  layout: "ctf",
  middleware: "ctf",
});

const route = useRoute();
const router = useRouter();
const slug = route.params.slug as string;
const username = ref("");
const password = ref("");
const teamCode = ref("");
const ctfStore = useCTFStore();
const auth = useAuthStore();

const registrationError = ref("");
const loginError = ref("");

async function register() {
  registrationError.value = "";
  loginError.value = "";
  try {
    await auth.registerCTFUser(
      slug,
      username.value,
      teamCode.value || undefined
    );
  } catch (e: any) {
    if (e.response) {
      registrationError.value = e.response._data.message;
    } else {
      registrationError.value = t("ctf.somethingWrong");
    }
  }
}

async function logout() {
  registrationError.value = "";
  loginError.value = "";
  auth.logoutCTFUser();
  await ctfStore.getChallenges(slug);
}

async function login() {
  registrationError.value = "";
  loginError.value = "";
  try {
    await auth.loginCTFUser(slug, password.value);
    await ctfStore.getChallenges(slug, password.value);
  } catch (e: any) {
    if (e.response) {
      loginError.value = e.response._data.message;
    } else {
      loginError.value = t("ctf.somethingWrong");
    }
  }
}

function copyPassword() {
  navigator.clipboard.writeText(auth.ctfUser.password || "");
  let passwordHover = document.getElementById("passwordHover");
  if (passwordHover) {
    passwordHover.style.width = passwordHover.scrollWidth + "px";
    passwordHover.innerText = "Kopierad!";
    setTimeout(() => {
      passwordHover.style.width = "auto";
      passwordHover.innerText = auth.ctfUser.password || "";
    }, 1000);
  }
}
</script>
<style scoped>
.hover {
  text-align: center;
  display: inline-block;
  padding: 0 10px;
  color: #00000000;
  background: #00000091;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.hover:hover {
  color: white;
  background: #0000003b;
  transition: all 0.2s ease-in-out;
}

.gradient-border {
  border-bottom: 3px solid;
  border-image: linear-gradient(to right, var(--bs-primary), #ffc869) 1;
}

.form-control {
  background: #00000000 !important;
}
</style>
