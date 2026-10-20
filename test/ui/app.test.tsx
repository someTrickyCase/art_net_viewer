import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';

import { render } from 'ink-testing-library';

import { createUniverseStore } from '../../src/state/universe-store.ts';
import type { UniverseStore } from '../../src/state/universe-store.ts';
import { App, SNAPSHOT_INTERVAL_MS } from '../../src/ui/app.tsx';
import { readKirkAdapters } from '../support/adapters.ts';
import { makeFrame } from '../support/frames.ts';

const ADDRESS = '0.0.0.0';
const clock = (): number => 1000;
const RIGHT_ARROW = '\u001b[C';
const LEFT_ARROW = '\u001b[D';

const renderApp = (store: UniverseStore): ReturnType<typeof render> =>
  render(
    <App
      store={store}
      clock={clock}
      address={ADDRESS}
      readAdapters={readKirkAdapters}
    />,
  );

describe('App', () => {
  it('shows the title and where it listens', () => {
    const { lastFrame, unmount } = renderApp(createUniverseStore());
    const frame = lastFrame() ?? '';
    assert.match(frame, /art-net-viewer/u);
    assert.match(frame, /listening on 0\.0\.0\.0:6454/u);
    assert.match(frame, /No Art-Net yet/u);
    unmount();
  });

  it('lists every adapter, even without Art-Net', () => {
    const { lastFrame, unmount } = renderApp(createUniverseStore());
    const frame = lastFrame() ?? '';
    assert.match(frame, /Ethernet +2\.0\.0\.99\/8 +no Art-Net/u);
    assert.match(frame, /WiFi +192\.168\.0\.112\/24 +no Art-Net/u);
    unmount();
  });

  it('shows a universe after the next snapshot tick', async () => {
    const store = createUniverseStore();
    const { lastFrame, unmount } = renderApp(store);
    store.update(makeFrame({ portAddress: 529 }), '2.0.0.10', 1000);
    await sleep(SNAPSHOT_INTERVAL_MS * 2);
    const frame = lastFrame() ?? '';
    assert.match(frame, /529 .*2\.1\.1 .*2\.0\.0\.10 +Ethernet/u);
    assert.match(frame, /Ethernet +2\.0\.0\.99\/8 +1 universe/u);
    assert.doesNotMatch(frame, /No Art-Net yet/u);
    unmount();
  });

  it('shows the grid of the first universe with its adapter', () => {
    const store = createUniverseStore();
    store.update(makeFrame({ portAddress: 17 }), '2.0.0.10', 900);
    store.update(makeFrame({ portAddress: 529 }), '127.0.0.1', 900);
    const { lastFrame, unmount } = renderApp(store);
    const frame = lastFrame() ?? '';
    assert.match(frame, /> 17 /u);
    assert.match(
      frame,
      /Universe 17 \(0\.1\.1\) from 2\.0\.0\.10 on Ethernet/u,
    );
    unmount();
  });

  it('marks a sender outside every subnet with ?', () => {
    const store = createUniverseStore();
    store.update(makeFrame({ portAddress: 17 }), '10.0.0.5', 900);
    const { lastFrame, unmount } = renderApp(store);
    assert.match(lastFrame() ?? '', /10\.0\.0\.5 +\? /u);
    unmount();
  });

  it('switches universes with the arrow keys', async () => {
    const store = createUniverseStore();
    store.update(makeFrame({ portAddress: 17 }), '2.0.0.10', 900);
    store.update(makeFrame({ portAddress: 529 }), '2.0.0.11', 900);
    const { lastFrame, stdin, unmount } = renderApp(store);
    await sleep(SNAPSHOT_INTERVAL_MS);
    stdin.write(RIGHT_ARROW);
    await sleep(SNAPSHOT_INTERVAL_MS);
    assert.match(lastFrame() ?? '', /Universe 529 \(2\.1\.1\)/u);
    stdin.write(RIGHT_ARROW);
    await sleep(SNAPSHOT_INTERVAL_MS);
    assert.match(lastFrame() ?? '', /Universe 17 \(0\.1\.1\)/u);
    stdin.write(LEFT_ARROW);
    await sleep(SNAPSHOT_INTERVAL_MS);
    assert.match(lastFrame() ?? '', /Universe 529 \(2\.1\.1\)/u);
    unmount();
  });

  it('matches the screenshot with no Art-Net', (t) => {
    const { lastFrame, unmount } = renderApp(createUniverseStore());
    t.assert.snapshot(lastFrame());
    unmount();
  });

  it('matches the screenshot with one universe', (t) => {
    const store = createUniverseStore();
    store.update(makeFrame({ portAddress: 17 }), '2.0.0.10', 900);
    const { lastFrame, unmount } = renderApp(store);
    t.assert.snapshot(lastFrame());
    unmount();
  });
});
