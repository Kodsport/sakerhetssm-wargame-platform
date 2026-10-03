import { defineStore } from 'pinia'
import useHttp from '../composables/use-http'
const http = useHttp()

export const useChallengeStore = defineStore('challenges', {
    state: () => ({
        challenges: [],
        monthlies: [],
        events: [],
        authors: [],
        challFilter: {
            eventFilter: {},
            categoryFilter: ''
        },
        courses: [],
        courseChalls: {}
    }),
    actions: {
        async getChallenges() {
            const challs = await http('/challenges')
            this.challenges = challs
        },
        async getMonthlies() {
            const challs = await http('/monthly_challenges')
            this.monthlies = challs
        },
        async getEvents() {
            const cats = await http('/events')
            this.events = cats.sort((a, b) => a.name < b.name)
        },
        async getAuthors() {
            const authors = await http('/authors')
            this.authors = authors
        },
        async getCourses() {
            const courses = await http('/courses')
            this.courses = courses
        },
        async getCourseChalls(id: string) {

            const ids = this.courses.find(c => c.id == id).course_items.sort((a, b) => a.position > b.position).map(c => c.challenge_id)

            let q = ids.join('&ids=')
            const x = await http(`/challenges?ids=${q}`)

            this.courseChalls[id] = ids.map(id => x.find(c => c.id == id))
        }
    },
    getters: {
        getBySlug(state) {
            return (slug: string) => state.challenges.find(c => c.slug == slug)
        },
        getCurrentMonthly: (state) => {
            const now = new Date().valueOf() / 1000;
            return state.monthlies.find(m => m.start_date < now && m.end_date > now)
        }
    }
})