import { Box, Text } from 'ink';
import type { ReactElement } from 'react';

import type { Adapter } from '../net/adapters.ts';
import type { UniverseState } from '../state/universe-store.ts';
import { countUniversesOn, truncate } from './format.ts';
import type { Theme } from './theme.ts';

const WIDTH = {
  name: 20,
  address: 19,
} as const;

const formatCount = (count: number): string => {
  if (count === 0) {
    return 'no Art-Net';
  }
  return count === 1 ? '1 universe' : `${String(count)} universes`;
};

interface AdapterListProps {
  readonly adapters: readonly Adapter[];
  readonly universes: readonly UniverseState[];
  readonly theme: Theme;
}

export const AdapterList = ({
  adapters,
  universes,
  theme,
}: AdapterListProps): ReactElement => (
  <Box flexDirection="column">
    {adapters.map((adapter) => {
      const count = countUniversesOn(adapter, adapters, universes);
      const line = [
        truncate(adapter.name, WIDTH.name).padEnd(WIDTH.name),
        `${adapter.address}/${String(adapter.prefix)}`.padEnd(WIDTH.address),
        formatCount(count),
      ].join(' ');
      return (
        <Text
          key={`${adapter.name} ${adapter.address}`}
          color={count > 0 ? theme.accent : theme.label}
        >
          {`  ${line}`}
        </Text>
      );
    })}
  </Box>
);
