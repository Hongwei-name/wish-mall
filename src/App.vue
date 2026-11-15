<template>
  <RouterView />
</template>

<style>
:root {
  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  /* Contrast on white: text 13.2:1, muted 5.3:1, brand 4.23:1.
     #4176e6 is the requested brand, used for large/bold CTA and accents.
     Brand ink #2857b5 (6.7:1) is used for small links; white CTA text
     uses a 19px bold weight. Status colors on white exceed 4.5:1.
     Frosted surfaces layer over pale blue; solid inputs preserve contrast. */
  --page: #f0f5fc;
  --surface: #ffffff;
  --surface-raised: #edf3fc;
  --input: #f9fbff;
  --text: #20304b;
  --muted: #5c6c84;
  --border: #dae4f2;
  --border-strong: #bdcce2;
  --shadow: rgb(39 75 136 / 10%);
  --brand: #4176e6;
  --brand-strong: #2857b5;
  --brand-ink: #2857b5;
  --brand-soft: #eaf1ff;
  --on-brand: #ffffff;
  --glass: rgb(255 255 255 / 72%);
  --glass-border: rgb(255 255 255 / 85%);
  --danger: #ac354e;
  --danger-soft: #fff0f3;
  --success: #326653;
  --success-soft: #edf7f1;
  --warning: #886017;
  --warning-soft: #fff7e6;
  --radius: 24px;
}
* {
  box-sizing: border-box;
}
html {
  scroll-behavior: smooth;
}
body {
  min-width: 320px;
  margin: 0;
  background: var(--page);
  color: var(--text);
  line-height: 1.6;
}
button,
input,
select,
textarea {
  font: inherit;
}
button,
a {
  -webkit-tap-highlight-color: transparent;
}
button {
  cursor: pointer;
}
button:disabled {
  cursor: not-allowed;
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid var(--brand-ink);
  outline-offset: 4px;
}
::selection {
  background: #cbdcff;
  color: var(--text);
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
