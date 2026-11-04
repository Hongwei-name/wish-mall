<template>
  <RouterView />
</template>

<style>
:root {
  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  /* Brand palette: lilac, petal, pink, ice and sky blue. */
  --thistle: #cdb4db;
  --pastel-petal: #ffc8dd;
  --baby-pink: #ffafcc;
  --icy-blue: #bde0fe;
  --sky-blue: #a2d2ff;

  /*
   * Semantic roles intentionally use accessible neutrals alongside the brand
   * palette. Text #26313f on --page is 12.4:1; muted #586779 is 5.3:1;
   * white on --brand is 4.8:1. Pastels remain decorative/supporting colors.
   */
  --page: #f6f9fc;
  --surface: #ffffff;
  --surface-raised: #f0f6fc;
  --input: #f8fbff;
  --text: #26313f;
  --muted: #586779;
  --border: #d6e0eb;
  --border-strong: #afc0d1;
  --shadow: rgb(38 49 63 / 16%);
  --brand: #467da9;
  --brand-strong: #315f86;
  --brand-soft: #e5f2fc;
  --on-brand: #ffffff;
  --danger: #b14363;
  --success: #24725d;
  --blushed-brick: var(--danger);
  --hunter-green: var(--success);
}

* {
  box-sizing: border-box;
}
body {
  min-width: 320px;
  margin: 0;
  background: var(--page);
}
button,
input {
  font: inherit;
}
button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
</style>
