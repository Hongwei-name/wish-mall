<template>
  <RouterView />
</template>

<style>
:root {
  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  --thistle: #cdb4db;
  --pastel-petal: #ffc8dd;
  --baby-pink: #ffafcc;
  --icy-blue: #bde0fe;
  --sky-blue: #a2d2ff;
  /* Pastel brand shades are decorative surfaces, never low-contrast text.
     Text #30283e on white: 14.0:1; muted #746b80 on white: 5.1:1.
     Action #69518a on white: 6.8:1; white on action: 6.8:1.
     Danger #ac354e on white: 6.2:1; success #326653: 6.6:1.
     Blue and pink support the purple brand on non-semantic accents only. */
  --page: #f7f6fa;
  --surface: #ffffff;
  --surface-raised: #f1edf7;
  --input: #fcfbfe;
  --text: #30283e;
  --muted: #746b80;
  --border: #e9e4ef;
  --border-strong: #d6cede;
  --shadow: rgb(61 40 87 / 8%);
  --brand: #69518a;
  --brand-strong: #50376f;
  --brand-soft: #f0e9f7;
  --on-brand: #ffffff;
  --danger: #ac354e;
  --danger-soft: #fff0f3;
  --success: #326653;
  --success-soft: #edf7f1;
  --warning: #886017;
  --warning-soft: #fff7e6;
  --radius: 20px;
}
* { box-sizing: border-box; }
body { min-width: 320px; margin: 0; background: var(--page); color: var(--text); line-height: 1.6; }
button, input, select, textarea { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; }
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible { outline: 3px solid var(--brand); outline-offset: 4px; }
::selection { background: var(--thistle); color: var(--text); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
</style>
