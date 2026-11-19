<script setup>
// Adapted from shadcn-vue's new-york registry (MIT).
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps({
  defaultValue: { type: [String, Number], default: undefined },
  modelValue: { type: [String, Number], default: undefined },
  modelModifiers: { type: Object, default: () => ({}) },
  class: { type: [String, Object, Array], default: '' },
})
const emit = defineEmits(['update:modelValue'])
const modelValue = useVModel(props, 'modelValue', (event, value) => {
  emit(event, props.modelModifiers.trim && typeof value === 'string' ? value.trim() : value)
}, { passive: true, defaultValue: props.defaultValue })
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="cn('file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', props.class)"
  />
</template>
