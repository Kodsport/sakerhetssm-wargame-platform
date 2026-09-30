<template>
    <div class="container">
        <div class="mc-panel">
            <h1 class="text-primary">Knäck Koden</h1>
            <p>
                Knäck koden är en återkommande tävling i cybersäkerhet för grundskolan. Eleverna arbetar tillsammans i klassrummet för att träna digital hygien, problemlösning och digital handlingskompetens genom att arbeta med uppdrag och lösa utmaningar. Allt anpassat efter Lgr-22. Varje år har tävlingen ett nytt tema som kopplar cybersäkerhet till aktuella samhällsfrågor.
                Vill du ha Knäck Koden-lektioner i din skola? Spana in <a
                    href="https://kodcentrum.se/knack-koden">informationen hos Kodcentrum!</a>
            </p>
            <h1 class="text-primary">Föreläsningar för gymnasiet!</h1>
            <p>
                Vi kommer gärna och föreläser för era studenter! Vi förklarar hur man hackar och hur man kommer in i svenska hackinglandslaget! Kontakta sakerhetssm@kodsport.se för att boka! 
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChallengeStore } from '../store/challenges'
import { useAuthStore } from '../store/auth'

const password = ref("")

useHead({
    title: 'SSM - Knäck Koden'
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
