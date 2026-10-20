import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { paint } from '../../src/ui/paint.ts';

describe('paint', () => {
  it('always writes truecolor, even without a real terminal', () => {
    assert.equal(paint.hex('#0a141e')('x'), '\u001b[38;2;10;20;30mx\u001b[39m');
  });
});
