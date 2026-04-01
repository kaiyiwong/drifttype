/**
 * Semantic layer — keeps a hidden, accessible text node in sync
 * with the visual output so screen readers see real text.
 *
 * The visual element gets aria-hidden="true".
 * The semantic element is visually hidden but available to assistive tech.
 */
export interface SemanticHandle {
    /** Update the accessible text content */
    update(text: string): void;
    /** Remove the semantic node from the DOM */
    destroy(): void;
    /** The hidden element, in case the caller needs a reference */
    element: HTMLElement;
}
/**
 * Mount a semantic text layer into a container.
 * Returns a handle to update or destroy it.
 */
export declare function mountSemantic(container: HTMLElement, text: string): SemanticHandle;
//# sourceMappingURL=semantic.d.ts.map