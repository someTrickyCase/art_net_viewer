import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  activityOf,
  adapterNameFor,
  countUniversesOn,
  formatAge,
  formatNetSubUni,
  formatSources,
  LIVE_MS,
  STALE_MS,
  truncate,
} from '../../src/ui/format.ts';
import { createUniverseStore } from '../../src/state/universe-store.ts';
import { KIRK_ADAPTERS } from '../support/adapters.ts';
import { makeFrame } from '../support/frames.ts';

describe('truncate', () => {
  it('keeps short text as it is', () => {
    assert.equal(truncate('WiFi', 10), 'WiFi');
  });

  it('cuts long text and ends it with two dots', () => {
    assert.equal(truncate('Loopback Pseudo-Interface 1', 10), 'Loopback..');
  });
});

describe('adapterNameFor', () => {
  const at = (address: string): { address: string; lastSeen: number } => ({
    address,
    lastSeen: 0,
  });

  it('names the adapter of the first sender', () => {
    const sources = [at('2.0.0.10'), at('192.168.0.5')];
    assert.equal(adapterNameFor(KIRK_ADAPTERS, sources), 'Ethernet');
  });

  it('shows ? when the sender is in no local subnet', () => {
    assert.equal(adapterNameFor(KIRK_ADAPTERS, [at('10.0.0.5')]), '?');
  });

  it('shows a dash when there is no sender', () => {
    assert.equal(adapterNameFor(KIRK_ADAPTERS, []), '-');
  });
});

describe('countUniversesOn', () => {
  it('counts universes with at least one sender on the adapter', () => {
    const store = createUniverseStore();
    store.update(makeFrame({ portAddress: 1 }), '2.0.0.10', 0);
    store.update(makeFrame({ portAddress: 2 }), '2.0.0.11', 0);
    store.update(makeFrame({ portAddress: 3 }), '127.0.0.1', 0);
    const { universes } = store.snapshot(0);
    const [ethernet, wifi, loopback] = KIRK_ADAPTERS;
    assert.ok(ethernet && wifi && loopback);
    assert.equal(countUniversesOn(ethernet, KIRK_ADAPTERS, universes), 2);
    assert.equal(countUniversesOn(wifi, KIRK_ADAPTERS, universes), 0);
    assert.equal(countUniversesOn(loopback, KIRK_ADAPTERS, universes), 1);
  });
});

describe('activityOf', () => {
  it('is live right after a packet', () => {
    assert.equal(activityOf(1000, 1000), 'live');
  });

  it('is stale from LIVE_MS on', () => {
    assert.equal(activityOf(0, LIVE_MS - 1), 'live');
    assert.equal(activityOf(0, LIVE_MS), 'stale');
  });

  it('is gone from STALE_MS on', () => {
    assert.equal(activityOf(0, STALE_MS - 1), 'stale');
    assert.equal(activityOf(0, STALE_MS), 'gone');
  });
});

describe('formatAge', () => {
  it('shows seconds with one decimal', () => {
    assert.equal(formatAge(0), '0.0s');
    assert.equal(formatAge(1234), '1.2s');
    assert.equal(formatAge(61_000), '61.0s');
  });

  it('never shows a negative age', () => {
    assert.equal(formatAge(-5), '0.0s');
  });
});

describe('formatSources', () => {
  it('shows a dash when there is no sender', () => {
    assert.equal(formatSources([]), '-');
  });

  it('shows one sender as its address', () => {
    const sources = [{ address: '2.0.0.10', lastSeen: 0 }];
    assert.equal(formatSources(sources), '2.0.0.10');
  });

  it('shows how many more senders there are', () => {
    const sources = [
      { address: '2.0.0.10', lastSeen: 0 },
      { address: '2.0.0.11', lastSeen: 0 },
      { address: '2.0.0.12', lastSeen: 0 },
    ];
    assert.equal(formatSources(sources), '2.0.0.10 +2');
  });
});

describe('formatNetSubUni', () => {
  it('joins Net, Sub-Net and Universe with dots', () => {
    const store = createUniverseStore();
    store.update(makeFrame({ portAddress: 529 }), '2.0.0.10', 0);
    const [state] = store.snapshot(0).universes;
    assert.ok(state);
    assert.equal(formatNetSubUni(state), '2.1.1');
  });
});
