import { useCallback, useEffect, useState } from 'react';

import type { Clock } from '../state/ingest.ts';
import type { StoreSnapshot, UniverseStore } from '../state/universe-store.ts';

export interface TimedSnapshot {
  readonly snapshot: StoreSnapshot;
  readonly now: number;
}

export const useSnapshot = (
  store: UniverseStore,
  clock: Clock,
  intervalMs: number,
): TimedSnapshot => {
  const take = useCallback((): TimedSnapshot => {
    const now = clock();
    return { snapshot: store.snapshot(now), now };
  }, [store, clock]);

  const [timed, setTimed] = useState(take);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimed(take());
    }, intervalMs);
    return () => {
      clearInterval(timer);
    };
  }, [take, intervalMs]);

  return timed;
};
