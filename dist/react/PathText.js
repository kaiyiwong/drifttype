import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect, useMemo } from 'react';
import { computePathLayout } from '../core/path.js';
import { createCanvasMeasure, renderToSvg } from '../renderers/svg.js';
import { mountSemantic } from '../a11y/semantic.js';
export function PathText({ children, path, font, spacing = 1, startOffset = 0, align = 'start', fill, debugPath = false, svgProps, }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const semanticRef = useRef(null);
    const measure = useMemo(() => createCanvasMeasure(font), [font]);
    const layout = useMemo(() => computePathLayout(children, path, measure, spacing, startOffset, align), [children, path, measure, spacing, startOffset, align]);
    // Render SVG
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg)
            return;
        renderToSvg(svg, layout, {
            font,
            ...(fill != null && { fill }),
            debugPath,
            pathData: path,
        });
    }, [layout, font, fill, debugPath, path]);
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
    // Derive a viewBox from the path bounding box + padding
    const viewBox = useMemo(() => {
        const padding = 20;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const g of layout.glyphs) {
            const half = g.metrics.width / 2;
            minX = Math.min(minX, g.position.x - half);
            maxX = Math.max(maxX, g.position.x + half);
            minY = Math.min(minY, g.position.y - g.metrics.height);
            maxY = Math.max(maxY, g.position.y + g.metrics.height);
        }
        if (!isFinite(minX))
            return '0 0 300 100';
        return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
    }, [layout]);
    return (_jsx("div", { ref: containerRef, style: { position: 'relative' }, children: _jsx("svg", { ref: svgRef, viewBox: viewBox, xmlns: "http://www.w3.org/2000/svg", ...svgProps }) }));
}
//# sourceMappingURL=PathText.js.map