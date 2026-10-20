---
name: hud-dashboard
description: >-
  Design dark, futuristic "sci-fi HUD" dashboards and data screens — the
  glowing, holographic control-panel look of Iron Man's JARVIS: deep near-black
  backgrounds, frosted glass panels, neon cyan/electric-blue accents with real
  glow, luminous line charts with gradient fills, glowing donut and radial
  progress rings, bar sparklines, and crisp tabular numbers. Use this skill
  whenever the user wants a dashboard, analytics screen, metrics page, admin
  panel, fintech app UI or data visualization and describes it as "dark",
  "futuristic", "sci-fi", "holographic", "neon", "glowing", "HUD", "cyberpunk",
  "high-tech", "Iron Man / JARVIS style", or shows a dark glassy dashboard
  mockup — even if they don't name it exactly. Prefer this skill over a plain
  or light dashboard whenever the goal is a premium dark, glowing control-panel
  aesthetic. For clean, light, minimalist marketing pages use apple-web-design
  instead; this skill is for dark data-dense screens that should feel alive.
---

# HUD dashboard — the JARVIS look

The feeling to hit: you're looking at a living control panel from a sci-fi film.
It's dark, calm, and expensive. Data **glows** softly against deep space-black;
panels look like lit glass floating above the background; one electric accent
color threads through every chart so the screen reads as a single system.

The craft is in **controlled glow and real depth**, not neon chaos. Everything
is dark and restrained *except* the data, which is the only thing that lights up.
That contrast — quiet dark chrome, luminous numbers and lines — is what sells the
JARVIS feel. If the whole screen glows, nothing does; keep the glow for what
matters.

## The palette (start here)

A HUD lives on near-black with cool blues and one or two electric accents. Define
everything as tokens and glow from them:

```css
:root {
  --space:      #070b14;   /* deepest background */
  --space-2:    #0b1020;   /* panel base / gradient partner */
  --panel:      rgba(255,255,255,0.04);   /* glass fill */
  --panel-edge: rgba(255,255,255,0.09);   /* glass top edge / hairline border */
  --ink:        #eaf2ff;   /* primary text, cool white */
  --ink-muted:  #8a97b2;   /* secondary text, bluish gray */
  --ink-faint:  #4b5675;   /* micro-labels, axes */
  --cyan:       #35e0ff;   /* primary accent / glow */
  --blue:       #4d7cff;   /* secondary accent */
  --violet:     #9b7bff;   /* tertiary series */
  --good:       #39f0a0;   /* positive deltas */
  --bad:        #ff5c77;   /* negative deltas */
  --warn:       #ffc061;
}
```

Backgrounds are a **subtle radial or linear gradient**, never flat, so the space
has depth: e.g. `radial-gradient(1200px 600px at 70% -10%, #13203a 0%, var(--space) 55%)`.
A faint warm glow bleeding in from one edge (as in many hero mockups) adds life —
use it sparingly, low opacity.

Semantic colors (green up, red down) are separate from the accent and only mark
good/bad, never decoration.

## The glass panel (the core building block)

Every card is lit glass floating above the void. The recipe:

```css
.panel {
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  border: 1px solid var(--panel-edge);
  border-radius: 20px;
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.08) inset,         /* top light edge */
    0 20px 50px rgba(0,0,0,0.5),                  /* lift off the background */
    0 0 0 1px rgba(53,224,255,0.00);              /* reserved for hover glow */
  padding: 1.4rem 1.5rem;
}
.panel:hover { box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 24px 60px rgba(0,0,0,0.55), 0 0 30px rgba(53,224,255,0.12); }
```

The inset top-edge highlight is what makes it read as *glass* and not a flat box.
Keep borders hairline and bright-ish; keep fills barely-there.

## Glow — the signature move, used with discipline

Glow is a soft colored shadow, applied only to data and key accents:

- **On SVG strokes/shapes:** a blurred duplicate behind the real one, or an SVG
  `<filter>` with `feGaussianBlur`. A cheap, reliable line glow:
  ```html
  <path d="…" fill="none" stroke="var(--cyan)" stroke-width="2.5"
        style="filter: drop-shadow(0 0 6px rgba(53,224,255,0.8)) drop-shadow(0 0 16px rgba(53,224,255,0.4))"/>
  ```
- **On text (a key number):** `text-shadow: 0 0 18px rgba(53,224,255,0.35);` — subtle.
- **On a button or active chip:** a soft outer `box-shadow` in the accent.

Rule of restraint: glow the **one or two** most important things per panel. Body
text, axes, and gridlines never glow.

## Typography

