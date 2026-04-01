import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { initPointerLayout, stepPointerLayout, isAtRest } from '../dist/core/pointer.js';
import type { MeasureFn } from '../dist/core/types.js';

const fixedMeasure: MeasureFn = (_char, _index) => ({ width: 10, height: 14 });

describe('initPointerLayout', () => {
  it('creates glyphs for each character', () => {
    const state = initPointerLayout('abc', fixedMeasure, 'repel');

    assert.equal(state.glyphs.length, 3);
    assert.equal(state.glyphs[0]!.char, 'a');
    assert.equal(state.glyphs[1]!.char, 'b');
    assert.equal(state.glyphs[2]!.char, 'c');
  });

  it('positions characters sequentially on x axis', () => {
    const state = initPointerLayout('ab', fixedMeasure, 'repel');

    assert.ok(state.glyphs[0]!.base.x < state.glyphs[1]!.base.x);
    assert.equal(state.glyphs[0]!.base.y, 0);
    assert.equal(state.glyphs[1]!.base.y, 0);
  });

  it('starts with position equal to base', () => {
    const state = initPointerLayout('a', fixedMeasure, 'repel');

    assert.deepEqual(state.glyphs[0]!.position, state.glyphs[0]!.base);
  });

  it('starts with zero velocity', () => {
    const state = initPointerLayout('a', fixedMeasure, 'repel');

    assert.deepEqual(state.glyphs[0]!.velocity, { x: 0, y: 0 });
  });

  it('sets the mode', () => {
    assert.equal(initPointerLayout('a', fixedMeasure, 'repel').mode, 'repel');
    assert.equal(initPointerLayout('a', fixedMeasure, 'attract').mode, 'attract');
    assert.equal(initPointerLayout('a', fixedMeasure, 'orbit').mode, 'orbit');
  });

  it('starts with null pointer', () => {
    const state = initPointerLayout('a', fixedMeasure, 'repel');
    assert.equal(state.pointer, null);
  });

  it('applies spacing multiplier', () => {
    const normal = initPointerLayout('ab', fixedMeasure, 'repel', 1);
    const wide = initPointerLayout('ab', fixedMeasure, 'repel', 2);

    const normalGap = normal.glyphs[1]!.base.x - normal.glyphs[0]!.base.x;
    const wideGap = wide.glyphs[1]!.base.x - wide.glyphs[0]!.base.x;
    assert.ok(wideGap > normalGap);
  });

  it('handles empty string', () => {
    const state = initPointerLayout('', fixedMeasure, 'repel');
    assert.equal(state.glyphs.length, 0);
  });
});

describe('stepPointerLayout', () => {
  it('returns new state without mutating input', () => {
    const state = initPointerLayout('a', fixedMeasure, 'repel');
    const origPos = { ...state.glyphs[0]!.position };
    const next = stepPointerLayout(state, { x: state.glyphs[0]!.base.x, y: 0 }, 100, 0.5);

    assert.deepEqual(state.glyphs[0]!.position, origPos, 'original state should not be mutated');
    assert.notEqual(state, next);
  });

  it('repel mode pushes characters away from pointer', () => {
    let state = initPointerLayout('a', fixedMeasure, 'repel');
    const baseX = state.glyphs[0]!.base.x;
    const pointer = { x: baseX - 20, y: 0 };

    // Run several steps so displacement is visible
    for (let i = 0; i < 60; i++) {
      state = stepPointerLayout(state, pointer, 100, 0.8, 1 / 60);
    }

    // Character should have moved away from pointer (to the right)
    assert.ok(
      state.glyphs[0]!.position.x > baseX,
      `Expected displacement away from pointer, got x=${state.glyphs[0]!.position.x}`,
    );
  });

  it('attract mode pulls characters toward pointer', () => {
    let state = initPointerLayout('a', fixedMeasure, 'attract');
    const baseX = state.glyphs[0]!.base.x;
    const pointer = { x: baseX + 30, y: 0 };

    for (let i = 0; i < 60; i++) {
      state = stepPointerLayout(state, pointer, 100, 0.8, 1 / 60);
    }

    // Character should have moved toward pointer (to the right)
    assert.ok(
      state.glyphs[0]!.position.x > baseX,
      `Expected movement toward pointer, got x=${state.glyphs[0]!.position.x}`,
    );
  });

  it('no displacement when pointer is null', () => {
    let state = initPointerLayout('a', fixedMeasure, 'repel');

    for (let i = 0; i < 30; i++) {
      state = stepPointerLayout(state, null, 100, 0.5, 1 / 60);
    }

    const g = state.glyphs[0]!;
    assert.ok(
      Math.abs(g.position.x - g.base.x) < 0.1,
      'Should stay at base with no pointer',
    );
  });

  it('no displacement when pointer is outside radius', () => {
    let state = initPointerLayout('a', fixedMeasure, 'repel');
    const pointer = { x: state.glyphs[0]!.base.x + 500, y: 0 };

    for (let i = 0; i < 60; i++) {
      state = stepPointerLayout(state, pointer, 100, 0.5, 1 / 60);
    }

    const g = state.glyphs[0]!;
    assert.ok(
      Math.abs(g.position.x - g.base.x) < 0.1,
      'Should stay at base when pointer is outside radius',
    );
  });

  it('characters settle back after pointer leaves', () => {
    let state = initPointerLayout('a', fixedMeasure, 'repel');
    const pointer = { x: state.glyphs[0]!.base.x - 10, y: 0 };

    // Displace
    for (let i = 0; i < 30; i++) {
      state = stepPointerLayout(state, pointer, 100, 0.8, 1 / 60);
    }

    assert.ok(
      Math.abs(state.glyphs[0]!.position.x - state.glyphs[0]!.base.x) > 1,
      'Should be displaced',
    );

    // Let settle with no pointer
    for (let i = 0; i < 300; i++) {
      state = stepPointerLayout(state, null, 100, 0.8, 1 / 60);
    }

    const g = state.glyphs[0]!;
    assert.ok(
      Math.abs(g.position.x - g.base.x) < 0.5,
      `Should settle back near base, got offset ${Math.abs(g.position.x - g.base.x)}`,
    );
  });
});

describe('isAtRest', () => {
  it('returns true for initial state', () => {
    const state = initPointerLayout('abc', fixedMeasure, 'repel');
    assert.equal(isAtRest(state), true);
  });

  it('returns false while characters are displaced', () => {
    let state = initPointerLayout('a', fixedMeasure, 'repel');
    const pointer = { x: state.glyphs[0]!.base.x - 10, y: 0 };

    for (let i = 0; i < 30; i++) {
      state = stepPointerLayout(state, pointer, 100, 0.8, 1 / 60);
    }

    assert.equal(isAtRest(state), false);
  });

  it('returns true after characters fully settle', () => {
    let state = initPointerLayout('a', fixedMeasure, 'repel');
    const pointer = { x: state.glyphs[0]!.base.x, y: 0 };

    for (let i = 0; i < 20; i++) {
      state = stepPointerLayout(state, pointer, 100, 0.5, 1 / 60);
    }

    for (let i = 0; i < 500; i++) {
      state = stepPointerLayout(state, null, 100, 0.5, 1 / 60);
    }

    assert.equal(isAtRest(state), true);
  });
});
