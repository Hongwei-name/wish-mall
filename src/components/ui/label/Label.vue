<script setup>
// Adapted from shadcn-vue's new-york registry (MIT).
import { Label } from 'reka-ui'
import { cn } from '@/lib/utils'
const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
})
</script>

<template>
  <Label :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', props.class)">
    <slot />
  </Label>
</template>
