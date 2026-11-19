<script setup>
// Adapted from shadcn-vue's new-york registry (MIT); uses the project's Lucide package.
import { Check } from '@lucide/vue'
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'
import { cn } from '@/lib/utils'
const props = defineProps({
  modelValue: { type: [Boolean, String], default: false },
  disabled: { type: Boolean, default: false },
  class: { type: [String, Object, Array], default: '' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <CheckboxRoot
    :model-value="modelValue"
    :disabled="disabled"
    :class="cn('grid place-content-center h-4 w-4 shrink-0 rounded-sm border border-primary shadow disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground', props.class)"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <CheckboxIndicator class="grid place-content-center text-current">
      <slot><Check :size="12" /></slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
