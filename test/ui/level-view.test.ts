import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  LEVEL_VIEW_LABELS,
  LEVEL_VIEWS,
  levelCellText,
  levelText,
  toPercent,
} from '../../src/ui/level-view.ts';
import { BAR_4 } from '../support/glyphs.ts';

describe('LEVEL_VIEWS', () => {
  it('goes fill, dmx, percent', () => {
    assert.deepEqual(LEVEL_VIEWS, ['fill', 'dmx', 'percent']);
  });

  it('labels percent as %', () => {
    assert.equal(LEVEL_VIEW_LABELS.percent, '%');
  });
});

describe('toPercent', () => {
  it('maps 0 to 0 and 255 to 100', () => {
    assert.equal(toPercent(0), 0);
    assert.equal(toPercent(255), 100);
  });

  it('rounds to the nearest whole percent, like MA2', () => {
    assert.equal(toPercent(128), 50);
    assert.equal(toPercent(1), 0);
    assert.equal(toPercent(3), 1);
  });
});

describe('levelText', () => {
  it('shows the raw DMX value', () => {
    assert.equal(levelText('dmx', 255), '255');
    assert.equal(levelText('dmx', 0), '0');
  });

  it('shows percent', () => {
    assert.equal(levelText('percent', 255), '100');
    assert.equal(levelText('percent', 64), '25');
  });
});

describe('levelCellText', () => {
  it('draws bars in the fill view', () => {
    assert.equal(levelCellText('fill', 128, 2), BAR_4.repeat(2));
  });

  it('right-aligns numbers in the value views', () => {
    assert.equal(levelCellText('dmx', 7, 3), '  7');
    assert.equal(levelCellText('dmx', 255, 3), '255');
    assert.equal(levelCellText('percent', 128, 3), ' 50');
  });
});
