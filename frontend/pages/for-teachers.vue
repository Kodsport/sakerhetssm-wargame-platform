<template>
    <div class="container">
        <div class="mc-panel">
            <h1 class="text-primary">{{ $t('teachers.forGymnasium') }}</h1>
            <h2 class="text-primary">{{ $t('teachers.sakerhetssm') }}</h2>
            <p>
                {{ $t('teachers.sakerhetssmText') }}
                <a href="https://sakerhetssm.se/">{{ $t('teachers.sakerhetssmLink') }}</a>{{ $t('teachers.sakerhetssmTextEnd') }}
            </p>
            <h2 class="text-primary">{{ $t('teachers.lecturesGym') }}</h2>
            <p>
                {{ $t('teachers.lecturesGymText') }}
            </p>
            <h1 class="text-primary">{{ $t('teachers.forPrimary') }}</h1>
            <h2 class="text-primary">{{ $t('teachers.knackKoden') }}</h2>
            <p>
                {{ $t('teachers.knackKodenText') }}
                <a href="https://kodcentrum.se/knack-koden">{{ $t('teachers.kodcentrumInfo') }}</a>{{ $t('teachers.kodcentrumEnd') }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

useHead({
    title: computed(() => t('teachers.title'))
})

useServerSeoMeta({
    title: 'SSM - Knäck Koden'
})
</script>

<style scoped>
.pointer {
    cursor: pointer;
}

.ssm-grid {
    display: grid;
    /* Magic auto-sizing grid: https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/ */
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 1rem;
}

/* Bootstrap large */
@media (min-width: 992px) {
    .ssm-filter {
        width: 21rem;
    }
}
</style>
