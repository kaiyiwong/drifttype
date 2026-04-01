import type { Point, MeasureFn, PointerMode, PointerLayoutState } from './types.js';
/**
 * Create the initial state for a pointer-reactive layout.
 * Characters are laid out in a horizontal line starting from (0, 0).
 * Pure function — no DOM.
 */
export declare function initPointerLayout(text: string, measure: MeasureFn, mode: PointerMode, spacing?: number): PointerLayoutState;
/**
 * Compute the next frame of the pointer-reactive layout.
 * Returns a new state — does not mutate the input.
 *
 * @param state - Current layout state
 * @param pointer - Current pointer position (null if pointer left the area)
 * @param radius - Effect radius in pixels
 * @param strength - Effect strength, 0–1
 * @param dt - Time delta in seconds (for frame-rate independence). Default ~16ms.
 */
export declare function stepPointerLayout(state: PointerLayoutState, pointer: Point | null, radius: number, strength: number, dt?: number): PointerLayoutState;
/**
 * Check if the layout is at rest (all characters settled).
 * Useful to stop the animation loop when nothing is moving.
 */
export declare function isAtRest(state: PointerLayoutState): boolean;
//# sourceMappingURL=pointer.d.ts.map