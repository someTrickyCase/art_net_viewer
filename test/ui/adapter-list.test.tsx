import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { render } from 'ink-testing-library';

import { createUniverseStore } from '../../src/state/universe-store.ts';
import type { UniverseState } from '../../src/state/universe-store.ts';
import { AdapterList } from '../../src/ui/adapter-list.tsx';
import { OLIVE } from '../../src/ui/theme.ts';
import { KIRK_ADAPTERS } from '../support/adapters.ts';
import { makeFrame } from '../support/frames.ts';

const makeUniverses = (): readonly UniverseState[] => {
  const store = createUniverseStore();
  store.update(makeFrame({ portAddress: 1 }), '2.0.0.10', 0);
  store.update(makeFrame({ portAddress: 2 }), '2.0.0.11', 0);
  store.update(makeFrame({ portAddress: 3 }), '127.0.0.1', 0);
  return store.snapshot(0).universes;
};

describe('AdapterList', () => {
  it('shows each adapter with its address and universe count', () => {
    const { lastFrame, unmount } = render(
      <AdapterList
        adapters={KIRK_ADAPTERS}
        universes={makeUniverses()}
        theme={OLIVE}
      />,
    );
    const lines = (lastFrame() ?? '').split('\n');
    assert.equal(lines.length, 3);
    assert.match(lines[0] ?? '', /Ethernet +2\.0\.0\.99\/8 +2 universes/u);
    assert.match(lines[1] ?? '', /WiFi +192\.168\.0\.112\/24 +no Art-Net/u);
    assert.match(
      lines[2] ?? '',
      /Loopback Pseudo-In\.\. +127\.0\.0\.1\/8 +1 u/u,
    );
    unmount();
  });

  it('matches the screenshot', (t) => {
    const { lastFrame, unmount } = render(
      <AdapterList
        adapters={KIRK_ADAPTERS}
        universes={makeUniverses()}
        theme={OLIVE}
      />,
    );
    t.assert.snapshot(lastFrame());
    unmount();
  });
});
