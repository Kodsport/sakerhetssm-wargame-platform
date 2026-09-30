<template>
    <input type="text" disabled class="form-control input-replacer" :placeholder="props.text">
</template>

<script setup lang="ts">
const props = defineProps(['text'])
</script>
