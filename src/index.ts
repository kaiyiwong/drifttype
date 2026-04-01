// Core
export { computePathLayout, parsePath } from './core/path.js';
export { initPointerLayout, stepPointerLayout, isAtRest } from './core/pointer.js';

// Types
export type {
  Point,
  PathSegment,
  MoveToSegment,
  CubicSegment,
  QuadraticSegment,
  LineSegment,
  ParsedPath,
  CharMetrics,
  MeasureFn,
  GlyphLayout,
  PathLayoutResult,
  PathLayoutOptions,
  PointerMode,
  PointerLayoutOptions,
  PointerGlyphState,
  PointerLayoutState,
} from './core/types.js';

// Renderers
export { createCanvasMeasure, renderSvgGroup, renderToSvg, updateSvgGroup } from './renderers/svg.js';
export type { SvgRenderOptions } from './renderers/svg.js';
export { renderPathToCanvas, renderPointerToCanvas } from './renderers/canvas.js';
export type { CanvasRenderOptions } from './renderers/canvas.js';

// Accessibility
export { mountSemantic } from './a11y/semantic.js';
export type { SemanticHandle } from './a11y/semantic.js';
