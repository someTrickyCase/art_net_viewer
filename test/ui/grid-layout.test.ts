import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { layoutFor } from '../../src/ui/grid-layout.ts';

describe('layoutFor', () => {
  it('uses 64 cells per row on a very wide terminal', () => {
    assert.deepEqual(layoutFor(200), { perRow: 64, cellWidth: 2 });
  });

  it('uses 32 cells per row on a wide terminal', () => {
    assert.deepEqual(layoutFor(140), { perRow: 32, cellWidth: 3 });
  });

  it('switches to 32 cells as soon as a 3-column slot fits', () => {
    assert.deepEqual(layoutFor(100), { perRow: 32, cellWidth: 2 });
  });

  it('uses 16 cells per row on an 80-column terminal', () => {
    assert.deepEqual(layoutFor(80), { perRow: 16, cellWidth: 3 });
  });

  it('makes cells about 30% thinner than their slot', () => {
    assert.equal(layoutFor(140).cellWidth, Math.round(4.25 * 0.7));
  });

  it('never makes cells thinner than 2 columns', () => {
    assert.deepEqual(layoutFor(30), { perRow: 16, cellWidth: 2 });
  });

  it('always divides 512 channels into whole rows', () => {
    for (const columns of [30, 80, 100, 140, 200, 400]) {
      assert.equal(512 % layoutFor(columns).perRow, 0);
    }
  });
});
