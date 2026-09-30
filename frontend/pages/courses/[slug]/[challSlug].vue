<template>
    <div class="container" v-if="chall">
        <h1>{{ chall.title }}</h1>
        <div v-html="renderMarkdown(chall.description)"></div>
        <div v-if="chall.files.length || chall.services.length" class="py-5">
            <h4>Resurser</h4>
            <div v-for="file in chall.files">
                <FileDownload :file="file" />
            </div>


            <div class="d-flex" v-for="service in chall.services">
                <span class="material-symbols-outlined pe-2">router</span>
                <a class="text-break" v-if="service.hyperlink" :href="service.user_display">{{ service.user_display }}</a>
                <span v-else class="text-break">{{ service.user_display }}</span>
            </div>

        </div>

        <div>
            <FlagInput :solved="chall.solved" v-model="flag" @keypress.enter="submitFlag" />
        </div>
        <div class="d-flex justify-content-between pt-5">
            <span>
                <button class="btn btn-primary" v-if="prevChall"
                    @click="router.push(`/courses/${courseMeta.slug}/${prevChall.slug}`)">Föregående moment</button>
            </span>
            <span>
                <button class="btn btn-primary" v-if="nextChall"
                    @click="router.push(`/courses/${courseMeta.slug}/${nextChall.slug}`)">Nästa moment</button>
                <button class="btn btn-primary" :disabled="!chall.solved" v-else>Avsluta kurs</button>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChallengeStore } from '~/store/challenges';
import renderMarkdown from '~/utils/markdown'

const store = useChallengeStore()
const route = useRoute()
const router = useRouter()
const http = useHttp()

const flag = ref("")

await useAsyncData('courses', store.getCourses)
const courseMeta = computed(() => store.courses.find(c => c.slug == route.params.slug))


const challs = computed(() => store.courseChalls[courseMeta.value.id])
const idx = computed(() => challs.value?.findIndex(c => c.slug == route.params.challSlug))
const chall = computed(() => challs.value[idx.value])
const nextChall = computed(() => challs.value[idx.value + 1])
const prevChall = computed(() => challs.value[idx.value - 1])

onMounted(async () => {
    store.getCourseChalls(courseMeta.value.id)
})

async function submitFlag() {
    try {
        await http(`/challenges/${chall.value.id}/attempt`, {
            method: 'POST',
            body: {
                flag: flag.value.trim()
            }
        })

        store.getCourseChalls(courseMeta.value.id)

    } catch (error) {

    }
}

</script>
