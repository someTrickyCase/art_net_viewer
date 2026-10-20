import type { ArtDmx, ArtDmxError } from '../protocol/art-dmx.ts';

export interface SourceState {
  readonly address: string;
  readonly lastSeen: number;
}

export interface UniverseState {
  readonly portAddress: number;
  readonly net: number;
  readonly subNet: number;
  readonly universe: number;
  readonly data: Uint8Array;
  readonly sources: readonly SourceState[];
  readonly lastSeen: number;
  readonly packetCount: number;
  readonly fps: number;
}

export interface StoreSnapshot {
  readonly universes: readonly UniverseState[];
  readonly errors: ReadonlyMap<ArtDmxError, number>;
}

export interface UniverseStore {
  readonly update: (frame: ArtDmx, source: string, now: number) => void;
  readonly countError: (error: ArtDmxError) => void;
  readonly snapshot: (now: number) => StoreSnapshot;
  readonly clear: () => void;
}

export const FPS_WINDOW_MS = 1000;
const MS_PER_SECOND = 1000;

interface Entry {
  latest: ArtDmx;
  readonly sources: Map<string, number>;
  readonly arrivals: number[];
  packetCount: number;
  lastSeen: number;
}

const isRecent = (time: number, now: number): boolean =>
  time > now - FPS_WINDOW_MS;

const dropOld = (arrivals: number[], now: number): void => {
  const oldCount = arrivals.filter((time) => !isRecent(time, now)).length;
  arrivals.splice(0, oldCount);
};

const countFps = (arrivals: readonly number[], now: number): number => {
  const recent = arrivals.filter((time) => isRecent(time, now)).length;
  return (recent * MS_PER_SECOND) / FPS_WINDOW_MS;
};

const createEntry = (frame: ArtDmx, source: string, now: number): Entry => ({
  latest: frame,
  sources: new Map([[source, now]]),
  arrivals: [now],
  packetCount: 1,
  lastSeen: now,
});

const toState = (entry: Entry, now: number): UniverseState => ({
  portAddress: entry.latest.portAddress,
  net: entry.latest.net,
  subNet: entry.latest.subNet,
  universe: entry.latest.universe,
  data: entry.latest.data,
  sources: [...entry.sources].map(([address, lastSeen]) => ({
    address,
    lastSeen,
  })),
  lastSeen: entry.lastSeen,
  packetCount: entry.packetCount,
  fps: countFps(entry.arrivals, now),
});

const byPortAddress = (a: UniverseState, b: UniverseState): number =>
  a.portAddress - b.portAddress;

export const createUniverseStore = (): UniverseStore => {
  const entries = new Map<number, Entry>();
  const errors = new Map<ArtDmxError, number>();

  const update = (frame: ArtDmx, source: string, now: number): void => {
    const entry = entries.get(frame.portAddress);
    if (entry === undefined) {
      entries.set(frame.portAddress, createEntry(frame, source, now));
      return;
    }
    entry.latest = frame;
    entry.sources.set(source, now);
    entry.arrivals.push(now);
    dropOld(entry.arrivals, now);
    entry.packetCount += 1;
    entry.lastSeen = now;
  };

  const countError = (error: ArtDmxError): void => {
    errors.set(error, (errors.get(error) ?? 0) + 1);
  };

  const snapshot = (now: number): StoreSnapshot => ({
    universes: [...entries.values()]
      .map((entry) => toState(entry, now))
      .sort(byPortAddress),
    errors: new Map(errors),
  });

  const clear = (): void => {
    entries.clear();
    errors.clear();
  };

  return { update, countError, snapshot, clear };
};
