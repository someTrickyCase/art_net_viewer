import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BLUE, DEFAULT_THEME, OLIVE } from '../../src/ui/theme.ts';
import type { Theme } from '../../src/ui/theme.ts';

const brightness = ({ low, high }: Theme): readonly [number, number] => [
  low.r + low.g + low.b,
  high.r + high.g + high.b,
];

describe('themes', () => {
  it('uses olive by default', () => {
    assert.equal(DEFAULT_THEME, OLIVE);
  });

  for (const theme of [OLIVE, BLUE]) {
    it(`${theme.name}: high values are brighter than low values`, () => {
      const [low, high] = brightness(theme);
      assert.ok(low < high);
    });
  }
});
