<template>
  <RouterView />
</template>

<style>
:root {
  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  /* Neutral warm surfaces pair with the requested Tailwind sky-300 brand.
     Deep blue text on sky-300 keeps small labels legible; white is reserved for
     the darker sky-700 interaction state. */
  --page: #e0f2fe;
  --surface: #fffefa;
  --surface-raised: #ece9e2;
  --input: #fffefa;
  --text: #26342d;
  --muted: #64736a;
  --border: #e2e5dc;
  --border-strong: #c8d1c5;
  --shadow: rgb(38 52 45 / 10%);
  --brand: #7dd3fc;
  --brand-strong: #0369a1;
  --brand-ink: #075985;
  --brand-soft: #e0f2fe;
  --on-brand: #0c4a6e;
  --glass: rgb(255 254 250 / 76%);
  --glass-border: rgb(255 254 250 / 88%);
  --accent-amber: #d1a768;
  --accent-amber-soft: #f3ead8;
  --danger: #a9484c;
  --danger-soft: #f8e9e6;
  --success: #39745a;
  --success-soft: #e3eee4;
  --warning: #91651f;
  --warning-soft: #f5eddc;
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
  background: var(--slate-300);
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
