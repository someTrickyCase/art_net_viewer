import { Box, Text, useApp, useInput, useStdin, useWindowSize } from 'ink';
import type { Key } from 'ink';
import { useState } from 'react';
import type { ReactElement } from 'react';

import { ARTNET_PORT } from '../protocol/header.ts';
import type { Clock } from '../state/ingest.ts';
import type { UniverseState, UniverseStore } from '../state/universe-store.ts';
import type { Adapter } from '../net/adapters.ts';
import { AdapterList } from './adapter-list.tsx';
import { ChannelGrid } from './channel-grid.tsx';
import { nextInCycle } from './cycle.ts';
import { LEVEL_VIEW_LABELS, LEVEL_VIEWS } from './level-view.ts';
import type { LevelView } from './level-view.ts';
import { adapterNameFor, formatNetSubUni, formatSources } from './format.ts';
import { sceneModeOf } from './scene.ts';
import { SceneView } from './scene-view.tsx';
import { resolveSelection, stepSelection } from './selection.ts';
import type { Selection } from './selection.ts';
import { DEFAULT_THEME, THEMES } from './theme.ts';
import type { Theme } from './theme.ts';
import { UniverseList } from './universe-list.tsx';
import { useAdapters } from './use-adapters.ts';
import type { AdapterReader } from './use-adapters.ts';
import { useSnapshot } from './use-snapshot.ts';

const UI_FPS = 15;
const MS_PER_SECOND = 1000;
export const SNAPSHOT_INTERVAL_MS = Math.round(MS_PER_SECOND / UI_FPS);

export const ADAPTER_REFRESH_MS = 2000;
const DEFAULT_COLUMNS = 80;
const NEXT = 1;
const PREVIOUS = -1;

const stepFor = (key: Key): number | null => {
  if (key.rightArrow) {
    return NEXT;
  }
  if (key.leftArrow) {
    return PREVIOUS;
  }
  return null;
};

const useColumns = (): number => {
  const { columns } = useWindowSize();
  return columns > 0 ? columns : DEFAULT_COLUMNS;
};

const LEFT_ARROW = 0x2190;
const RIGHT_ARROW = 0x2192;
const ARROWS = [LEFT_ARROW, RIGHT_ARROW]
  .map((code) => String.fromCodePoint(code))
  .join(' ');
const HELP_GAP = '   ';

export const helpLine = (theme: Theme, view: LevelView): string =>
  [
    `${ARROWS} universe`,
    `t theme: ${theme.name}`,
    `v levels: ${LEVEL_VIEW_LABELS[view]}`,
    'q quit',
  ].join(HELP_GAP);

interface UniverseViewProps {
  readonly state: UniverseState;
  readonly adapters: readonly Adapter[];
  readonly columns: number;
  readonly theme: Theme;
  readonly view: LevelView;
}

const UniverseView = ({
  state,
  adapters,
  columns,
  theme,
  view,
}: UniverseViewProps): ReactElement => (
  <Box width={columns} justifyContent="center" marginTop={1}>
    <Box flexDirection="column">
      <Text bold color={theme.accent}>
        Universe {state.portAddress} ({formatNetSubUni(state)}) from{' '}
        {formatSources(state.sources)} on{' '}
        {adapterNameFor(adapters, state.sources)}
      </Text>
      <ChannelGrid
        data={state.data}
        columns={columns}
        theme={theme}
        view={view}
      />
    </Box>
  </Box>
);

interface AppProps {
  readonly store: UniverseStore;
  readonly clock: Clock;
  readonly address: string;
  readonly readAdapters: AdapterReader;
}

export const App = ({
  store,
  clock,
  address,
  readAdapters,
}: AppProps): ReactElement => {
  const { exit } = useApp();
  const { isRawModeSupported } = useStdin();
  const columns = useColumns();
  const { snapshot, now } = useSnapshot(store, clock, SNAPSHOT_INTERVAL_MS);
  const adapters = useAdapters(readAdapters, ADAPTER_REFRESH_MS);
  const [selected, setSelected] = useState<Selection>(null);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [view, setView] = useState<LevelView>('fill');

  const { universes } = snapshot;
  const addresses = universes.map((state) => state.portAddress);
  const current = resolveSelection(addresses, selected);
  const shown = universes.find((state) => state.portAddress === current);

  useInput(
    (input, key) => {
      if (input === 'q') {
        exit();
        return;
      }
      if (input === 't') {
        setTheme((previous) => nextInCycle(THEMES, previous));
        return;
      }
      if (input === 'v') {
        setView((previous) => nextInCycle(LEVEL_VIEWS, previous));
        return;
      }
      const step = stepFor(key);
      if (step !== null) {
        setSelected(stepSelection(addresses, current, step));
      }
    },
    { isActive: isRawModeSupported },
  );

  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <Text bold color={theme.accent}>
          art-net-viewer
        </Text>
        <Text dimColor>
          listening on {address}:{ARTNET_PORT}
        </Text>
      </Box>
      <SceneView
        mode={sceneModeOf(universes, now)}
        now={now}
        width={columns}
        theme={theme}
      />
      <AdapterList adapters={adapters} universes={universes} theme={theme} />
      {universes.length === 0 ? (
        <Text dimColor>No Art-Net yet...</Text>
      ) : (
        <UniverseList
          universes={universes}
          adapters={adapters}
          now={now}
          selected={current}
        />
      )}
      {shown === undefined ? null : (
        <UniverseView
          state={shown}
          adapters={adapters}
          columns={columns}
          theme={theme}
          view={view}
        />
      )}
      <Text dimColor>{helpLine(theme, view)}</Text>
    </Box>
  );
};
