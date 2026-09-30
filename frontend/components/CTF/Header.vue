<template>
  <nav class="navbar navbar-expand-md bg-dark ssm-navbar">
    <div class="container-fluid">
      <nuxt-link :to="'/ctf/' + slug" class="navbar-brand">{{
        ctfStore.ctf.name
      }}</nuxt-link>
      <button
        class="navbar-toggler color-primary"
        type="button"
        @click="toggleCollapse = !toggleCollapse"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        class="collapse navbar-collapse"
        :class="{ show: toggleCollapse }"
        id="navbarSupportedContent"
      >
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <nuxt-link
              active-class="active"
              class="nav-link"
              :to="'/ctf/' + slug + '/challenges'"
            >
              Utmaningar
            </nuxt-link>
          </li>
          <li class="nav-item">
            <nuxt-link
              active-class="active"
              class="nav-link"
              :to="'/ctf/' + slug + '/scoreboard'"
            >
              Poängtavla
            </nuxt-link>
          </li>
        </ul>
        <client-only>
          <ul v-if="auth.ctfUser.id" class="navbar-nav">
            <li class="nav-item">
              <nuxt-link
                v-if="!!auth.ctfUser.id"
                active-class="active"
                class="nav-link btn border border-primary"
                :to="'/ctf/' + slug"
              >
                <span v-if="auth.ctfUser.teamname">
                  {{ auth.ctfUser.teamname }} -
                  {{ auth.ctfUser.username }}
                  <span class="material-symbols-outlined">person</span>
                </span>
                <span v-else>
                  {{ auth.ctfUser.username }}
                  <span class="material-symbols-outlined">person</span>
                </span>
              </nuxt-link>
            </li>
          </ul>
          <div class="d-inline" v-if="!auth.ctfUser.id">
            <button
              class="btn btn-primary"
              @click="$router.push('/ctf/' + slug)"
            >
              Logga in
            </button>
          </div>
        </client-only>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/store/auth";
import { useCTFStore } from "~/store/ctf";

const auth = useAuthStore();
const route = useRoute();
const ctfStore = useCTFStore();
const slug = route.params.slug as string;
const toggleCollapse = ref(false);
</script>

<style scoped>
.hover-drop-down.input-group-btn ul.dropdown-menu {
  margin-top: 0px;
}
.hover-drop-down.btn-group ul.dropdown-menu {
  margin-top: 2px;
}
.hover-drop-down:hover ul.dropdown-menu {
  display: block;
}
.active-drop-down-el {
  color: var(--bs-navbar-active-color) !important;
}
.padding-fix {
  padding-top: 10px;
}
</style>
