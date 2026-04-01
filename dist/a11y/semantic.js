/**
 * Semantic layer — keeps a hidden, accessible text node in sync
 * with the visual output so screen readers see real text.
 *
 * The visual element gets aria-hidden="true".
 * The semantic element is visually hidden but available to assistive tech.
 */
// Visually hidden but accessible — standard sr-only technique
const SR_STYLES = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    // clip-path is the modern replacement for clip: rect(0,0,0,0)
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: '0',
};
/**
 * Mount a semantic text layer into a container.
 * Returns a handle to update or destroy it.
 */
export function mountSemantic(container, text) {
    const el = document.createElement('span');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', text);
    Object.assign(el.style, SR_STYLES);
    el.textContent = text;
    container.appendChild(el);
    return {
        update(newText) {
            el.setAttribute('aria-label', newText);
            el.textContent = newText;
        },
        destroy() {
            el.remove();
        },
        element: el,
    };
}
//# sourceMappingURL=semantic.js.map