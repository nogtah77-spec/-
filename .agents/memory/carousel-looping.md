---
name: Carousel looping
description: Durable guidance for smooth infinite property carousel transitions.
---

Infinite carousels should render repeated copies of the same track and animate into the next copy before normalizing the scroll position. The normalization must happen after the animation completes so the reset is visually invisible.

**Why:** Directly animating from the final card back to scroll position zero creates a visible reverse jump and feels unpolished.

**How to apply:** Keep autoplay and pointer/touch pause behavior independent from the looping mechanism; normalize only when the carousel is not actively animating.