// ---- SVG path parsing ----
const COMMAND_RE = /([MmCcQqLlHhVvSsTtZz])/;
function tokenize(d) {
    // Split on commands, keeping the command letter, then split on whitespace/commas
    return d
        .split(COMMAND_RE)
        .flatMap((part) => part.trim().split(/[\s,]+/))
        .filter((t) => t.length > 0);
}
function nextNum(tokens, i) {
    const val = Number(tokens[i]);
    if (Number.isNaN(val))
        throw new Error(`Expected number at token ${i}, got "${tokens[i]}"`);
    return [val, i + 1];
}
/**
 * Parse an SVG path data string into segments.
 * Supports M, L, H, V, C, Q, S, T, Z (both absolute and relative).
 */
export function parsePath(d) {
    const tokens = tokenize(d);
    const segments = [];
    let i = 0;
    let cursor = { x: 0, y: 0 };
    let subpathStart = { x: 0, y: 0 };
    // For smooth curves (S/T)
    let lastControl = null;
    let lastCommand = '';
    while (i < tokens.length) {
        const cmd = tokens[i];
        i++;
        switch (cmd) {
            case 'M': {
                let x, y;
                [x, i] = nextNum(tokens, i);
                [y, i] = nextNum(tokens, i);
                cursor = { x, y };
                subpathStart = { x, y };
                segments.push({ type: 'M', to: cursor });
                lastControl = null;
                // Subsequent coordinate pairs after M are treated as L
                while (i < tokens.length && !isCommand(tokens[i])) {
                    [x, i] = nextNum(tokens, i);
                    [y, i] = nextNum(tokens, i);
                    cursor = { x, y };
                    segments.push({ type: 'L', to: cursor });
                }
                break;
            }
            case 'm': {
                let dx, dy;
                [dx, i] = nextNum(tokens, i);
                [dy, i] = nextNum(tokens, i);
                cursor = { x: cursor.x + dx, y: cursor.y + dy };
                subpathStart = { ...cursor };
                segments.push({ type: 'M', to: cursor });
                lastControl = null;
                while (i < tokens.length && !isCommand(tokens[i])) {
                    [dx, i] = nextNum(tokens, i);
                    [dy, i] = nextNum(tokens, i);
                    cursor = { x: cursor.x + dx, y: cursor.y + dy };
                    segments.push({ type: 'L', to: cursor });
                }
                break;
            }
            case 'L': {
                let x, y;
                [x, i] = nextNum(tokens, i);
                [y, i] = nextNum(tokens, i);
                cursor = { x, y };
                segments.push({ type: 'L', to: cursor });
                lastControl = null;
                while (i < tokens.length && !isCommand(tokens[i])) {
                    [x, i] = nextNum(tokens, i);
                    [y, i] = nextNum(tokens, i);
                    cursor = { x, y };
                    segments.push({ type: 'L', to: cursor });
                }
                break;
            }
            case 'l': {
                let dx, dy;
                [dx, i] = nextNum(tokens, i);
                [dy, i] = nextNum(tokens, i);
                cursor = { x: cursor.x + dx, y: cursor.y + dy };
                segments.push({ type: 'L', to: cursor });
                lastControl = null;
                while (i < tokens.length && !isCommand(tokens[i])) {
                    [dx, i] = nextNum(tokens, i);
                    [dy, i] = nextNum(tokens, i);
                    cursor = { x: cursor.x + dx, y: cursor.y + dy };
                    segments.push({ type: 'L', to: cursor });
                }
                break;
            }
            case 'H': {
                let x;
                [x, i] = nextNum(tokens, i);
                cursor = { x, y: cursor.y };
                segments.push({ type: 'L', to: cursor });
                lastControl = null;
                break;
            }
            case 'h': {
                let dx;
                [dx, i] = nextNum(tokens, i);
                cursor = { x: cursor.x + dx, y: cursor.y };
                segments.push({ type: 'L', to: cursor });
                lastControl = null;
                break;
            }
            case 'V': {
                let y;
                [y, i] = nextNum(tokens, i);
                cursor = { x: cursor.x, y };
                segments.push({ type: 'L', to: cursor });
                lastControl = null;
                break;
            }
            case 'v': {
                let dy;
                [dy, i] = nextNum(tokens, i);
                cursor = { x: cursor.x, y: cursor.y + dy };
                segments.push({ type: 'L', to: cursor });
                lastControl = null;
                break;
            }
            case 'C': {
                let x1, y1, x2, y2, x, y;
                [x1, i] = nextNum(tokens, i);
                [y1, i] = nextNum(tokens, i);
                [x2, i] = nextNum(tokens, i);
                [y2, i] = nextNum(tokens, i);
                [x, i] = nextNum(tokens, i);
                [y, i] = nextNum(tokens, i);
                const cp2 = { x: x2, y: y2 };
                cursor = { x, y };
                segments.push({ type: 'C', cp1: { x: x1, y: y1 }, cp2, to: cursor });
                lastControl = cp2;
                break;
            }
            case 'c': {
                let dx1, dy1, dx2, dy2, dx, dy;
                [dx1, i] = nextNum(tokens, i);
                [dy1, i] = nextNum(tokens, i);
                [dx2, i] = nextNum(tokens, i);
                [dy2, i] = nextNum(tokens, i);
                [dx, i] = nextNum(tokens, i);
                [dy, i] = nextNum(tokens, i);
                const cp2Rel = { x: cursor.x + dx2, y: cursor.y + dy2 };
                const seg = {
                    type: 'C',
                    cp1: { x: cursor.x + dx1, y: cursor.y + dy1 },
                    cp2: cp2Rel,
                    to: { x: cursor.x + dx, y: cursor.y + dy },
                };
                cursor = seg.to;
                segments.push(seg);
                lastControl = cp2Rel;
                break;
            }
            case 'Q': {
                let x1, y1, x, y;
                [x1, i] = nextNum(tokens, i);
                [y1, i] = nextNum(tokens, i);
                [x, i] = nextNum(tokens, i);
                [y, i] = nextNum(tokens, i);
                const cp = { x: x1, y: y1 };
                cursor = { x, y };
                segments.push({ type: 'Q', cp, to: cursor });
                lastControl = cp;
                break;
            }
            case 'q': {
                let dx1, dy1, dx, dy;
                [dx1, i] = nextNum(tokens, i);
                [dy1, i] = nextNum(tokens, i);
                [dx, i] = nextNum(tokens, i);
                [dy, i] = nextNum(tokens, i);
                const cpRel = { x: cursor.x + dx1, y: cursor.y + dy1 };
                const seg = {
                    type: 'Q',
                    cp: cpRel,
                    to: { x: cursor.x + dx, y: cursor.y + dy },
                };
                cursor = seg.to;
                segments.push(seg);
                lastControl = cpRel;
                break;
            }
            case 'S': {
                let x2, y2, x, y;
                [x2, i] = nextNum(tokens, i);
                [y2, i] = nextNum(tokens, i);
                [x, i] = nextNum(tokens, i);
                [y, i] = nextNum(tokens, i);
                // Reflect previous cp2 for smooth continuation
                const reflected = lastControl && (lastCommand === 'C' || lastCommand === 'c' || lastCommand === 'S' || lastCommand === 's')
                    ? { x: 2 * cursor.x - lastControl.x, y: 2 * cursor.y - lastControl.y }
                    : { ...cursor };
                const smoothCp2 = { x: x2, y: y2 };
                cursor = { x, y };
                segments.push({ type: 'C', cp1: reflected, cp2: smoothCp2, to: cursor });
                lastControl = smoothCp2;
                break;
            }
            case 's': {
                let dx2, dy2, dx, dy;
                [dx2, i] = nextNum(tokens, i);
                [dy2, i] = nextNum(tokens, i);
                [dx, i] = nextNum(tokens, i);
                [dy, i] = nextNum(tokens, i);
                const reflected = lastControl && (lastCommand === 'C' || lastCommand === 'c' || lastCommand === 'S' || lastCommand === 's')
                    ? { x: 2 * cursor.x - lastControl.x, y: 2 * cursor.y - lastControl.y }
                    : { ...cursor };
                const smoothCp2Rel = { x: cursor.x + dx2, y: cursor.y + dy2 };
                const seg = {
                    type: 'C',
                    cp1: reflected,
                    cp2: smoothCp2Rel,
                    to: { x: cursor.x + dx, y: cursor.y + dy },
                };
                cursor = seg.to;
                segments.push(seg);
                lastControl = smoothCp2Rel;
                break;
            }
            case 'T': {
                let x, y;
                [x, i] = nextNum(tokens, i);
                [y, i] = nextNum(tokens, i);
                const reflected = lastControl && (lastCommand === 'Q' || lastCommand === 'q' || lastCommand === 'T' || lastCommand === 't')
                    ? { x: 2 * cursor.x - lastControl.x, y: 2 * cursor.y - lastControl.y }
                    : { ...cursor };
                cursor = { x, y };
                segments.push({ type: 'Q', cp: reflected, to: cursor });
                lastControl = reflected;
                break;
            }
            case 't': {
                let dx, dy;
                [dx, i] = nextNum(tokens, i);
                [dy, i] = nextNum(tokens, i);
                const reflected = lastControl && (lastCommand === 'Q' || lastCommand === 'q' || lastCommand === 'T' || lastCommand === 't')
                    ? { x: 2 * cursor.x - lastControl.x, y: 2 * cursor.y - lastControl.y }
                    : { ...cursor };
                cursor = { x: cursor.x + dx, y: cursor.y + dy };
                segments.push({ type: 'Q', cp: reflected, to: cursor });
                lastControl = reflected;
                break;
            }
            case 'Z':
            case 'z': {
                if (cursor.x !== subpathStart.x || cursor.y !== subpathStart.y) {
                    segments.push({ type: 'L', to: subpathStart });
                }
                cursor = { ...subpathStart };
                lastControl = null;
                break;
            }
            default:
                throw new Error(`Unsupported path command: ${cmd}`);
        }
        lastCommand = cmd;
    }
    return { segments };
}
function isCommand(token) {
    return /^[MmCcQqLlHhVvSsTtZz]$/.test(token);
}
// ---- Bezier math ----
function lerpPoint(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
function cubicPoint(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const uu = u * u;
    const uuu = uu * u;
    const tt = t * t;
    const ttt = tt * t;
    return {
        x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
        y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
    };
}
function cubicTangent(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const uu = u * u;
    const tt = t * t;
    return {
        x: 3 * uu * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * tt * (p3.x - p2.x),
        y: 3 * uu * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * tt * (p3.y - p2.y),
    };
}
function quadraticPoint(p0, p1, p2, t) {
    const u = 1 - t;
    return {
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    };
}
function quadraticTangent(p0, p1, p2, t) {
    const u = 1 - t;
    return {
        x: 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
        y: 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
    };
}
function dist(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}
// Number of samples for arc length approximation per segment.
// Higher = more accurate, but the curves we're dealing with are short enough
// that 64 samples gives sub-pixel accuracy.
const ARC_SAMPLES = 64;
function buildArcSegments(parsed) {
    const result = [];
    let cursor = { x: 0, y: 0 };
    let runningLen = 0;
    for (const seg of parsed.segments) {
        if (seg.type === 'M') {
            cursor = seg.to;
            continue;
        }
        const from = cursor;
        let pointAt;
        let tangentAt;
        switch (seg.type) {
            case 'L':
                pointAt = (t) => lerpPoint(from, seg.to, t);
                tangentAt = () => ({ x: seg.to.x - from.x, y: seg.to.y - from.y });
                break;
            case 'C':
                pointAt = (t) => cubicPoint(from, seg.cp1, seg.cp2, seg.to, t);
                tangentAt = (t) => cubicTangent(from, seg.cp1, seg.cp2, seg.to, t);
                break;
            case 'Q':
                pointAt = (t) => quadraticPoint(from, seg.cp, seg.to, t);
                tangentAt = (t) => quadraticTangent(from, seg.cp, seg.to, t);
                break;
        }
        // Build arc-length LUT
        const lut = [0];
        let prev = from;
        for (let j = 1; j <= ARC_SAMPLES; j++) {
            const pt = pointAt(j / ARC_SAMPLES);
            lut.push(lut[j - 1] + dist(prev, pt));
            prev = pt;
        }
        const segLen = lut[ARC_SAMPLES];
        result.push({
            startLen: runningLen,
            endLen: runningLen + segLen,
            pointAt,
            tangentAt,
            lut,
        });
        runningLen += segLen;
        cursor = seg.to;
    }
    return result;
}
/**
 * Given a distance along a segment's arc, find the parametric t value
 * using the precomputed LUT with binary search + linear interpolation.
 */
function arcLenToT(seg, targetLen) {
    const totalLen = seg.lut[seg.lut.length - 1];
    if (targetLen <= 0)
        return 0;
    if (targetLen >= totalLen)
        return 1;
    // Binary search for the LUT interval containing targetLen
    let lo = 0;
    let hi = seg.lut.length - 1;
    while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (seg.lut[mid] < targetLen) {
            lo = mid;
        }
        else {
            hi = mid;
        }
    }
    const loLen = seg.lut[lo];
    const hiLen = seg.lut[hi];
    const frac = hiLen > loLen ? (targetLen - loLen) / (hiLen - loLen) : 0;
    return (lo + frac) / ARC_SAMPLES;
}
/** Sample a point and tangent at a given arc-length distance along the full path */
function sampleAtLength(arcSegs, length) {
    // Clamp
    const totalLen = arcSegs.length > 0 ? arcSegs[arcSegs.length - 1].endLen : 0;
    const clamped = Math.max(0, Math.min(length, totalLen));
    // Find the segment
    let seg = arcSegs[0];
    for (const s of arcSegs) {
        if (s.endLen >= clamped) {
            seg = s;
            break;
        }
    }
    const localLen = clamped - seg.startLen;
    const t = arcLenToT(seg, localLen);
    const point = seg.pointAt(t);
    const tangent = seg.tangentAt(t);
    const angle = Math.atan2(tangent.y, tangent.x);
    return { point, angle };
}
// ---- Public API ----
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
export function computePathLayout(text, pathData, measure, spacing = 1, startOffset = 0, align = 'start') {
    const parsed = parsePath(pathData);
    const arcSegs = buildArcSegments(parsed);
    const totalPathLen = arcSegs.length > 0 ? arcSegs[arcSegs.length - 1].endLen : 0;
    // Measure all characters first to know total text length
    const chars = [...text];
    const measurements = chars.map((char, idx) => ({
        char,
        metrics: measure(char, idx),
    }));
    let totalTextLen = 0;
    for (let idx = 0; idx < measurements.length; idx++) {
        const m = measurements[idx];
        totalTextLen += m.metrics.width * spacing;
    }
    // Calculate starting offset based on alignment
    let cursor = startOffset;
    switch (align) {
        case 'center':
            cursor += (totalPathLen - totalTextLen) / 2;
            break;
        case 'end':
            cursor += totalPathLen - totalTextLen;
            break;
        case 'start':
            break;
    }
    // Place each character
    const glyphs = [];
    for (let idx = 0; idx < measurements.length; idx++) {
        const m = measurements[idx];
        const charWidth = m.metrics.width * spacing;
        // Place at the center of the character's advance
        const midpoint = cursor + charWidth / 2;
        const { point, angle } = sampleAtLength(arcSegs, midpoint);
        glyphs.push({
            char: m.char,
            index: idx,
            position: point,
            angle,
            metrics: m.metrics,
        });
        cursor += charWidth;
    }
    return {
        glyphs,
        text,
        textLength: totalTextLen,
        pathLength: totalPathLen,
    };
}
//# sourceMappingURL=path.js.map