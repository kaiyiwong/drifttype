import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parsePath, computePathLayout } from '../dist/core/path.js';
import type { MeasureFn } from '../dist/core/types.js';

// Fixed-width measure function for deterministic tests
const fixedMeasure: MeasureFn = (_char, _index) => ({ width: 10, height: 14 });

describe('parsePath', () => {
  it('parses a simple M L path', () => {
    const result = parsePath('M 0 0 L 100 0');
    assert.equal(result.segments.length, 2);
    assert.deepEqual(result.segments[0], { type: 'M', to: { x: 0, y: 0 } });
    assert.deepEqual(result.segments[1], { type: 'L', to: { x: 100, y: 0 } });
  });

  it('parses relative commands', () => {
    const result = parsePath('m 10 20 l 50 0');
    assert.equal(result.segments.length, 2);
    assert.deepEqual(result.segments[0], { type: 'M', to: { x: 10, y: 20 } });
    assert.deepEqual(result.segments[1], { type: 'L', to: { x: 60, y: 20 } });
  });

  it('parses a quadratic bezier', () => {
    const result = parsePath('M 0 0 Q 50 50 100 0');
    assert.equal(result.segments.length, 2);
    assert.equal(result.segments[1]!.type, 'Q');
    if (result.segments[1]!.type === 'Q') {
      assert.deepEqual(result.segments[1]!.cp, { x: 50, y: 50 });
      assert.deepEqual(result.segments[1]!.to, { x: 100, y: 0 });
    }
  });

  it('parses a cubic bezier', () => {
    const result = parsePath('M 0 0 C 25 50 75 50 100 0');
    assert.equal(result.segments.length, 2);
    assert.equal(result.segments[1]!.type, 'C');
    if (result.segments[1]!.type === 'C') {
      assert.deepEqual(result.segments[1]!.cp1, { x: 25, y: 50 });
      assert.deepEqual(result.segments[1]!.cp2, { x: 75, y: 50 });
      assert.deepEqual(result.segments[1]!.to, { x: 100, y: 0 });
    }
  });

  it('parses H and V commands', () => {
    const result = parsePath('M 0 0 H 100 V 50');
    assert.equal(result.segments.length, 3);
    assert.deepEqual(result.segments[1], { type: 'L', to: { x: 100, y: 0 } });
    assert.deepEqual(result.segments[2], { type: 'L', to: { x: 100, y: 50 } });
  });

  it('parses Z to close path', () => {
    const result = parsePath('M 0 0 L 100 0 L 100 100 Z');
    const last = result.segments[result.segments.length - 1]!;
    assert.equal(last.type, 'L');
    assert.deepEqual(last.to, { x: 0, y: 0 });
  });

  it('parses smooth cubic (S)', () => {
    const result = parsePath('M 0 0 C 10 20 40 20 50 0 S 90 -20 100 0');
    assert.equal(result.segments.length, 3);
    assert.equal(result.segments[2]!.type, 'C');
  });

  it('parses smooth quadratic (T)', () => {
    const result = parsePath('M 0 0 Q 25 50 50 0 T 100 0');
    assert.equal(result.segments.length, 3);
    assert.equal(result.segments[2]!.type, 'Q');
  });

  it('handles comma-separated coordinates', () => {
    const result = parsePath('M0,0 L100,50');
    assert.deepEqual(result.segments[0], { type: 'M', to: { x: 0, y: 0 } });
    assert.deepEqual(result.segments[1], { type: 'L', to: { x: 100, y: 50 } });
  });

  it('throws on unsupported commands', () => {
    assert.throws(() => parsePath('M 0 0 X 100'));
  });
});

