<template>
    <span class="material-symbols-outlined pe-2">description</span>
    <a class="text-break" rel="nofollow" :href="props.file.url">{{ decodeURIComponent(props.file.filename) }}</a>
</template>

<script setup lang="ts">
const props = defineProps(['file'])
</script>