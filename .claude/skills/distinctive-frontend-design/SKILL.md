---
name: distinctive-frontend-design
description: Design-direction guidance for building distinctive, intentional UI that does not read as a templated default or generic "AI slop". Use when starting a new landing page, marketing site, hero, or redesign and you want a memorable aesthetic — choosing typography, color, layout, and where to spend visual boldness — before writing animation/3D code. Pairs with the marketing-site-motion, web-animation and animated-ui-components skills. Inspired by Anthropic's official frontend-design skill (anthropics/claude-code).
---

# Distinctive Frontend Design

Make UI that looks deliberately designed for *this* subject — not a reskinned
template. Decide the aesthetic direction first; then reach for the motion/3D
skills (`marketing-site-motion`, `web-animation`, `web-3d`,
`animated-ui-components`) to execute it.

> Inspired by Anthropic's official `frontend-design` skill. Treat this as a
> condensed, original restatement — see the source for the canonical version.

## Process: two passes
1. **Plan (compact):** before any code, write a 4-line design brief —
   color direction, type pairing, layout system, and the single signature element.
2. **Critique:** ask "does this read as generic?" Cut anything templated.
   Only then build.

## Principles
- **Ground it in the subject.** Identify the concrete subject, audience, and the
  page's one job. Source distinctive choices from the subject's own materials,
  vocabulary, and references — not generic SaaS conventions.
- **Hero as thesis.** Open with the most characteristic element of the subject,
  chosen on purpose. Avoid the default "centered headline + subtext + two buttons".
- **Typography as personality.** Pick a type pairing specific to the brief; be
  intentional about scale, weight, tracking, and rhythm. Type alone can make a
  page memorable. Avoid defaulting to the same neutral sans everywhere.
- **Structure encodes meaning.** Use devices (numbering, grids, asymmetry) only
  when they convey real information. Question whether each choice earns its place.
- **Spend boldness in one place.** Let the signature moment stand out; keep
  everything around it disciplined. Boldness everywhere = noise.
- **Deliberate motion.** Animate where it serves the subject and guides attention.
  Restraint is what keeps it from feeling auto-generated. (Then implement via the
  animation/scroll/3D skills.)
- **Match complexity to vision.** Execute precisely; don't add complexity the
  concept doesn't call for.

## Anti-"AI slop" checklist
- [ ] Not a centered-hero + 3-feature-cards + generic gradient template.
- [ ] Typography is a specific, intentional pairing (not one default sans).
- [ ] Color comes from a real direction, not a random purple gradient.
- [ ] There is exactly one clear signature element/moment.
- [ ] Spacing/rhythm is deliberate; layout isn't a uniform card grid by default.
- [ ] Motion is purposeful and respects `prefers-reduced-motion`.
- [ ] Copy is specific and active — each element does one job.

## Writing / microcopy
Copy serves clarity and usability: active voice, specific over vague,
conversational register, every element performs exactly one job.

## Then execute
Once the direction is set, build it with:
- **marketing-site-motion** — landing-page recipes & perf/a11y checklist.
- **animated-ui-components** — Aceternity/Magic UI/etc. for flair.
- **web-animation / scroll-effects / web-3d** — the underlying motion & 3D APIs.
