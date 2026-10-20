import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { stripVTControlCharacters } from 'node:util';

import { render } from 'ink-testing-library';

import { ChannelGrid } from '../../src/ui/channel-grid.tsx';
import { BLUE } from '../../src/ui/theme.ts';
import { BAR_1, BAR_6, EMPTY, FULL } from '../support/glyphs.ts';

const MA2_LEVELS = [182, 99, 0, 0, 255, 0, 242, 26, 0, 13];

const fullUniverse = (): Uint8Array => {
  const data = new Uint8Array(512);
  data.set(MA2_LEVELS);
  return data;
};

const plainLines = (frame: string | undefined): string[] =>
  stripVTControlCharacters(frame ?? '').split('\n');

describe('ChannelGrid', () => {
  it('draws 16 rows of 32 channels at 100 columns', () => {
    const { lastFrame, unmount } = render(
      <ChannelGrid data={fullUniverse()} columns={100} theme={BLUE} />,
    );
    const lines = plainLines(lastFrame());
    assert.equal(lines.length, 16);
    assert.match(lines[0] ?? '', /^ {2}1 /u);
    assert.match(lines[1] ?? '', /^ 33 /u);
    assert.match(lines[15] ?? '', /^481 /u);
    unmount();
  });

  it('fills each cell by value: full block, bars and underlines', () => {
    const { lastFrame, unmount } = render(
      <ChannelGrid data={fullUniverse()} columns={100} theme={BLUE} />,
    );
    const firstRow = plainLines(lastFrame())[0] ?? '';
    const cells = firstRow.slice(4).match(/.{2}/gu) ?? [];
    const cellOf = (glyph: string): string => `${glyph} `;
    assert.equal(cells[0], cellOf(BAR_6));
    assert.equal(cells[2], cellOf(EMPTY));
    assert.equal(cells[4], cellOf(FULL));
    assert.equal(cells[9], cellOf(BAR_1));
    unmount();
  });

  it('makes cells wider on a wider terminal', () => {
    const { lastFrame, unmount } = render(
      <ChannelGrid data={fullUniverse()} columns={140} theme={BLUE} />,
    );
    const firstRow = plainLines(lastFrame())[0] ?? '';
    assert.ok(firstRow.startsWith(`  1 ${BAR_6}${BAR_6} `));
    unmount();
  });

  it('leaves channels outside the packet blank', () => {
    const { lastFrame, unmount } = render(
      <ChannelGrid
        data={Uint8Array.from([255, 255])}
        columns={100}
        theme={BLUE}
      />,
    );
    const lines = plainLines(lastFrame());
    const fullCells = `${FULL} ${FULL}`;
    assert.ok((lines[0] ?? '').startsWith(`  1 ${fullCells}`));
    assert.match(lines[0]?.slice(4 + fullCells.length) ?? '', /^ *$/u);
    assert.match(lines[1] ?? '', /^ 33 *$/u);
    unmount();
  });

  it('matches the colour screenshot', (t) => {
    const { lastFrame, unmount } = render(
      <ChannelGrid data={fullUniverse()} columns={100} theme={BLUE} />,
    );
    t.assert.snapshot(lastFrame());
    unmount();
  });
});
