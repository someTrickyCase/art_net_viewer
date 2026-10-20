import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { nextInCycle } from '../../src/ui/cycle.ts';

describe('nextInCycle', () => {
  const items = ['a', 'b', 'c'];

  it('moves to the next item', () => {
    assert.equal(nextInCycle(items, 'a'), 'b');
  });

  it('goes back to the first item after the last', () => {
    assert.equal(nextInCycle(items, 'c'), 'a');
  });

  it('starts from the first item when the current one is unknown', () => {
    assert.equal(nextInCycle(items, 'x'), 'a');
  });

  it('keeps the current item when the list is empty', () => {
    assert.equal(nextInCycle([], 'x'), 'x');
  });
});
