# drifttype — taste & aesthetic constraints

## What this library is for

Creative frontend developers. Design technologists. People building portfolios,
campaign microsites, editorial layouts, generative art pieces.
Not enterprise dashboards. Not SaaS UIs.

## Demo page aesthetic

- Dark background. Not pitch black — something like #0d0d0d or a very dark warm gray.
- Typography: a system sans for UI chrome, something expressive (Instrument Serif, Editorial New,
  or similar) for the demo text itself
- Demos should feel like they belong on a creative studio's website, not a docs site
- Generous whitespace. Each demo gets room to breathe.
- No gradients on UI chrome. Gradients only appear as part of demo outputs.
- Interactions should feel physical — spring physics, inertia, not linear easing

## API naming

- Short and direct. `pathLayout`, not `createPathLayoutInstance`.
- No Hungarian notation.
- Boolean props are positive: `accessible` not `disableA11y`

## What to avoid

- Don't make it look like a component library
- Don't use blue as the primary accent (overused in OSS)
- Don't add a logo that looks AI-generated
- No feature lists formatted as emoji bullet points in the README
- The README should read like it was written by someone who has taste,
  not by someone trying to get GitHub stars

## README tone

Dry. Confident. Minimal preamble. Lead with code, not marketing copy.
