<template>
  <header class="d-flex d-md-none px-3 py-4 justify-content-center">
    <nuxt-link to="/" aria-label="Säkerhets-SM, startsidan">
      <PixelText text="Säkerhets-SM" :scale="3" balanced />
    </nuxt-link>
  </header>
  <nav class="navbar navbar-expand-md bg-dark ssm-navbar">
    <div class="container-fluid">
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
        <nuxt-link class="navbar-brand d-none d-md-inline-flex align-items-center" to="/" aria-label="Säkerhets-SM, startsidan">
          <PixelText text="SSM" :scale="2" fit balanced />
        </nuxt-link>
        <ul class="navbar-nav me-auto">
          <li class="nav-item dropdown hover-drop-down">
            <nuxt-link
              to="/challenges"
              class="nav-link dropdown-toggle"
              role="button"
              aria-expanded="false"
              data-toggle="dropdown"
            >
              Problemarkiv
            </nuxt-link>
            <ul class="dropdown-menu">
              <li>
                <nuxt-link
                  to="/challenges"
                  class="text-primary dropdown-item"
                  active-class="active-drop-down-el"
                >
                  Utmaningar
                </nuxt-link>
              </li>
              <li>
                <nuxt-link
                  to="/scoreboard"
                  class="text-primary dropdown-item"
                  active-class="active-drop-down-el"
                >
                  Poängtavla
                </nuxt-link>
              </li>
              <li>
                <nuxt-link
                  to="/monthly"
                  class="text-primary dropdown-item"
                  active-class="active-drop-down-el"
                >
                  Månadens utmaning
                </nuxt-link>
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <nuxt-link active-class="active" class="nav-link" to="/learn">
              Läroresurser
            </nuxt-link>
          </li>
          <li class="nav-item dropdown hover-drop-down">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              aria-expanded="false"
              data-toggle="dropdown"
            >
              Tidigare år
            </a>
            <ul class="dropdown-menu">
              <li>
                <a
                  class="text-primary dropdown-item"
                  href="https://arkiv.sakerhetssm.se/ssm2025"
                  >2025</a
                >
              </li>
              <li>
                <a
                  class="text-primary dropdown-item"
                  href="https://arkiv.sakerhetssm.se/ssm2024"
                  >2024</a
                >
              </li>
              <li>
                <a
                  class="text-primary dropdown-item"
                  href="https://arkiv.sakerhetssm.se/ssm2023"
                  >2023</a
                >
              </li>
              <li>
                <a
                  class="text-primary dropdown-item"
                  href="https://arkiv.sakerhetssm.se/ssm2022"
                  >2022</a
                >
              </li>
              <li>
                <a
                  class="text-primary dropdown-item"
                  href="https://arkiv.sakerhetssm.se/ssm2021"
                  >2021</a
                >
              </li>
              <li>
                <a
                  class="text-primary dropdown-item"
                  href="https://arkiv.sakerhetssm.se/halloween2020/"
                  >Halloween 2020</a
                >
              </li>
              <li>
                <a
                  class="text-primary dropdown-item"
                  href="https://arkiv.sakerhetssm.se/ssm2020"
                  >2020</a
                >
              </li>
              <li>
                <a
                  class="text-primary dropdown-item"
                  href="https://arkiv.sakerhetssm.se/ssm2019"
                  >2019</a
                >
              </li>
              <li>
                <a
                  class="text-primary dropdown-item"
                  href="https://arkiv.sakerhetssm.se/ssm2016"
                  >2016</a
                >
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <nuxt-link active-class="active" class="nav-link" to="/for-teachers">
              För lärare
            </nuxt-link>
          </li>
          <li class="nav-item">
            <nuxt-link active-class="active" class="nav-link" to="/about">
              Om oss
            </nuxt-link>
          </li>
        </ul>
        <client-only>
          <ul v-if="auth.user" class="navbar-nav pe-3">
            <template
              v-if="auth.user.role == 'admin' || auth.user.role == 'org'"
            >
              <li class="nav-item dropdown hover-drop-down pe-2">
                <nuxt-link
                  to="/admin"
                  class="nav-link dropdown-toggle padding-fix"
                  role="button"
                  aria-expanded="false"
                  data-toggle="dropdown"
                >
                  Admin
                </nuxt-link>
                <ul class="dropdown-menu">
                  <li class="nav-item">
                    <nuxt-link
                      active-class="active-drop-down-el"
                      class="text-primary dropdown-item"
                      to="/admin/users"
                      v-if="auth.user.role === 'admin'"
                    >
                      Users
                    </nuxt-link>
                  </li>
                  <li class="nav-item">
                    <nuxt-link
                      active-class="active-drop-down-el"
                      class="text-primary dropdown-item"
                      to="/admin/challenges"
                      v-if="auth.user.role === 'admin'"
                    >
                      Challenges
                    </nuxt-link>
                  </li>
                  <li class="nav-item">
                    <nuxt-link
                      active-class="active-drop-down-el"
                      class="text-primary dropdown-item"
                      to="/admin/monthly"
                      v-if="
                        auth.user.role === 'admin' || auth.user.role === 'org'
                      "
                    >
                      Monthly
                    </nuxt-link>
                  </li>
                  <li class="nav-item">
                    <nuxt-link
                      active-class="active-drop-down-el"
                      class="text-primary dropdown-item"
                      to="/admin/courses"
                      v-if="auth.user.role === 'admin'"
                    >
                      Courses
                    </nuxt-link>
                  </li>
                  <li class="nav-item">
                    <nuxt-link
                      active-class="active-drop-down-el"
                      class="text-primary dropdown-item"
                      to="/admin/events"
                      v-if="auth.user.role === 'admin'"
                    >
                      Events
                    </nuxt-link>
                  </li>
                  <li class="nav-item">
                    <nuxt-link
                      active-class="active-drop-down-el"
                      class="text-primary dropdown-item"
                      to="/admin/authors"
                      v-if="auth.user.role === 'admin'"
                    >
                      Authors
                    </nuxt-link>
                  </li>
                  <li class="nav-item">
                    <nuxt-link
                      active-class="active-drop-down-el"
                      class="text-primary dropdown-item"
                      to="/admin/ctfs"
                      v-if="
                        auth.user.role === 'admin' || auth.user.role === 'org'
                      "
                    >
                      CTFs
                    </nuxt-link>
                  </li>
                </ul>
              </li>
            </template>
            <li class="nav-item">
              <nuxt-link
                v-if="!!auth.user.id"
                active-class="active"
                class="nav-link btn border border-primary"
                to="/user"
              >
                <span>
                  {{ auth.user.full_name }}
                  <span class="material-symbols-outlined">person</span>
                </span>
              </nuxt-link>
            </li>
          </ul>
          <template class="d-inline">
            <button
              v-if="!isAuthenticated"
              class="btn btn-primary"
              @click="login"
            >
              Logga in
            </button>
            <button v-else class="btn btn-primary" @click="logout">
              Logga ut
            </button>
          </template>
          <template #fallback class="d-inline">
            <button class="btn btn-primary">Logga in</button>
          </template>
        </client-only>
      </div>
      <client-only>
        <onboarding-modal v-if="showOnboarding" />
      </client-only>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from "../store/auth";
