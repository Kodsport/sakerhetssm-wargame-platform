<template>
    <div class="container">
        <div v-if="auth.user.id">
            <h1>{{ auth.user.full_name }}</h1>

            <div class="row">
                <div class="col">
                    <h3>{{ $t('user.name') }}</h3>
                    <p>{{ $t('user.nameHint') }}</p>
                    <form @submit.prevent="updateUsername">

                        <div class="form-group">
                            <input class="form-control" type="text" v-model="newUsername">
                            <button class="btn btn-primary mt-2">{{ $t('common.update') }}</button>
                        </div>
                    </form>
                </div>
                <div class="col">
                    <h3>{{ $t('user.school') }}</h3>
                    <div v-if="auth.user.school_name">
                        {{ $t('user.represents') }} <b class="pe-3"> {{ auth.user.school_name }}</b>
                        <button class="btn btn-danger" @click="leaveSchool">{{ $t('common.leave') }}</button>
                    </div>
                    <div v-else>
                        {{ $t('user.studyPrompt') }}
                        <input class="form-control" type="text" v-model="schoolQuery" @input="searchSchools"
                            :placeholder="$t('common.searchSchool')">
                        <ul>
                            <li v-for="school in schools" :key="school.id">{{ school.name }} <span
                                    v-if="!school.is_university">({{ school.municipality_name
                                    }})</span>
                                <button class="btn btn-primary btn-xs mt-1 ms-2"
                                    @click="joinSchool(school.id)">{{ $t('common.represent') }}</button>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChallengeStore } from '../store/challenges'
import { useAuthStore } from '../store/auth'

const http = useHttp()
const challs = useChallengeStore()
const auth = useAuthStore()

onMounted(() => {
    challs.getChallenges()
})

var schoolQuery = ref("")
var schools = ref([])
const newUsername = ref(auth.user.full_name)

async function leaveSchool() {
    await http('/user/leave_school', {
        method: 'POST'
    })
    auth.getUser()
}

async function joinSchool(id) {
    await http('/user/join_school', {
        method: 'POST',
        body: {
            school_id: id
        }
    })
    auth.getUser()
}

async function searchSchools() {
    if (schoolQuery.value == "") {
        schools.value = []
        return
    }
    const resp = await http('/user/schools?q=' + encodeURIComponent(schoolQuery.value))
    schools.value = resp
}

async function updateUsername() {
    await http('/user/self', {
        method: 'POST',
        body: {
            full_name: newUsername.value
        }
    })
    auth.getUser()
}

</script>