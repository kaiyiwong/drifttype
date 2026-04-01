import type { PathLayoutResult } from '../core/types.js';
import type { PointerLayoutState } from '../core/types.js';

export interface CanvasRenderOptions {
  font: string;
  fill?: string;
  /** Draw the raw path curve (debug). Default false. */
  debugPath?: boolean;
  /** SVG path data string — only needed if debugPath is true */
  pathData?: string;
}

/**
 * Render a PathLayoutResult onto a canvas 2D context.
 */
export function renderPathToCanvas(
  ctx: CanvasRenderingContext2D,
  layout: PathLayoutResult,
  options: CanvasRenderOptions,
): void {
  ctx.save();
  ctx.font = options.font;
  ctx.fillStyle = options.fill ?? 'currentColor';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (options.debugPath && options.pathData) {
    drawDebugPath(ctx, options.pathData);
  }

  for (const glyph of layout.glyphs) {
    if (glyph.char.trim() === '') continue;
    drawGlyph(ctx, glyph.char, glyph.position.x, glyph.position.y, glyph.angle);
  }

  ctx.restore();
}

/**
 * Render a PointerLayoutState onto a canvas 2D context.
 */
export function renderPointerToCanvas(
  ctx: CanvasRenderingContext2D,
  state: PointerLayoutState,
  options: CanvasRenderOptions,
): void {
  ctx.save();
  ctx.font = options.font;
  ctx.fillStyle = options.fill ?? 'currentColor';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const glyph of state.glyphs) {
    if (glyph.char.trim() === '') continue;
    drawGlyph(ctx, glyph.char, glyph.position.x, glyph.position.y, glyph.angle);
  }

  ctx.restore();
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  char: string,
  x: number,
  y: number,
  angle: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillText(char, 0, 0);
  ctx.restore();
}

function drawDebugPath(ctx: CanvasRenderingContext2D, pathData: string): void {
  ctx.save();
  const path = new Path2D(pathData);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke(path);
  ctx.restore();
}
