import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ROCKET_FLYING, ROCKET_ON_PAD } from '../../src/ui/rocket.ts';

const allRows = [...ROCKET_ON_PAD, ...ROCKET_FLYING.flat()];
const [longFlame = [], shortFlame = []] = ROCKET_FLYING;

describe('ROCKET_ON_PAD', () => {
  it('stands 12 pixels tall, so it fills the 6-row scene', () => {
    assert.equal(ROCKET_ON_PAD.length, 12);
  });

  it('points up and stands on a wide pad', () => {
    assert.equal(ROCKET_ON_PAD[0], '   8');
    assert.equal(ROCKET_ON_PAD.at(-1), '1111111');
  });

  it('has a porthole', () => {
    assert.equal(ROCKET_ON_PAD[3], '  8 6');
  });
});

describe('ROCKET_FLYING', () => {
  it('has two flame frames of the same rocket', () => {
    assert.equal(ROCKET_FLYING.length, 2);
    assert.equal(longFlame.length, shortFlame.length);
    assert.notDeepEqual(longFlame, shortFlame);
  });

  it('flies nose first to the right, with the flame on the left', () => {
    const middle = longFlame[3] ?? '';
    assert.ok(middle.startsWith('6'));
    assert.ok(middle.endsWith('8'));
  });

  it('fits in the scene height', () => {
    assert.ok(longFlame.length <= 12);
  });
});

describe('rocket art', () => {
  it('uses only spaces and tones 1 to 9', () => {
    for (const row of allRows) {
      assert.match(row, /^[ 1-9]*$/u);
    }
  });

  it('has no trailing spaces', () => {
    for (const row of allRows) {
      assert.equal(row, row.trimEnd());
    }
  });
});
