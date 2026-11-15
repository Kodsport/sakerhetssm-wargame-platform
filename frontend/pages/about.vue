<template>
  <div class="d-flex flex-column align-items-center px-2 mw-50">
    <h2 class="text-primary">{{ $t('about.projectLeadership') }}</h2>
    <div class="d-flex flex-column flex-md-row ssm-row">
      <div
        v-for="person in people"
        class="d-flex flex-column mc-panel m-2"
        style="max-width: 22.5rem"
      >
        <img class="mw-100 rounded" :src="person.url" alt="" />
        <h5 class="pt-3">{{ person.name }}</h5>
        <i>{{ person.role }}</i>
        <a :href="`mailto:${person.mail}`">{{ person.mail }}</a>
      </div>
    </div>

    <div class="d-flex flex-column flex-md-row align-items-center ssm-row">
      <img class="ks-logo" src="~/assets/kodsport.png" alt="Kodsport Logga" />
      <div class="mc-panel m-2">
        <h1 class="text-primary">{{ $t('about.association') }}</h1>
        <p>
          <a href="https://www.kodsport.se/">Kodsport</a> {{ $t('about.associationText') }}
        </p>
        <h3 class="text-primary">{{ $t('about.contact') }}</h3>
        <p>
          {{ $t('about.contactText') }}
          <a href="mailto:sakerhetssm@kodsport.se">sakerhetssm@kodsport.se</a>
        </p>
        <h3 class="text-primary">{{ $t('about.support') }}</h3>
        <p>
          {{ $t('about.supportText') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const people = computed(() => [
  {
    name: "Teo",
    role: t('about.roles.projectLead'),
    url: "/placeholder.png",
    mail: "teo@kodsport.se",
  },
  {
    name: "Allan Al-Salihi",
    role: t('about.roles.competitionLead'),
    url: "/allan.png",
    mail: "allan.alsalihi@kodsport.se",
  },
  {
    name: "Elmer Brännström",
    role: t('about.roles.eventLead'),
    url: "/elmer.png",
    mail: "elmer.brannstrom@kodsport.se",
  },
]);

const url = useRequestURL();
useHead({
  title: computed(() => t('about.title')),
  link: [
    {
      rel: "canonical",
      href: `${url.protocol}//${url.host}/about`,
    },
  ],
});
</script>

<style scoped>
.ks-logo {
  max-width: 100%;
}

/* Bootstrap's md breakpoint */
@media (min-width: 768px) {
  .ssm-row {
    max-width: 75rem;
  }

  .ks-logo {
    max-width: 50%;
  }
}
</style>
