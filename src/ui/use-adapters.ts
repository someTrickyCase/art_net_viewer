import { useEffect, useState } from 'react';

import type { Adapter } from '../net/adapters.ts';

export type AdapterReader = () => readonly Adapter[];

export const useAdapters = (
  read: AdapterReader,
  intervalMs: number,
): readonly Adapter[] => {
  const [adapters, setAdapters] = useState(read);

  useEffect(() => {
    const timer = setInterval(() => {
      setAdapters(read());
    }, intervalMs);
    return () => {
      clearInterval(timer);
    };
  }, [read, intervalMs]);

  return adapters;
};
