## What this is

A zero-dependency TypeScript library for spatial text layouts. Text that follows paths and responds to pointer input — with a first-class accessibility layer.

Two v1 modes:

- **Path layout** — text flows along an arbitrary SVG bezier path
- **Pointer-reactive** — text characters repel, attract, or orbit the mouse cursor

---

## Architecture

Strict separation of concerns:

1. **Layout engine** (`src/core/`) — pure functions, no rendering, no DOM
2. **Renderers** (`src/renderers/`) — SVG and Canvas output
3. **Semantic layer** (`src/a11y/`) — hidden DOM text node, always in sync, `aria-hidden` on visual output
4. **React wrapper** (`src/react/`) — thin hooks + components over the vanilla core

The layout engine must have zero side effects. Renderers are the only things that touch the DOM.

---

## Repo structure

```
drifttype/
├── src/
│   ├── core/
│   │   ├── path.ts          # path layout engine
│   │   ├── pointer.ts       # pointer-reactive layout
│   │   └── types.ts         # shared types
│   ├── renderers/
│   │   ├── svg.ts
│   │   └── canvas.ts
│   ├── a11y/
│   │   └── semantic.ts      # hidden DOM semantic layer
│   └── react/
│       ├── PathText.tsx
│       └── PointerText.tsx
├── demos/
├── benchmarks/
├── CLAUDE.md
├── TASTE.md
└── package.json
```

---

## API shape

### Vanilla

```tsx
import { pathLayout, pointerLayout } from 'drifttype';

// Path layout
const layout = pathLayout('Hello world', {
  path: 'M 0 100 Q 150 0 300 100',
  font: '16px Inter',
  spacing: 1.2,
});
layout.render(svgElement); // visual
layout.mount(containerEl); // semantic DOM layer auto-handled

// Pointer-reactive
const fluid = pointerLayout('Hello world', containerEl, {
  font: '16px Inter',
  mode: 'repel', // | 'attract' | 'orbit'
});
```

### React

```tsx
import { PathText, PointerText } from 'drifttype/react'

<PathText path="M 0 100 Q 150 0 300 100" font="16px Inter">
  Hello world
</PathText>

<PointerText mode="repel" font="16px Inter">
  Hello world
</PointerText>
```

---

## Constraints

- Zero runtime dependencies
- All core functions are pure (no DOM, no side effects)
- TypeScript strict mode
- Accessibility is non-negotiable — every visual output must have a semantic counterpart
- No CSS-in-JS, no style injection
- Bun for dev tooling

---

## What to build first

1. `types.ts` — nail the shared types before anything else
2. `core/path.ts` — pure path layout logic
3. `renderers/svg.ts` — first renderer
4. `a11y/semantic.ts` — semantic layer
5. Wire together in a single demo page
6. Then pointer-reactive mode
7. React wrapper last

---

## Tone / code style

- Prefer explicit over clever
- Small files, clear names
- Comments explain _why_, not _what_
- No barrel files that obscure what's actually exported
