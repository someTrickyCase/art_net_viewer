import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEFAULT_THEME, OLIVE, THEMES } from '../../src/ui/theme.ts';
import type { Theme } from '../../src/ui/theme.ts';

const brightness = ({ low, high }: Theme): readonly [number, number] => [
  low.r + low.g + low.b,
  high.r + high.g + high.b,
];

const HEX_COLOR = /^#[0-9a-f]{6}$/u;

describe('themes', () => {
  it('uses olive by default, as the first theme', () => {
    assert.equal(DEFAULT_THEME, OLIVE);
    assert.equal(THEMES[0], OLIVE);
  });

  it('has six themes with different names', () => {
    const names = THEMES.map((theme) => theme.name);
    assert.deepEqual(names, [
      'olive',
      'amber',
      'blue',
      'red',
      'magenta',
      'mono',
    ]);
  });

  for (const theme of THEMES) {
    it(`${theme.name}: high values are brighter than low values`, () => {
      const [low, high] = brightness(theme);
      assert.ok(low < high);
    });

    it(`${theme.name}: text colours are valid hex colours`, () => {
      for (const color of [theme.empty, theme.label, theme.accent]) {
        assert.match(color, HEX_COLOR);
      }
    });

    it(`${theme.name}: channel values stay inside 0-255`, () => {
      for (const { r, g, b } of [theme.low, theme.high]) {
        for (const channel of [r, g, b]) {
          assert.ok(channel >= 0 && channel <= 255);
        }
      }
    });
  }
});
