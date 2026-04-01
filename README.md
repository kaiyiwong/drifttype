# drifttype

Spatial text layouts for the web. Text that follows paths and responds to pointer input.

Zero dependencies. Accessibility built in.

## Path layout

Text flows along an SVG bezier path. Each character is positioned and rotated to follow the curve tangent.

```js
import { computePathLayout, createCanvasMeasure, renderToSvg, mountSemantic } from 'drifttype'

const measure = createCanvasMeasure('24px Georgia')
const layout = computePathLayout('Hello world', 'M 0 100 Q 150 0 300 100', measure)

renderToSvg(svgElement, layout, { font: '24px Georgia' })
mountSemantic(container, 'Hello world')
```

The layout engine is pure — it takes a string, a path, and a measurement function, and returns positioned glyphs. No DOM access, no side effects. Rendering is separate.

## Pointer-reactive layout

Characters repel, attract, or orbit the cursor. Spring physics with inertia.

```js
import { initPointerLayout, stepPointerLayout, isAtRest } from 'drifttype'

const measure = createCanvasMeasure('24px Georgia')
let state = initPointerLayout('Hello world', measure, 'repel')

// in your animation loop
state = stepPointerLayout(state, { x: mouseX, y: mouseY }, 120, 0.6, dt)
```

Three modes: `repel`, `attract`, `orbit`. Pass `null` as the pointer to let characters settle back.

## React

```tsx
import { PathText, PointerText } from 'drifttype/react'

<PathText path="M 0 100 Q 150 0 300 100" font="24px Georgia">
  Hello world
</PathText>

<PointerText mode="repel" font="24px Georgia">
  Hello world
</PointerText>
```

## Canvas renderer

```js
import { renderPathToCanvas, renderPointerToCanvas } from 'drifttype'

renderPathToCanvas(ctx, layout, { font: '24px Georgia' })
renderPointerToCanvas(ctx, pointerState, { font: '24px Georgia' })
```

## Accessibility

Every visual output should have a semantic counterpart. `mountSemantic` creates a visually-hidden DOM node with the text content so screen readers can access it. The SVG renderer marks visual output `aria-hidden="true"` automatically.

```js
const handle = mountSemantic(container, 'Hello world')
handle.update('New text')   // update content
handle.destroy()            // clean up
```

The React components handle this for you.

## How it works

The layout engine parses SVG path data into bezier segments, builds an arc-length lookup table for each segment, then places characters at evenly-spaced distances along the curve. Character widths come from an injected measurement function — the engine itself never touches the DOM.

The pointer-reactive engine runs spring physics per character. Forces are computed from the character's base position relative to the pointer, with quadratic falloff inside a configurable radius. The animation loop is frame-rate independent.

## API

### `computePathLayout(text, pathData, measure, spacing?, startOffset?, align?)`

Returns a `PathLayoutResult` with positioned glyphs.

| Param | Type | Default | |
|---|---|---|---|
| `text` | `string` | | The text to lay out |
| `pathData` | `string` | | SVG path data |
| `measure` | `MeasureFn` | | Character measurement function |
| `spacing` | `number` | `1` | Letter-spacing multiplier |
| `startOffset` | `number` | `0` | Arc-length offset to start |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Text alignment along path |

### `initPointerLayout(text, measure, mode, spacing?)`

Returns initial `PointerLayoutState`.

### `stepPointerLayout(state, pointer, radius, strength, dt?)`

Advances the physics simulation by one frame. Returns new state.

### `createCanvasMeasure(font)`

Creates a `MeasureFn` from a CSS font string using an offscreen canvas. Results are cached per character.

### `parsePath(d)`

Parses an SVG path data string into a `ParsedPath`. Supports M, L, H, V, C, Q, S, T, Z (absolute and relative).

## Install

```
npm install drifttype
```

React components require `react >= 18` as a peer dependency.

## License

MIT
