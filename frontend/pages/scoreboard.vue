<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 col-md-4 mb-4">
                <div class="mc-panel h-100">
                    <h2>{{ $t('common.people') }}</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ $t('common.rank') }}</th>
                                <th>{{ $t('common.name') }}</th>
                                <th>{{ $t('common.score') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="score, i in scoreboard.userScores.slice(0, 10)" :key="score.user_id" :class="`rank-${i + 1}`">
                                <td>{{ i + 1 }}</td>
                                <td>{{ score.name }}</td>
                                <td>{{ score.score }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-12 col-md-4 mb-4">
                <div class="mc-panel h-100">
                    <h2>{{ $t('common.schools') }}</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ $t('common.rank') }}</th>
                                <th>{{ $t('common.school') }}</th>
                                <th>{{ $t('common.score') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="score, i in scoreboard.nonUniScores.slice(0, 10)" :key="score.school_name" :class="`rank-${i + 1}`">
                                <td>{{ i + 1 }}</td>
                                <td>{{ score.school_name }}</td>
                                <td>{{ score.score }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="col-12 col-md-4 mb-4">
                <div class="mc-panel h-100">
                    <h2>{{ $t('common.university') }}</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ $t('common.rank') }}</th>
                                <th>{{ $t('common.school') }}</th>
                                <th>{{ $t('common.score') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="score, i in scoreboard.uniScores.slice(0, 10)" :key="score.school_name" :class="`rank-${i + 1}`">
                                <td>{{ i + 1 }}</td>
                                <td>{{ score.school_name }}</td>
                                <td>{{ score.score }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useScoreboardStore } from '../store/scoreboard'

import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const scoreboard = useScoreboardStore()

await useAsyncData('userScoreboard', scoreboard.getUserScoreboards)
await useAsyncData('scoreboard', scoreboard.getSchoolScoreboards)

useHead({
    title: computed(() => t('scoreboardPage.title'))
})
</script>

<style scoped>
    td {
        overflow-wrap: anywhere;
    }
</style>
