<template>
    <div class="ssm-layout" :class="{ 'ssm-plain': isAdmin }">

        <Header />
        <div class="px-3 py-4">
            <slot />
        </div>
        <!--
            <Footer />
        -->
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>
