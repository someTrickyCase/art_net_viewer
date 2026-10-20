import type { Buffer } from 'node:buffer';

import { parseArtDmx } from '../protocol/art-dmx.ts';
import type { UniverseStore } from './universe-store.ts';

export type Clock = () => number;

export const createIngest =
  (store: UniverseStore, clock: Clock) =>
  (packet: Buffer, source: string): void => {
    const result = parseArtDmx(packet);
    if (result.ok) {
      store.update(result.value, source, clock());
    } else {
      store.countError(result.error);
    }
  };
