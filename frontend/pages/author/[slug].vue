<template>
    <div class="container">
        <div class="row">
            <h1>{{ author.full_name }}</h1>
            <div v-html="renderMarkdown(author.description)"></div>
        </div>
        <h5 class="pt-5">{{ $t('author.challengesBy') }} {{ author.full_name.split(' ')[0] }}</h5>
        <div class="row row-cols-3 row-cols-xl-5 g-4 mt-0 mb-2">
            <div class="col" v-for="chall in authorsChalls">
                <ChallengePreview @click="showChall = chall" :chall="chall" />
            </div>
        </div>
        <ChallengeModal v-if="showChall" :chall="showChall" @back="showChall = null" />
    </div>
</template>

<script setup lang="ts">
import renderMarkdown from '../../utils/markdown';
import { useChallengeStore } from '../../store/challenges'

const route = useRoute()
const http = useHttp()
const challs = useChallengeStore()

var showChall = ref(null)

const authors = await useAsyncData('authors', () => http('/authors'))
const author = computed(() => authors.data.value.find(a => a.slug == route.params.slug))
const authorsChalls = computed(() => challs.challenges.filter(c => c.authors.map(a => a.slug).includes(route.params.slug)))


const title = `SSM - ${author.value.full_name}`

useHead({
    title,
})

useServerSeoMeta({
    ogTitle: title,
    title: title,
    description: author.value.description,
    ogDescription: author.value.description,
})

onMounted(() => {
    challs.getChallenges()
})

</script>