const http = useHttp();
const auth = useAuthStore();
const router = useRouter();

var isAuthenticated = computed(() => auth.token != "");

var toggleCollapse = ref(false);
var showOnboarding = computed(() => auth.user.id && !auth.user.onboarding_done);

// temporary hacky solution...
setInterval(() => {
  const part = auth.token.split(".")[1];
  if (!part) {
    return;
  }
  const jwtData = JSON.parse(atob(part));
  if (jwtData * 1000 < Date.now()) {
    auth.setToken("");
    localStorage.removeItem("ssm-token");
  }
}, 1000);

onMounted(async () => {
  const jwt = localStorage.getItem("ssm-token");
  if (jwt) {
    await auth.setToken(jwt);
  }

  if (
    process.client &&
    window.location.pathname.startsWith("/admin") &&
    (!(
      auth.user.role == "admin" ||
      auth.user.role == "author" ||
      auth.user.role == "org"
    ) ||
      !auth.user.role)
  ) {
    router.push("/");
  }
});

function logout() {
  auth.setToken("");
  localStorage.removeItem("ssm-token");
  router.push("/");
}

async function login() {
  const x = await http("/auth/discord/url");

  const w = window.open(x.url);

  if (!w) {
    // TODO error handling
    return;
  }
}
if (process.client) {
  window.addEventListener("message", async (event) => {
    if (event.data.type !== "auth") {
      return;
    }

    if (event.origin !== window.origin) {
      return;
    }

    const resp = await http("/auth/discord/exchange", {
      method: "POST",
      body: {
        code: event.data.code,
        state: event.data.state,
      },
    });

    auth.setToken(resp.jwt);
    localStorage.setItem("ssm-token", resp.jwt);
  });
}
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
