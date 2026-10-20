import { networkInterfaces } from 'node:os';
import { performance } from 'node:perf_hooks';
import process from 'node:process';

import { render } from 'ink';

import { readAdapters } from './net/adapters.ts';
import type { Adapter } from './net/adapters.ts';
import { ANY_ADDRESS, listen } from './net/listener.ts';
import { ARTNET_PORT } from './protocol/header.ts';
import { createIngest } from './state/ingest.ts';
import { createUniverseStore } from './state/universe-store.ts';
import { App } from './ui/app.tsx';

const clock = (): number => performance.now();
const store = createUniverseStore();
const readLocalAdapters = (): readonly Adapter[] =>
  readAdapters(networkInterfaces());

const app = render(
  <App
    store={store}
    clock={clock}
    address={ANY_ADDRESS}
    readAdapters={readLocalAdapters}
  />,
  { alternateScreen: true },
);

const failures: Error[] = [];
const fail = (error: Error): void => {
  failures.push(error);
  app.unmount();
};

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

try {
  const listener = await listen({
    address: ANY_ADDRESS,
    port: ARTNET_PORT,
    onPacket: createIngest(store, clock),
    onError: fail,
  });
  await app.waitUntilExit();
  await listener.close();
} catch (error) {
  fail(toError(error));
}

for (const failure of failures) {
  process.stderr.write(`art-net-viewer: ${failure.message}\n`);
  process.exitCode = 1;
}
