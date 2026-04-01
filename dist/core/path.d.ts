import type { ParsedPath, MeasureFn, PathLayoutResult } from './types.js';
/**
 * Parse an SVG path data string into segments.
 * Supports M, L, H, V, C, Q, S, T, Z (both absolute and relative).
 */
export declare function parsePath(d: string): ParsedPath;
/**
 * Compute the layout of text along a path. Pure function — no DOM, no side effects.
 *
 * @param text - The string to lay out
 * @param pathData - SVG path data string
 * @param measure - Function that returns character metrics
 * @param spacing - Letter-spacing multiplier (default 1)
 * @param startOffset - Arc-length offset to begin placing text (default 0)
 * @param align - Text alignment along the path (default 'start')
 */
export declare function computePathLayout(text: string, pathData: string, measure: MeasureFn, spacing?: number, startOffset?: number, align?: 'start' | 'center' | 'end'): PathLayoutResult;
//# sourceMappingURL=path.d.ts.map