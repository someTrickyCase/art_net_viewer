import { Box, Text } from 'ink';
import type { ReactElement } from 'react';

import { sceneRows } from './scene.ts';
import type { SceneMode } from './scene.ts';
import type { Theme } from './theme.ts';

interface SceneViewProps {
  readonly mode: SceneMode;
  readonly now: number;
  readonly width: number;
  readonly theme: Theme;
}

export const SceneView = (props: SceneViewProps): ReactElement => (
  <Box flexDirection="column">
    {sceneRows(props).map((line, row) => (
      <Text key={row} wrap="truncate">
        {line}
      </Text>
    ))}
  </Box>
);