Cool, technical, precise:
- **Body / UI:** a clean geometric sans — `Inter`, or the system stack as
  fallback. Letter-spacing slightly tight on big numbers.
- **Big numbers (the hero figures):** large and confident,
  `font-variant-numeric: tabular-nums`, weight 600, optionally a faint glow.
  A techy display face (e.g. `Space Grotesk`, `Orbitron` only if the user wants
  it overtly sci-fi) can go on headline numbers — but Inter already looks great.
- **Micro-labels:** UPPERCASE, small (`0.68rem`), `letter-spacing: 0.14em`, color
  `--ink-faint`. These tiny tracked labels above each metric are a huge part of
  the HUD feel.

Load web fonts from Google Fonts with a real fallback stack.

## Charts — luminous, hand-drawn in SVG

These are the centerpiece. Draw them in SVG (or with d3 if available) so you
control the glow. Color every series from the token palette; keep marks, axes and
labels clear of each other.

- **Glowing line chart:** 2–2.5px stroke in `--cyan`, round caps/joins, with the
  drop-shadow glow above. Under it, a **gradient area fill** fading to nothing
  (vertical `linearGradient`, cyan at ~0.28 opacity on top → 0 at the baseline).
  Mark the latest point with a glowing dot. Gridlines are 1px at ~0.06 white;
  axis labels in `--ink-faint`, tiny.
- **Radial / ring progress** (the "68%" ring): two stacked SVG circles with
  `stroke-dasharray`; track ring faint, value ring in the accent with glow and
  round `stroke-linecap`. Put the percentage in the center, glowing.
- **Donut (category split):** segments in cyan → blue → violet → muted steps,
  a thin gap between segments, total in the hole. A faint glow on the largest
  segment only.
- **Bar sparklines:** short rounded bars in the accent, the latest few brighter,
  earlier ones fading — great inside KPI tiles next to a big number.
- **Delta pills:** a small rounded chip, `▲ +8.2%` in `--good` / `▼ −5%` in
  `--bad`, with a faint matching tint background.

## Layout

- A **dashboard grid** of glass panels with generous `gap` (~1.1rem). A big hero
  panel can span two columns (patrimônio / balance), with secondary KPI tiles in
  a row below, then wider chart panels under that. Collapse to one column on
  mobile.
- A slim **top bar**: a title/breadcrumb on the left, a search field and a couple
  of round icon buttons on the right, a primary pill button ("+ Nova transação").
  The bar can be the same glass as the panels, or transparent over the gradient.
- Optional HUD flourishes, used lightly: thin corner brackets on a feature panel,
  a 1px accent rule under a section label, a faint scanline or grid texture in the
  background at very low opacity. A little goes a long way — don't costume every
  element.

## Motion (subtle, alive)

The screen should feel *alive* but not busy:
- Panels and numbers fade/rise in on load, staggered.
- The key accent can have a very slow breathing glow
  (`@keyframes pulse { 50% { opacity: .85 } }`, ~4s) — at most on one element.
- Charts can draw in once (animate the line's `stroke-dashoffset`, or grow bars).
- Count-up a hero number on first load if it's cheap.
- Always wrap motion in `@media (prefers-reduced-motion: no-preference)` and make
  the page fully readable at rest.

## Non-negotiables

- **Contrast and legibility first.** It's dark, but body text must stay readable
  — use `--ink` for anything you actually need to read, `--ink-muted` only for
  secondary labels. Glow must never smear a number into unreadability.
- **Responsive.** Panels reflow to one column at ~400px; charts size from their
  container's width; big numbers scale with `clamp()`; never scroll sideways.
- **One accent system.** Cyan (+ blue/violet for extra series) threads through
  everything. Resist adding unrelated bright colors; semantic green/red are the
  only exceptions and only for good/bad.
- **Real data, real labels.** Use believable numbers and the product's own
  language, not lorem ipsum. Every figure on a real dashboard should trace to a
  source; mark example data as example.
- **Restraint with glow and effects.** The dark calm chrome is what makes the
  glowing data pop. When it starts looking noisy, dim the chrome and keep the
  light on the data.

## Applying this skill

Set the token palette and the gradient background first. Build the glass `.panel`
once and reuse it. Lay out the grid: hero panel, KPI tiles with sparklines, then
the chart panels (glowing line + donut + ring). Draw each chart in SVG with the
glow filter, colored from the tokens. Add the micro-labels, delta pills, and a
slim top bar. Then review with fresh eyes and ask: *is the chrome quiet enough
that the data is the only thing glowing?* Dialing the chrome down is almost always
the final move that lands the JARVIS feel.
