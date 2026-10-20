import { Box, Text } from 'ink';
import type { ReactElement } from 'react';

import { MAX_CHANNELS } from '../protocol/art-dmx.ts';
import { colorFor } from './cell.ts';
import { LABEL_WIDTH, layoutFor } from './grid-layout.ts';
import type { GridLayout } from './grid-layout.ts';
import { levelCellText } from './level-view.ts';
import type { LevelView } from './level-view.ts';
import { paint } from './paint.ts';
import type { Theme } from './theme.ts';

const GAP = ' ';

const renderCell =
  (layout: GridLayout, theme: Theme, view: LevelView) =>
  (value: number | undefined): string => {
    if (value === undefined) {
      return ' '.repeat(layout.cellWidth);
    }
    const text = levelCellText(view, value, layout.cellWidth - GAP.length);
    return paint.hex(colorFor(value, theme))(text) + GAP;
  };

const renderLabel = (start: number, theme: Theme): string =>
  paint.hex(theme.label)(
    String(start + 1).padStart(LABEL_WIDTH - GAP.length) + GAP,
  );

interface ChannelGridProps {
  readonly data: Uint8Array;
  readonly columns: number;
  readonly theme: Theme;
  readonly view: LevelView;
}

export const ChannelGrid = ({
  data,
  columns,
  theme,
  view,
}: ChannelGridProps): ReactElement => {
  const layout = layoutFor(columns, view);
  const cell = renderCell(layout, theme, view);
  const starts = Array.from(
    { length: MAX_CHANNELS / layout.perRow },
    (_, row) => row * layout.perRow,
  );
  const renderRow = (start: number): string => {
    const channels = Array.from(
      { length: layout.perRow },
      (_, offset) => data[start + offset],
    );
    return renderLabel(start, theme) + channels.map(cell).join('');
  };

  return (
    <Box flexDirection="column">
      {starts.map((start) => (
        <Text key={start} wrap="truncate">
          {renderRow(start)}
        </Text>
      ))}
    </Box>
  );
};
