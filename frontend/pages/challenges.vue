<template>
    <h1 class="text-primary">Utmaningar</h1>
    <p>
        Här kan du öva på utmaningar från tidigare års upplagor av Säkerhets-SM.
    </p>

    <div class="d-flex flex-column flex-lg-row pt-4">
        <div class="ssm-filter mc-panel align-self-lg-start mb-4 me-lg-4">
            <h3>Filtrera</h3>
            <div class="form-group">
                <label>Kategori</label>
                <select class="form-control pointer" v-model="challFilter.categoryFilter">
                    <option value="">alla</option>
                    <option class="text-lowercase" v-for="catx in categories" :value="catx">
                        {{ catx }}
                    </option>
                </select>
            </div>
            <div v-if="challs.events.length" class="form-group pt-3">
                <label>Tävling</label>

                <div class="form-check" v-for="event in challs.events">
                    <input type="checkbox" class="form-check-input pointer" v-model="challFilter.eventFilter[event.id]">
                    <label class="form-check-label pointer"
                        @click="challFilter.eventFilter[event.id] = !challFilter.eventFilter[event.id]">
                        {{ event.name }}
                    </label>
                </div>
            </div>
        </div>

        <div class="flex-grow-1 d-flex flex-column">
            <template v-for="category in categories">
                <div
                    v-if="(challFilter.categoryFilter == '' || category == challFilter.categoryFilter) && challenges.filter(c => c.category == category).length">
                    <div class="text-primary border-primary border-bottom border-3 pt-2 pb-2">
                        <h4 class="text-lowercase">{{ category }}</h4>
                    </div>

                    <div class="ssm-grid pt-3 pb-2">
                        <div v-for="chall in challenges.filter(c => c.category == category).sort((a, b) => a.score - b.score)">
                            <ChallengePreview class="pointer" @click="nav(chall.slug)" :chall="chall" />
                            <!-- for seo -->
                            <a class="d-none" :href="`/challenges/${chall.slug}`">{{ chall.title }}</a>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
    <NuxtPage />
</template>

<script setup lang="ts">
import { useChallengeStore } from '../store/challenges'
import { storeToRefs } from "pinia";

useHead({
    title: 'SSM - Utmaningar'
})

useServerSeoMeta({
    title: 'SSM - Utmaningar'
})

const challs = useChallengeStore()
const router = useRouter()

const { challFilter } = storeToRefs(useChallengeStore())

await useAsyncData('challenges', challs.getChallenges)
await useAsyncData('events', challs.getEvents)

onMounted(() => {
    challs.getChallenges()
})

const categories = computed(() => challs.challenges.map(c => c.category).filter((v, i, a) => a.indexOf(v) == i))

const challenges = computed(() => {
    const allowedEvents: string[] = [];
    for (const [key, value] of Object.entries(challFilter.value.eventFilter)) {
        if (!value) continue
        allowedEvents.push(key)
    }
    var res = challs.challenges.filter(c => c.chall_namespace == null)
    if (allowedEvents.length != 0) {
        res = res.filter(v => allowedEvents.includes(v.ctf_event_id))
    }
    if (challFilter.value.categoryFilter != "") {
        res = res.filter(v => v.category == challFilter.value.categoryFilter)
    }

    return res
})

function nav(slug: string) {
    router.push(`/challenges/${slug}`)
}
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