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
export declare function renderPathToCanvas(ctx: CanvasRenderingContext2D, layout: PathLayoutResult, options: CanvasRenderOptions): void;
/**
 * Render a PointerLayoutState onto a canvas 2D context.
 */
export declare function renderPointerToCanvas(ctx: CanvasRenderingContext2D, state: PointerLayoutState, options: CanvasRenderOptions): void;
//# sourceMappingURL=canvas.d.ts.map