import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { render } from 'ink-testing-library';

import { createUniverseStore } from '../../src/state/universe-store.ts';
import type { UniverseState } from '../../src/state/universe-store.ts';
import type { Selection } from '../../src/ui/selection.ts';
import { UniverseList } from '../../src/ui/universe-list.tsx';
import { KIRK_ADAPTERS } from '../support/adapters.ts';
import { makeFrame } from '../support/frames.ts';

const NOW = 20_000;

const makeUniverses = (): readonly UniverseState[] => {
  const store = createUniverseStore();
  store.update(makeFrame({ portAddress: 529 }), '2.0.0.10', NOW - 100);
  store.update(makeFrame({ portAddress: 17 }), '2.0.0.10', NOW - 4000);
  store.update(makeFrame({ portAddress: 17 }), '2.0.0.11', NOW - 3000);
  store.update(makeFrame({ portAddress: 0 }), '2.0.0.12', 0);
  return store.snapshot(NOW).universes;
};

const renderList = (selected: Selection): ReturnType<typeof render> =>
  render(
    <UniverseList
      universes={makeUniverses()}
      adapters={KIRK_ADAPTERS}
      now={NOW}
      selected={selected}
    />,
  );

describe('UniverseList', () => {
  it('shows one line per universe, sorted by address', () => {
    const { lastFrame, unmount } = renderList(null);
    const lines = (lastFrame() ?? '').split('\n');
    assert.equal(lines.length, 4);
    assert.match(lines[1] ?? '', /^ {2}0 .*gone$/u);
    assert.match(lines[2] ?? '', /^ {2}17 .*2\.0\.0\.10 \+1.*stale$/u);
    assert.match(lines[3] ?? '', /^ {2}529 .*2\.1\.1.*live$/u);
    unmount();
  });

  it('shows the adapter of the first sender', () => {
    const { lastFrame, unmount } = renderList(null);
    const lines = (lastFrame() ?? '').split('\n');
    assert.match(lines[0] ?? '', / ADAPTER /u);
    assert.match(lines[3] ?? '', /2\.0\.0\.10 +Ethernet /u);
    unmount();
  });

  it('marks the selected universe', () => {
    const { lastFrame, unmount } = renderList(17);
    const lines = (lastFrame() ?? '').split('\n');
    assert.match(lines[1] ?? '', /^ {2}0 /u);
    assert.match(lines[2] ?? '', /^> 17 /u);
    unmount();
  });

  it('matches the screenshot', (t) => {
    const { lastFrame, unmount } = renderList(529);
    t.assert.snapshot(lastFrame());
    unmount();
  });
});
