import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { initPointerLayout, stepPointerLayout, isAtRest } from '../core/pointer.js';
import { createCanvasMeasure } from '../renderers/svg.js';
import { mountSemantic } from '../a11y/semantic.js';
const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 120;
export function PointerText({ children, font, mode, spacing = 1.05, radius = 120, strength = 0.6, fill = 'currentColor', svgProps, }) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const stateRef = useRef(null);
    const animatingRef = useRef(false);
    const textNodesRef = useRef([]);
    const gRef = useRef(null);
    const semanticRef = useRef(null);
    const measure = useMemo(() => createCanvasMeasure(font), [font]);
    // Initialize layout and create SVG nodes
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg)
            return;
        // Clean up previous
        if (gRef.current) {
            gRef.current.remove();
        }
        let state = initPointerLayout(children, measure, mode, spacing);
        // Center text in viewbox
        const lastGlyph = state.glyphs[state.glyphs.length - 1];
        const totalWidth = lastGlyph
            ? lastGlyph.position.x + lastGlyph.metrics.width / 2
            : 0;
        const offsetX = (VIEW_WIDTH - totalWidth) / 2;
        const offsetY = VIEW_HEIGHT / 2;
        for (const gl of state.glyphs) {
            gl.base = { x: gl.base.x + offsetX, y: gl.base.y + offsetY };
            gl.position = { ...gl.base };
        }
        stateRef.current = state;
        // Build SVG nodes
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('aria-hidden', 'true');
        svg.appendChild(g);
        gRef.current = g;
        const nodes = [];
        for (const gl of state.glyphs) {
            if (gl.char.trim() === '') {
                nodes.push(null);
                continue;
            }
            const t = document.createElementNS(SVG_NS, 'text');
            t.setAttribute('fill', fill);
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('dominant-baseline', 'central');
            t.setAttribute('font', font);
            t.setAttribute('font-family', font.replace(/^[\d.]+\w*\s+/, ''));
            t.textContent = gl.char;
            t.setAttribute('transform', `translate(${gl.position.x}, ${gl.position.y})`);
            g.appendChild(t);
            nodes.push(t);
        }
        textNodesRef.current = nodes;
        return () => {
            g.remove();
            gRef.current = null;
            animatingRef.current = false;
        };
    }, [children, font, mode, spacing, measure, fill]);
    // Semantic layer
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        if (!semanticRef.current) {
            semanticRef.current = mountSemantic(container, children);
        }
        else {
            semanticRef.current.update(children);
        }
        return () => {
            semanticRef.current?.destroy();
            semanticRef.current = null;
        };
    }, [children]);
    const updateNodes = useCallback(() => {
        const state = stateRef.current;
        if (!state)
            return;
        const nodes = textNodesRef.current;
        for (let i = 0; i < state.glyphs.length; i++) {
            const node = nodes[i];
            if (!node)
                continue;
            const gl = state.glyphs[i];
            node.setAttribute('transform', `translate(${gl.position.x}, ${gl.position.y}) rotate(${(gl.angle * 180) / Math.PI})`);
        }
    }, []);
    const startLoop = useCallback(() => {
        if (animatingRef.current)
            return;
        animatingRef.current = true;
        let lastTime = performance.now();
        function tick(now) {
            if (!animatingRef.current)
                return;
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            const state = stateRef.current;
            if (!state)
                return;
            const next = stepPointerLayout(state, state.pointer, radius, strength, dt);
            stateRef.current = next;
            updateNodes();
            if (!next.pointer && isAtRest(next)) {
                animatingRef.current = false;
                return;
            }
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }, [radius, strength, updateNodes]);
    const onPointerMove = useCallback((e) => {
        const svg = svgRef.current;
        const state = stateRef.current;
        if (!svg || !state)
            return;
        const rect = svg.getBoundingClientRect();
        const pointer = {
            x: (e.clientX - rect.left) * (VIEW_WIDTH / rect.width),
            y: (e.clientY - rect.top) * (VIEW_HEIGHT / rect.height),
        };
        stateRef.current = { ...state, pointer };
        startLoop();
    }, [startLoop]);
    const onPointerLeave = useCallback(() => {
        const state = stateRef.current;
        if (state) {
            stateRef.current = { ...state, pointer: null };
        }
    }, []);
    return (_jsx("div", { ref: containerRef, style: { position: 'relative' }, children: _jsx("svg", { ref: svgRef, viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`, xmlns: "http://www.w3.org/2000/svg", onPointerMove: onPointerMove, onPointerLeave: onPointerLeave, ...svgProps }) }));
}
//# sourceMappingURL=PointerText.js.map