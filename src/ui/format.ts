import { adapterFor } from '../net/adapters.ts';
import type { Adapter } from '../net/adapters.ts';
import type { SourceState, UniverseState } from '../state/universe-store.ts';

export type Activity = 'live' | 'stale' | 'gone';

export const LIVE_MS = 2500;
export const STALE_MS = 10_000;
const MS_PER_SECOND = 1000;

export const activityOf = (lastSeen: number, now: number): Activity => {
  const age = now - lastSeen;
  if (age < LIVE_MS) {
    return 'live';
  }
  if (age < STALE_MS) {
    return 'stale';
  }
  return 'gone';
};

export const formatAge = (ms: number): string =>
  `${(Math.max(0, ms) / MS_PER_SECOND).toFixed(1)}s`;

export const formatSources = (sources: readonly SourceState[]): string => {
  const [first, ...rest] = sources;
  if (first === undefined) {
    return '-';
  }
  if (rest.length === 0) {
    return first.address;
  }
  return `${first.address} +${String(rest.length)}`;
};

export const formatNetSubUni = (state: UniverseState): string =>
  [state.net, state.subNet, state.universe].join('.');

const ELLIPSIS = '..';

export const truncate = (text: string, width: number): string =>
  text.length <= width
    ? text
    : text.slice(0, width - ELLIPSIS.length) + ELLIPSIS;

export const UNKNOWN_ADAPTER = '?';

export const adapterNameFor = (
  adapters: readonly Adapter[],
  sources: readonly SourceState[],
): string => {
  const [first] = sources;
  if (first === undefined) {
    return '-';
  }
  return adapterFor(adapters, first.address)?.name ?? UNKNOWN_ADAPTER;
};

export const countUniversesOn = (
  adapter: Adapter,
  adapters: readonly Adapter[],
  universes: readonly UniverseState[],
): number =>
  universes.filter((state) =>
    state.sources.some(
      (source) => adapterFor(adapters, source.address) === adapter,
    ),
  ).length;
