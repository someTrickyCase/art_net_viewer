import type { LevelView } from './level-view.ts';

export interface GridLayout {
  readonly perRow: number;
  readonly cellWidth: number;
}

export const LABEL_WIDTH = 4;
export const MIN_CELL_WIDTH = 2;
export const CELL_WIDTH_SCALE = 0.7;
export const VALUE_CELL_WIDTH = 4;

const MIN_SLOT_WIDTH = 3;
const WIDE_ROW = 64;
const NORMAL_ROW = 32;
const NARROW_ROW = 16;
const ROW_SIZES = [WIDE_ROW, NORMAL_ROW, NARROW_ROW] as const;

const rowSizeFor = (space: number, minSlot: number): number =>
  ROW_SIZES.find((size) => space / size >= minSlot) ?? NARROW_ROW;

const fillLayout = (space: number): GridLayout => {
  const perRow = rowSizeFor(space, MIN_SLOT_WIDTH);
  const cellWidth = Math.max(
    MIN_CELL_WIDTH,
    Math.round((space / perRow) * CELL_WIDTH_SCALE),
  );
  return { perRow, cellWidth };
};

const valueLayout = (space: number): GridLayout => ({
  perRow: rowSizeFor(space, VALUE_CELL_WIDTH),
  cellWidth: VALUE_CELL_WIDTH,
});

export const layoutFor = (
  columns: number,
  view: LevelView = 'fill',
): GridLayout => {
  const space = columns - LABEL_WIDTH;
  return view === 'fill' ? fillLayout(space) : valueLayout(space);
};
