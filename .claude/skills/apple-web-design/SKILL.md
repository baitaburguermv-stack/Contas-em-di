---
name: apple-web-design
description: >-
  Design web pages, landing pages, product pages, portfolios and marketing
  sites in the clean, modern Apple style — generous whitespace, large confident
  typography, a near-monochrome palette with one restrained accent, full-bleed
  sections, soft depth, and subtle scroll-reveal motion. Use this skill whenever
  the user asks for a website, landing page, hero section, or any web UI and
  mentions wanting it to look "modern", "clean", "minimal", "premium",
  "Apple-like", "like apple.com", "sleek", or "high-end" — even if they don't
  say the word "Apple". Prefer this skill over a generic layout whenever the goal
  is a polished marketing or product page rather than a dense dashboard or form.
---

# Apple-style web design

Apple's web design reads as "premium" not because of a secret font or color,
but because of **restraint and precision**. Everything on the page earns its
place, the spacing is large and consistent, and the eye is never fighting
clutter. The job of this skill is to reproduce that feeling — calm, confident,
product-first — in any web page you build.

Keep this mental model: **one idea per screen, lots of air around it, and let
the content (a headline, a product, one image) be the hero.** When in doubt,
remove something and add space.

## The seven principles

Follow these in order of importance. The first three do most of the work.

### 1. Whitespace is the design
Give sections room to breathe. Vertical padding between major sections should be
large — think `6rem` to `10rem` on desktop, never cramped. Content sits in a
centered column that doesn't stretch edge to edge on wide screens
(`max-width` around `980px`–`1120px`, centered with `margin-inline: auto`).
Empty space is not wasted space; it's what signals quality. If a layout feels
busy, the fix is almost always more spacing, not more cleverness.

### 2. Big, confident typography
Headlines are large and tight. A hero headline can be huge
(`clamp(2.5rem, 6vw, 5rem)`), weight 600–700, with **negative letter-spacing**
(around `-0.02em` to `-0.03em`) so the words feel engineered, not loose. Use
`text-wrap: balance` on headlines so they break gracefully. Body text stays
calm and readable (17–21px, line-height ~1.5, normal weight, muted gray).
Keep a clear scale — a few deliberate sizes, not ten random ones.

Fonts: prefer the system stack, which gives Apple's own San Francisco on Apple
devices and clean sans elsewhere:
`-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
If a web font is wanted, **Inter** is the closest free match — load it from
Google Fonts and keep the same system stack as fallback.

### 3. A near-monochrome palette with one accent
Apple pages are mostly white, near-black, and a range of cool grays. Color is
used sparingly — usually a single blue accent for links and the primary button.
Start from tokens like these and adjust per brand:

```css
:root {
  --bg: #ffffff;
  --bg-soft: #f5f5f7;   /* the signature Apple light gray for alternating sections */
  --fg: #1d1d1f;        /* near-black, never pure #000 */
  --fg-muted: #6e6e73;  /* secondary text */
  --accent: #0071e3;    /* the Apple blue; swap for the brand's accent */
  --accent-press: #0077ed;
  --border: #d2d2d7;
  --radius: 18px;
}
```

Alternate section backgrounds between `--bg` (white) and `--bg-soft` (gray) to
create rhythm without adding color. Always design a dark theme too (see
"Both themes" below) — Apple's dark mode is a true near-black (`#000` or
`#101014`) with light text, not a washed-out gray.

### 4. Full-bleed sections, centered content
Section backgrounds span the full width of the viewport; the *content* inside
stays in the centered column. This gives those clean edge-to-edge color bands.
Many Apple sections are centered text + one large image stacked vertically, with
the headline first, a one-line subhead in muted gray, then a product shot.

### 5. Soft, quiet depth
Depth is subtle. Corners are gently rounded (`--radius` ~`18px`, buttons often
fully pill-shaped). Shadows are soft and low-contrast
(`0 4px 24px rgba(0,0,0,0.08)`), never harsh. A frosted-glass navigation bar is
very Apple: `position: sticky; top: 0`, a translucent background, and
`backdrop-filter: blur(20px) saturate(180%)`. Use glass for the nav, not for
everything.