describe('computePathLayout', () => {
  it('lays out characters along a straight line', () => {
    const result = computePathLayout('abc', 'M 0 0 L 200 0', fixedMeasure);

    assert.equal(result.glyphs.length, 3);
    assert.equal(result.text, 'abc');
    assert.equal(result.glyphs[0]!.char, 'a');
    assert.equal(result.glyphs[1]!.char, 'b');
    assert.equal(result.glyphs[2]!.char, 'c');
  });

  it('positions characters sequentially along the path', () => {
    const result = computePathLayout('ab', 'M 0 0 L 200 0', fixedMeasure);

    // First char centered at half its width (5), second at 15
    assert.ok(result.glyphs[0]!.position.x < result.glyphs[1]!.position.x);
    assert.equal(result.glyphs[0]!.position.y, 0);
    assert.equal(result.glyphs[1]!.position.y, 0);
  });

  it('rotation is 0 on a horizontal line', () => {
    const result = computePathLayout('ab', 'M 0 0 L 200 0', fixedMeasure);

    for (const g of result.glyphs) {
      assert.ok(Math.abs(g.angle) < 0.01, `Expected angle ~0, got ${g.angle}`);
    }
  });

  it('rotation is ~π/2 on a vertical line going down', () => {
    const result = computePathLayout('a', 'M 0 0 L 0 200', fixedMeasure);

    const angle = result.glyphs[0]!.angle;
    assert.ok(Math.abs(angle - Math.PI / 2) < 0.01, `Expected angle ~π/2, got ${angle}`);
  });

  it('reports correct text and path lengths', () => {
    const result = computePathLayout('abc', 'M 0 0 L 100 0', fixedMeasure);

    assert.equal(result.textLength, 30); // 3 chars × 10 width × spacing 1
    assert.ok(Math.abs(result.pathLength - 100) < 0.5);
  });

  it('applies spacing multiplier', () => {
    const normal = computePathLayout('ab', 'M 0 0 L 200 0', fixedMeasure, 1);
    const wide = computePathLayout('ab', 'M 0 0 L 200 0', fixedMeasure, 2);

    const normalGap = wide.glyphs[1]!.position.x - wide.glyphs[0]!.position.x;
    const wideGap = normal.glyphs[1]!.position.x - normal.glyphs[0]!.position.x;
    assert.ok(normalGap > wideGap);
  });

  it('center alignment centers text on path', () => {
    const result = computePathLayout('ab', 'M 0 0 L 200 0', fixedMeasure, 1, 0, 'center');

    const midText = (result.glyphs[0]!.position.x + result.glyphs[1]!.position.x) / 2;
    assert.ok(Math.abs(midText - 100) < 1, `Expected midpoint ~100, got ${midText}`);
  });

  it('end alignment places text at end of path', () => {
    const result = computePathLayout('ab', 'M 0 0 L 200 0', fixedMeasure, 1, 0, 'end');

    const lastGlyph = result.glyphs[1]!;
    assert.ok(lastGlyph.position.x > 180, `Expected near end, got ${lastGlyph.position.x}`);
  });

  it('applies startOffset', () => {
    const noOffset = computePathLayout('a', 'M 0 0 L 200 0', fixedMeasure, 1, 0);
    const withOffset = computePathLayout('a', 'M 0 0 L 200 0', fixedMeasure, 1, 50);

    assert.ok(
      withOffset.glyphs[0]!.position.x - noOffset.glyphs[0]!.position.x > 45,
      'startOffset should shift characters along path',
    );
  });

  it('handles curves without errors', () => {
    const result = computePathLayout(
      'Hello',
      'M 0 100 C 50 0 150 0 200 100',
      fixedMeasure,
    );

    assert.equal(result.glyphs.length, 5);
    for (const g of result.glyphs) {
      assert.ok(isFinite(g.position.x), 'x should be finite');
      assert.ok(isFinite(g.position.y), 'y should be finite');
      assert.ok(isFinite(g.angle), 'angle should be finite');
    }
  });

  it('handles empty string', () => {
    const result = computePathLayout('', 'M 0 0 L 100 0', fixedMeasure);
    assert.equal(result.glyphs.length, 0);
    assert.equal(result.textLength, 0);
  });
});
