import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveSelection, stepSelection } from '../../src/ui/selection.ts';

const ADDRESSES = [17, 177, 529];

describe('resolveSelection', () => {
  it('keeps a selection that still exists', () => {
    assert.equal(resolveSelection(ADDRESSES, 177), 177);
  });

  it('falls back to the first universe', () => {
    assert.equal(resolveSelection(ADDRESSES, null), 17);
    assert.equal(resolveSelection(ADDRESSES, 999), 17);
  });

  it('is null when there are no universes', () => {
    assert.equal(resolveSelection([], 17), null);
  });
});

describe('stepSelection', () => {
  it('moves to the next and previous universe', () => {
    assert.equal(stepSelection(ADDRESSES, 17, 1), 177);
    assert.equal(stepSelection(ADDRESSES, 177, -1), 17);
  });

  it('wraps around at both ends', () => {
    assert.equal(stepSelection(ADDRESSES, 529, 1), 17);
    assert.equal(stepSelection(ADDRESSES, 17, -1), 529);
  });

  it('starts from the first universe when nothing is selected', () => {
    assert.equal(stepSelection(ADDRESSES, null, 1), 177);
  });

  it('is null when there are no universes', () => {
    assert.equal(stepSelection([], null, 1), null);
  });
});
