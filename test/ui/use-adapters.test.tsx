import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';

import { Text } from 'ink';
import { render } from 'ink-testing-library';
import type { ReactElement } from 'react';

import type { Adapter } from '../../src/net/adapters.ts';
import { useAdapters } from '../../src/ui/use-adapters.ts';
import type { AdapterReader } from '../../src/ui/use-adapters.ts';
import { KIRK_ADAPTERS } from '../support/adapters.ts';

const INTERVAL_MS = 10;

const Probe = ({ read }: { readonly read: AdapterReader }): ReactElement => {
  const adapters = useAdapters(read, INTERVAL_MS);
  return <Text>{adapters.map((adapter) => adapter.name).join(',')}</Text>;
};

describe('useAdapters', () => {
  it('reads the adapters right away', () => {
    const { lastFrame, unmount } = render(
      <Probe read={() => KIRK_ADAPTERS.slice(0, 1)} />,
    );
    assert.equal(lastFrame(), 'Ethernet');
    unmount();
  });

  it('picks up a changed adapter list on the next tick', async () => {
    let current: readonly Adapter[] = KIRK_ADAPTERS.slice(0, 1);
    const read = (): readonly Adapter[] => current;
    const { lastFrame, unmount } = render(<Probe read={read} />);
    current = KIRK_ADAPTERS.slice(1, 2);
    await sleep(INTERVAL_MS * 5);
    assert.equal(lastFrame(), 'WiFi');
    unmount();
  });
});
