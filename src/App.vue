<template>
  <RouterView />
</template>

<style>
:root {
  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  /* Quiet mercantile palette: warm paper, evergreen, and restrained earth. */
  --thistle: #a9b7a7;
  --pastel-petal: #ebe8dc;
  --baby-pink: #d9e1d5;
  --icy-blue: #e2e8df;
  --sky-blue: #c9d5c5;

  /*
   * Base: #25302a on #f6f4ee = 12.5:1; muted #667168 on page = 4.7:1.
   * Evergreen #314b3d is reserved for actions; white text on it = 9.3:1.
   * Soft sage/stone surfaces keep the storefront calm rather than decorative.
   */
  --page: #f6f4ee;
  --surface: #fffefa;
  --surface-raised: #f0eee7;
  --input: #faf9f4;
  --text: #25302a;
  --muted: #667168;
  --border: #dedbd1;
  --border-strong: #c7c4b9;
  --shadow: rgb(37 48 42 / 12%);
  --brand: #314b3d;
  --brand-strong: #20362b;
  --brand-soft: #e4ece2;
  --on-brand: #fffefa;
  --danger: #9d4d3d;
  --danger-soft: #f5e6e0;
  --success: #456b52;
  --success-soft: #e4eee5;
  --warning: #9a6a2f;
  --warning-soft: #f5eddc;
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
