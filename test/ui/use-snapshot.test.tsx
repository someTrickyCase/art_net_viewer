import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';

import { Text } from 'ink';
import { render } from 'ink-testing-library';
import type { ReactElement } from 'react';

import { createUniverseStore } from '../../src/state/universe-store.ts';
import type { UniverseStore } from '../../src/state/universe-store.ts';
import { useSnapshot } from '../../src/ui/use-snapshot.ts';
import { makeFrame } from '../support/frames.ts';

const INTERVAL_MS = 10;

interface ProbeProps {
  readonly store: UniverseStore;
  readonly clock: () => number;
}

const Probe = ({ store, clock }: ProbeProps): ReactElement => {
  const { snapshot, now } = useSnapshot(store, clock, INTERVAL_MS);
  return (
    <Text>
      universes={snapshot.universes.length} now={now}
    </Text>
  );
};

describe('useSnapshot', () => {
  it('takes a first snapshot right away', () => {
    const store = createUniverseStore();
    const { lastFrame, unmount } = render(
      <Probe store={store} clock={() => 5} />,
    );
    assert.equal(lastFrame(), 'universes=0 now=5');
    unmount();
  });

  it('picks up store changes on the next tick', async () => {
    const store = createUniverseStore();
    let time = 0;
    const clock = (): number => time;
    const { lastFrame, unmount } = render(
      <Probe store={store} clock={clock} />,
    );
    store.update(makeFrame({ portAddress: 17 }), '2.0.0.10', 0);
    time = 100;
    await sleep(INTERVAL_MS * 5);
    assert.equal(lastFrame(), 'universes=1 now=100');
    unmount();
  });
});
