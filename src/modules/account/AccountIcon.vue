<script setup>
defineProps({ name: { type: String, default: 'grid' } })
const paths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  bag: 'M5 7h14l1 14H4L5 7Z M8 8V6a4 4 0 0 1 8 0v2',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  shield: 'm12 3 8 4v5c0 5-4 8-8 10-4-2-8-5-8-10V7l8-4Z M8 12l3 3 5-6',
  pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  bell: 'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Z M10 21h4',
  help: 'M4 13v-2a8 8 0 0 1 16 0v2 M4 12H3v7h4v-7H4Z M20 12h1v7h-4v-7h3Z M17 20l-3 1h-2',
  arrow: 'M5 12h14 M14 7l5 5-5 5',
  logout: 'M9 4H4v16h5 M10 12h11 M17 8l4 4-4 4',
  truck: 'M3 5h11v12H3V5Z M14 9h4l3 4v4h-7 M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0 M20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  box: 'm3 7 9-4 9 4-9 4-9-4Z M3 7v10l9 4 9-4V7 M12 11v10 M7 5l9 4',
  star: 'm12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1 3-6Z',
  return: 'M4 7h11a6 6 0 0 1 0 12H9 M8 3 4 7l4 4',
  wallet: 'M3 6h16v14H3V6Z M3 6l13-3v3 M15 11h6v5h-6v-5Z',
  close: 'm6 6 12 12 M6 18 18 6',
  sparkle: 'm12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z',
}
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.grid" /></svg>
</template>
