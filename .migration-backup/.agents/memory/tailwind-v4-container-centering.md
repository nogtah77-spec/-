---
name: Tailwind v4 container is not auto-centered
description: In Tailwind v4 the `container` utility has no auto margins; bare `container` shifts content to the start (right in RTL) between breakpoints.
---

In Tailwind v4, the `container` utility only sets `width:100%` + per-breakpoint `max-width`. Unlike v3's `center: true`, it does NOT add `margin-inline:auto`. A bare `<div className="container">` aligns to the inline-start — which in an RTL (Arabic) layout means it shifts RIGHT at any viewport width between breakpoints, while siblings that include `mx-auto` stay centered. The result is sections that look off-center / misaligned relative to each other.

**Fix (global, one line):** in the main CSS, after `@import "tailwindcss";`, add:
```css
@utility container {
  margin-inline: auto;
}
```
This centers every `container` usage at once. Do NOT also add `padding-inline` here if components already pass their own `px-*`, or padding will double up.

**Why:** alamoudi RTL site had a centered hero (explicit `mx-auto`) but ~24 other `container` sections without it, so they drifted right at mid widths. Centering the utility globally fixed all sections without editing each call site.

**How to apply:** any Tailwind v4 project (especially RTL) reporting "elements not centered / off to one side at some window sizes" — check for bare `container` and centralize via `@utility container`.
