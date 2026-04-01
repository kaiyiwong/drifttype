import type { PathLayoutResult, MeasureFn } from '../core/types.js';
/**
 * Create a MeasureFn from a CSS font string using an offscreen canvas.
 * This is the bridge between the pure layout engine and the DOM.
 */
export declare function createCanvasMeasure(font: string): MeasureFn;
export interface SvgRenderOptions {
    /** CSS font string applied to the <text> elements */
    font: string;
    /** Fill color. Default "currentColor". */
    fill?: string;
    /** Whether to include the raw path as a visible <path> element (debug). Default false. */
    debugPath?: boolean;
    /** SVG path data string — only needed if debugPath is true */
    pathData?: string;
}
/**
 * Render a PathLayoutResult into an SVG group element (<g>).
 * Returns the <g> — caller appends it wherever they want.
 */
export declare function renderSvgGroup(layout: PathLayoutResult, options: SvgRenderOptions): SVGGElement;
/**
 * Render into an existing SVG element, clearing previous content.
 */
export declare function renderToSvg(svg: SVGSVGElement, layout: PathLayoutResult, options: SvgRenderOptions): void;
/**
 * Update an existing rendered group in-place.
 * More efficient than re-rendering — reuses DOM nodes when possible.
 */
export declare function updateSvgGroup(g: SVGGElement, layout: PathLayoutResult, options: SvgRenderOptions): void;
//# sourceMappingURL=svg.d.ts.map