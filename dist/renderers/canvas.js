/**
 * Render a PathLayoutResult onto a canvas 2D context.
 */
export function renderPathToCanvas(ctx, layout, options) {
    ctx.save();
    ctx.font = options.font;
    ctx.fillStyle = options.fill ?? 'currentColor';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (options.debugPath && options.pathData) {
        drawDebugPath(ctx, options.pathData);
    }
    for (const glyph of layout.glyphs) {
        if (glyph.char.trim() === '')
            continue;
        drawGlyph(ctx, glyph.char, glyph.position.x, glyph.position.y, glyph.angle);
    }
    ctx.restore();
}
/**
 * Render a PointerLayoutState onto a canvas 2D context.
 */
export function renderPointerToCanvas(ctx, state, options) {
    ctx.save();
    ctx.font = options.font;
    ctx.fillStyle = options.fill ?? 'currentColor';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const glyph of state.glyphs) {
        if (glyph.char.trim() === '')
            continue;
        drawGlyph(ctx, glyph.char, glyph.position.x, glyph.position.y, glyph.angle);
    }
    ctx.restore();
}
function drawGlyph(ctx, char, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(char, 0, 0);
    ctx.restore();
}
function drawDebugPath(ctx, pathData) {
    ctx.save();
    const path = new Path2D(pathData);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke(path);
    ctx.restore();
}
//# sourceMappingURL=canvas.js.map