import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { describe, it } from 'node:test';

import { createIngest } from '../../src/state/ingest.ts';
import { createUniverseStore } from '../../src/state/universe-store.ts';
import { makeArtDmx } from '../support/packets.ts';

describe('createIngest', () => {
  it('stores a valid ArtDmx packet with the clock time', () => {
    const store = createUniverseStore();
    const ingest = createIngest(store, () => 1234);
    ingest(makeArtDmx({ subUni: 0x11, data: [7, 8] }), '2.0.0.10');
    const [state] = store.snapshot(1234).universes;
    assert.ok(state);
    assert.equal(state.portAddress, 17);
    assert.equal(state.lastSeen, 1234);
    assert.deepEqual(state.sources, [{ address: '2.0.0.10', lastSeen: 1234 }]);
  });

  it('counts a broken packet as an error', () => {
    const store = createUniverseStore();
    const ingest = createIngest(store, () => 0);
    ingest(Buffer.from('not art-net at all!!'), '2.0.0.10');
    const snapshot = store.snapshot(0);
    assert.deepEqual(snapshot.universes, []);
    assert.equal(snapshot.errors.get('not-art-net'), 1);
  });
});
