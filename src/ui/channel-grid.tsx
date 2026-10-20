import { Box, Text } from 'ink';
import type { ReactElement } from 'react';

import { MAX_CHANNELS } from '../protocol/art-dmx.ts';
import { cellText, colorFor } from './cell.ts';
import { LABEL_WIDTH, layoutFor } from './grid-layout.ts';
import type { GridLayout } from './grid-layout.ts';
import { paint } from './paint.ts';
import type { Theme } from './theme.ts';

const GAP = ' ';

const renderCell =
  (layout: GridLayout, theme: Theme) =>
  (value: number | undefined): string => {
    if (value === undefined) {
      return ' '.repeat(layout.cellWidth);
    }
    const text = cellText(value, layout.cellWidth - GAP.length);
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
}

export const ChannelGrid = ({
  data,
  columns,
  theme,
}: ChannelGridProps): ReactElement => {
  const layout = layoutFor(columns);
  const cell = renderCell(layout, theme);
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
