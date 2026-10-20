import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cellText,
  colorFor,
  EMPTY_GLYPH,
  fillLevel,
  glyphFor,
  toHex,
} from '../../src/ui/cell.ts';
import { BLUE } from '../../src/ui/theme.ts';
import { BAR_1, BAR_4, FULL } from '../support/glyphs.ts';

describe('fillLevel', () => {
  it('is 0 only for value 0', () => {
    assert.equal(fillLevel(0), 0);
    assert.equal(fillLevel(1), 1);
  });

  it('steps up every 32 values', () => {
    assert.equal(fillLevel(32), 1);
    assert.equal(fillLevel(33), 2);
    assert.equal(fillLevel(224), 7);
    assert.equal(fillLevel(225), 8);
    assert.equal(fillLevel(255), 8);
  });
});

describe('glyphFor', () => {
  it('shows a thin underline for 0', () => {
    assert.equal(glyphFor(0), EMPTY_GLYPH);
    assert.equal(EMPTY_GLYPH, '_');
  });

  it('shows the lowest bar for 1 and the full block for 255', () => {
    assert.equal(glyphFor(1), BAR_1);
    assert.equal(glyphFor(128), BAR_4);
    assert.equal(glyphFor(255), FULL);
  });
});

describe('cellText', () => {
  it('puts a single underline in the middle of an empty cell', () => {
    assert.equal(cellText(0, 1), '_');
    assert.equal(cellText(0, 3), ' _ ');
    assert.equal(cellText(0, 4), ' _  ');
  });

  it('fills the whole width when the value is not 0', () => {
    assert.equal(cellText(1, 3), BAR_1.repeat(3));
    assert.equal(cellText(255, 2), FULL.repeat(2));
  });
});

describe('toHex', () => {
  it('writes each channel as two hex digits', () => {
    assert.equal(toHex({ r: 0, g: 10, b: 255 }), '#000aff');
  });
});

describe('colorFor', () => {
  it('uses the empty colour for 0', () => {
    assert.equal(colorFor(0, BLUE), BLUE.empty);
  });

  it('goes from the low colour at 1 to the high colour at 255', () => {
    assert.equal(colorFor(1, BLUE), toHex(BLUE.low));
    assert.equal(colorFor(255, BLUE), toHex(BLUE.high));
  });

  it('gets brighter as the value grows', () => {
    const blueOf = (value: number): number =>
      Number.parseInt(colorFor(value, BLUE).slice(5), 16);
    assert.ok(blueOf(64) < blueOf(128));
    assert.ok(blueOf(128) < blueOf(200));
  });
});
