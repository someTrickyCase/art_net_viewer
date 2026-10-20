import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createUniverseStore } from '../../src/state/universe-store.ts';
import type {
  StoreSnapshot,
  UniverseState,
} from '../../src/state/universe-store.ts';
import { makeFrame } from '../support/frames.ts';

const SENDER = '2.0.0.10';

const only = (snapshot: StoreSnapshot): UniverseState => {
  assert.equal(snapshot.universes.length, 1);
  const [state] = snapshot.universes;
  if (state === undefined) {
    assert.fail('expected one universe');
  }
  return state;
};

describe('createUniverseStore', () => {
  it('starts empty', () => {
    const snapshot = createUniverseStore().snapshot(0);
    assert.deepEqual(snapshot.universes, []);
    assert.equal(snapshot.errors.size, 0);
  });

  it('adds a universe on its first frame', () => {
    const store = createUniverseStore();
    store.update(makeFrame({ portAddress: 529, data: [182, 99] }), SENDER, 50);
    const state = only(store.snapshot(50));
    assert.equal(state.portAddress, 529);
    assert.equal(state.net, 2);
    assert.equal(state.subNet, 1);
    assert.equal(state.universe, 1);
    assert.deepEqual([...state.data], [182, 99]);
    assert.equal(state.lastSeen, 50);
    assert.equal(state.packetCount, 1);
    assert.deepEqual(state.sources, [{ address: SENDER, lastSeen: 50 }]);
  });

  it('keeps only the latest data of a universe', () => {
    const store = createUniverseStore();
    store.update(makeFrame({ data: [1, 2] }), SENDER, 0);
    store.update(makeFrame({ data: [3, 4] }), SENDER, 25);
    const state = only(store.snapshot(25));
    assert.deepEqual([...state.data], [3, 4]);
    assert.equal(state.packetCount, 2);
    assert.equal(state.lastSeen, 25);
  });

  it('sorts universes by Port-Address', () => {
    const store = createUniverseStore();
    for (const portAddress of [529, 17, 177]) {
      store.update(makeFrame({ portAddress }), SENDER, 0);
    }
    const order = store.snapshot(0).universes.map((u) => u.portAddress);
    assert.deepEqual(order, [17, 177, 529]);
  });

  it('tracks every sender of a universe separately', () => {
    const store = createUniverseStore();
    store.update(makeFrame(), '2.0.0.10', 0);
    store.update(makeFrame(), '2.0.0.11', 10);
    store.update(makeFrame(), '2.0.0.10', 20);
    assert.deepEqual(only(store.snapshot(20)).sources, [
      { address: '2.0.0.10', lastSeen: 20 },
      { address: '2.0.0.11', lastSeen: 10 },
    ]);
  });

  it('keeps a silent universe in the snapshot', () => {
    const store = createUniverseStore();
    store.update(makeFrame({ portAddress: 17 }), SENDER, 0);
    const state = only(store.snapshot(60_000));
    assert.equal(state.portAddress, 17);
    assert.equal(state.lastSeen, 0);
  });
});

describe('createUniverseStore fps', () => {
  const sendEvery = (
    store: ReturnType<typeof createUniverseStore>,
    stepMs: number,
    untilMs: number,
  ): void => {
    for (let time = 0; time <= untilMs; time += stepMs) {
      store.update(makeFrame(), SENDER, time);
    }
  };

  it('counts the packets of the last second', () => {
    const store = createUniverseStore();
    sendEvery(store, 25, 2000);
    assert.equal(only(store.snapshot(2000)).fps, 40);
  });

  it('falls to zero when the sender goes silent', () => {
    const store = createUniverseStore();
    sendEvery(store, 25, 2000);
    assert.equal(only(store.snapshot(2500)).fps, 20);
    assert.equal(only(store.snapshot(3000)).fps, 0);
  });
});

describe('createUniverseStore errors and reset', () => {
  it('counts parse errors by reason', () => {
    const store = createUniverseStore();
    store.countError('truncated');
    store.countError('truncated');
    store.countError('not-dmx');
    const { errors } = store.snapshot(0);
    assert.equal(errors.get('truncated'), 2);
    assert.equal(errors.get('not-dmx'), 1);
  });

  it('forgets everything on clear', () => {
    const store = createUniverseStore();
    store.update(makeFrame(), SENDER, 0);
    store.countError('truncated');
    store.clear();
    const snapshot = store.snapshot(0);
    assert.deepEqual(snapshot.universes, []);
    assert.equal(snapshot.errors.size, 0);
  });

  it('does not change an old snapshot on later updates', () => {
    const store = createUniverseStore();
    store.update(makeFrame({ data: [1, 1] }), SENDER, 0);
    const before = store.snapshot(0);
    store.update(makeFrame({ data: [9, 9] }), '2.0.0.99', 10);
    store.countError('truncated');
    const state = only(before);
    assert.deepEqual([...state.data], [1, 1]);
    assert.equal(state.packetCount, 1);
    assert.equal(state.sources.length, 1);
    assert.equal(before.errors.size, 0);
  });
});
