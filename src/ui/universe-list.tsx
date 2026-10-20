import { Box, Text } from 'ink';
import type { ReactElement } from 'react';

import type { Adapter } from '../net/adapters.ts';
import type { UniverseState } from '../state/universe-store.ts';
import {
  activityOf,
  adapterNameFor,
  formatAge,
  formatNetSubUni,
  formatSources,
  truncate,
} from './format.ts';
import type { Activity } from './format.ts';
import type { Selection } from './selection.ts';

interface Cells {
  readonly addr: string;
  readonly netSubUni: string;
  readonly from: string;
  readonly adapter: string;
  readonly fps: string;
  readonly last: string;
  readonly status: string;
}

const WIDTH = {
  addr: 6,
  netSubUni: 12,
  from: 20,
  adapter: 14,
  fps: 5,
  last: 8,
} as const;

const COLOR: Readonly<Record<Activity, string>> = {
  live: 'green',
  stale: 'yellow',
  gone: 'red',
};

const HEADER: Cells = {
  addr: 'ADDR',
  netSubUni: 'NET.SUB.UNI',
  from: 'FROM',
  adapter: 'ADAPTER',
  fps: 'FPS',
  last: 'LAST',
  status: 'STATUS',
};

const toLine = (cells: Cells): string =>
  [
    cells.addr.padEnd(WIDTH.addr),
    cells.netSubUni.padEnd(WIDTH.netSubUni),
    cells.from.padEnd(WIDTH.from),
    truncate(cells.adapter, WIDTH.adapter).padEnd(WIDTH.adapter),
    cells.fps.padEnd(WIDTH.fps),
    cells.last.padEnd(WIDTH.last),
    cells.status,
  ].join(' ');

const toCells = (
  state: UniverseState,
  now: number,
  adapters: readonly Adapter[],
): Cells => ({
  addr: String(state.portAddress),
  netSubUni: formatNetSubUni(state),
  from: formatSources(state.sources),
  adapter: adapterNameFor(adapters, state.sources),
  fps: String(Math.round(state.fps)),
  last: formatAge(now - state.lastSeen),
  status: activityOf(state.lastSeen, now),
});

const SELECTED_MARK = '> ';
const UNSELECTED_MARK = '  ';

interface UniverseListProps {
  readonly universes: readonly UniverseState[];
  readonly adapters: readonly Adapter[];
  readonly now: number;
  readonly selected: Selection;
}

export const UniverseList = ({
  universes,
  adapters,
  now,
  selected,
}: UniverseListProps): ReactElement => (
  <Box flexDirection="column">
    <Text bold>{UNSELECTED_MARK + toLine(HEADER)}</Text>
    {universes.map((state) => {
      const isSelected = state.portAddress === selected;
      return (
        <Text
          key={state.portAddress}
          color={COLOR[activityOf(state.lastSeen, now)]}
          inverse={isSelected}
        >
          {(isSelected ? SELECTED_MARK : UNSELECTED_MARK) +
            toLine(toCells(state, now, adapters))}
        </Text>
      );
    })}
  </Box>
);
