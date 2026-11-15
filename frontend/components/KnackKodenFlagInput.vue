<template>
    <div class="form-group flag-input">
        <template v-if="props.solved">
            <InputReplacer :text="$t('common.solved')" />
        </template>
        <template v-else>
            <input v-if="!!auth.knackKodenPassword" type="text" class="form-control" placeholder="SSM{..."
                :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">
            <InputReplacer :text="$t('flag.loginWithClassCode')" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

const auth = useAuthStore()
const props = defineProps(['modelValue', 'solved'])
defineEmits(['update:modelValue'])
</script>
