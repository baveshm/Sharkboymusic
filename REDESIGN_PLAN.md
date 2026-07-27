# Sharkboy Website Redesign Plan

## Goal

Evolve the Sharkboy portfolio into a more editorial, premium experience inspired by Velantec's visual language, while keeping Sharkboy's own content, media, and electric-blue identity.

## Design direction

- Use a mostly monochrome canvas with electric blue as a focused accent.
- Replace rounded, card-heavy UI with strong rules, open space, oversized type, and editorial grids.
- Make the hero feel immediate: a large wordmark, concise positioning, and an image revealed alongside the typography.
- Keep the site easy to scan for event planners while giving the work and media more visual weight.

## Motion direction

- Introduce a short branded loader and staggered hero entrance.
- Use clip-path image reveals, restrained text lift-ins, and smooth hover fills.
- Add subtle image parallax and an animated marquee without compromising readability.
- Respect `prefers-reduced-motion` and keep all interactions usable without animation.

## Implementation

1. Rebuild the visual system in `website/style.css`.
2. Refine hero and section markup in `website/index.html`.
3. Simplify and modernize interactions in `website/script.js`.
4. Preserve the manifest-driven photo/video workflow and booking email flow.
5. Verify responsive layouts, keyboard states, reduced motion, and asset loading.

## Acceptance criteria

- Clear Velantec-inspired editorial styling without copying its brand or content.
- Responsive navigation and layouts across desktop, tablet, and mobile.
- Existing photos, videos, gig content, social links, and booking flow still work.
- No JavaScript errors; media manifest continues to populate both galleries.
- Animation remains smooth and gracefully degrades for reduced-motion users.