### 6. Calm, purposeful motion
Content fades and rises gently into view as the user scrolls (a small
translate-up + opacity, ~`0.6s` with an ease-out curve), each section a beat
after the last. Hover states are understated — a button darkens slightly, a card
lifts a few pixels. Nothing bounces, spins, or shouts. **Always wrap motion in
`@media (prefers-reduced-motion: no-preference)`** and make the page fully
readable at rest, so the first frame (and anyone who disables motion) still sees
a finished page.

A reliable scroll-reveal pattern:
```css
.reveal { opacity: 1; }
@media (prefers-reduced-motion: no-preference) {
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1); }
  .reveal.in { opacity: 1; transform: none; }
}
```
```js
const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
```

### 7. Buttons and links, the Apple way
The primary button is compact, pill-shaped, filled with the accent, with
comfortable horizontal padding and a subtle press/hover darken:
```css
.btn { display: inline-flex; align-items: center; gap: .4em; padding: .8em 1.4em;
  border-radius: 980px; background: var(--accent); color: #fff; font-weight: 500;
  border: 0; cursor: pointer; transition: background .25s, transform .1s; }
.btn:hover { background: var(--accent-press); }
.btn:active { transform: scale(.98); }
.btn--text { background: none; color: var(--accent); padding: 0; border-radius: 0; }
.btn--text:hover { text-decoration: underline; }
```
Inline links are the accent color with no underline until hover. Text-style
links often carry a trailing chevron ("Learn more ›").

## Page structure that feels Apple

A typical page, top to bottom:

1. **Sticky glass nav** — slim, centered or edge-aligned logo, a few text links,
   maybe one small pill button. Translucent with blur.
2. **Hero** — centered. Big headline, one muted subhead line, one or two links
   (a filled button + a text link with a chevron), then a large hero image or
   product shot below. Sized to its content — avoid forcing a full `100vh` that
   pushes everything else off-screen.
3. **Feature sections** — alternating white / `--bg-soft` bands, each one idea:
   a centered headline + image, or a simple 2–3 column grid of features that
   stacks to one column on mobile.
4. **A highlight / product grid** — equal cards, same height, soft rounding,
   consistent padding.
5. **Footer** — small, quiet, gray text, grouped links, fine print. Low
   contrast, lots of space.

## Non-negotiables (quality guardrails)

- **Responsive and mobile-first in feel.** Everything must look right at ~390px
  wide: columns collapse to one, type scales down with `clamp()`, spacing
  shrinks but stays generous, and the page never scrolls sideways. Apple's
  mobile pages are as polished as desktop.
- **Both themes.** Define all colors as tokens on `:root`, then redefine them
  for dark mode under `@media (prefers-color-scheme: dark)` (and, if a theme
  toggle exists, a `[data-theme="dark"]` block too). Give `body` an explicit
  background. Dark mode is true near-black with light text.
- **Precision.** Line things up on a consistent spacing scale (a 4px or 8px
  base). Inconsistent gaps are the fastest way to lose the premium feel.
- **Real content, never lorem ipsum.** Write short, confident, benefit-led copy
  in the product's own voice — the way Apple writes ("Powerful. Simple.
  Yours."). Short lines, concrete words, no filler.
- **Accessibility.** Keep text contrast readable (muted gray is for secondary
  text, not body paragraphs on busy backgrounds), give interactive elements a
  visible focus state, and respect `prefers-reduced-motion`.

## What to avoid (these break the illusion)

- Clutter, boxed-in everything, and heavy borders. Apple separates with space,
  not lines.
- Loud gradients, multiple bright colors, or rainbow accents. One accent.
- Pure black `#000` text on pure white, or harsh drop shadows.
- Tiny cramped type, or ten different font sizes and weights.
- Busy, bouncy, attention-seeking animation.
- Stretching content edge-to-edge on wide monitors with no max-width.

## How to apply this skill

When asked to build or restyle a page: set the token palette first, pick the
type scale, then lay out full-bleed sections with a centered column and generous
vertical rhythm. Add the glass nav, the scroll-reveal, and the pill buttons.
Then review the result once with fresh eyes and ask: *is there anything I can
remove, and is there enough space?* The answer is usually yes to both — that
final pass toward more restraint is what lands the Apple feel.
