import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { stripVTControlCharacters } from 'node:util';

import {
  artWidth,
  halfBlockCells,
  halfBlockRows,
  MAX_TONE,
  MIN_TONE,
  placeArt,
  rotateClockwise,
  toneAt,
  toneColor,
} from '../../src/ui/pixel-art.ts';
import { BLUE } from '../../src/ui/theme.ts';
import { LOWER_HALF, UPPER_HALF } from '../support/glyphs.ts';

const BLUE_HIGH_FG = '38;2;150;215;255';
const BLUE_LOW_BG = '48;2;20;60;150';
const BLUE_LOW_FG = '38;2;20;60;150';

describe('toneAt', () => {
  const art = ['1 9'];

  it('reads a digit as its tone', () => {
    assert.equal(toneAt(art, 0, 0), 1);
    assert.equal(toneAt(art, 2, 0), 9);
  });

  it('treats a space as transparent', () => {
    assert.equal(toneAt(art, 1, 0), null);
  });

  it('treats pixels outside the art as transparent', () => {
    assert.equal(toneAt(art, 3, 0), null);
    assert.equal(toneAt(art, 0, 1), null);
  });
});

describe('toneColor', () => {
  it('maps the darkest tone to low and the brightest to high', () => {
    assert.equal(toneColor(MIN_TONE, BLUE), '#143c96');
    assert.equal(toneColor(MAX_TONE, BLUE), '#96d7ff');
  });
});

describe('artWidth', () => {
  it('is the length of the longest row', () => {
    assert.equal(artWidth(['9', '999', '99']), 3);
    assert.equal(artWidth([]), 0);
  });
});

describe('rotateClockwise', () => {
  it('turns the top edge into the right edge', () => {
    assert.deepEqual(rotateClockwise(['12', '34']), ['31', '42']);
  });

  it('swaps width and height', () => {
    assert.deepEqual(rotateClockwise(['123']), ['1', '2', '3']);
  });

  it('keeps holes and fills short rows with transparent pixels', () => {
    assert.deepEqual(rotateClockwise(['1', '23']), ['21', '3']);
    assert.deepEqual(rotateClockwise(['12', '']), [' 1', ' 2']);
  });

  it('comes back to the start after four turns', () => {
    const art = ['123', '4 6', '789'];
    const turned = [1, 2, 3, 4].reduce<readonly string[]>(
      (current) => rotateClockwise(current),
      art,
    );
    assert.deepEqual(turned, art);
  });
});

describe('placeArt', () => {
  const art = ['12', '34'];

  it('puts the art at a point on a bigger transparent canvas', () => {
    assert.deepEqual(placeArt(art, { x: 1, y: 1 }, { width: 4, height: 3 }), [
      '    ',
      ' 12 ',
      ' 34 ',
    ]);
  });

  it('cuts off the parts outside the canvas', () => {
    assert.deepEqual(placeArt(art, { x: -1, y: 0 }, { width: 2, height: 1 }), [
      '2 ',
    ]);
    assert.deepEqual(placeArt(art, { x: 1, y: -1 }, { width: 2, height: 2 }), [
      ' 3',
      '  ',
    ]);
  });
});

describe('halfBlockCells', () => {
  it('gives one string per terminal cell', () => {
    const cells = halfBlockCells(['9 ', '9 '], BLUE);
    const [first = []] = cells;
    assert.equal(cells.length, 1);
    assert.equal(first.length, 2);
    assert.equal(first[1], ' ');
  });
});

describe('halfBlockRows', () => {
  it('packs two pixel rows into one terminal row', () => {
    const rows = halfBlockRows(['9', '1', '9', '1'], BLUE);
    assert.equal(rows.length, 2);
  });

  it('paints the top pixel as text and the bottom as background', () => {
    const [row = ''] = halfBlockRows(['9', '1'], BLUE);
    assert.equal(stripVTControlCharacters(row), UPPER_HALF);
    assert.ok(row.includes(BLUE_HIGH_FG));
    assert.ok(row.includes(BLUE_LOW_BG));
  });

  it('uses only the upper half when the bottom is transparent', () => {
    const [row = ''] = halfBlockRows(['9', ' '], BLUE);
    assert.equal(stripVTControlCharacters(row), UPPER_HALF);
    assert.ok(!row.includes('48;2;'));
  });

  it('uses the lower half when the top is transparent', () => {
    const [row = ''] = halfBlockRows([' ', '1'], BLUE);
    assert.equal(stripVTControlCharacters(row), LOWER_HALF);
    assert.ok(row.includes(BLUE_LOW_FG));
  });

  it('leaves fully transparent cells as plain spaces', () => {
    assert.deepEqual(halfBlockRows(['  ', '  '], BLUE), ['  ']);
  });

  it('gives an odd last row a transparent bottom', () => {
    const rows = halfBlockRows(['9', '9', '9'], BLUE);
    assert.equal(rows.length, 2);
    assert.equal(stripVTControlCharacters(rows[1] ?? ''), UPPER_HALF);
  });

  it('pads short rows to the widest row', () => {
    const [row = ''] = halfBlockRows(['9', '99'], BLUE);
    assert.equal(stripVTControlCharacters(row), UPPER_HALF + LOWER_HALF);
  });
});
