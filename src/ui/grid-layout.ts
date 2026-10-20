export interface GridLayout {
  readonly perRow: number;
  readonly cellWidth: number;
}

export const LABEL_WIDTH = 4;
export const MIN_CELL_WIDTH = 2;
export const CELL_WIDTH_SCALE = 0.7;

const MIN_SLOT_WIDTH = 3;
const WIDE_ROW = 64;
const NORMAL_ROW = 32;
const NARROW_ROW = 16;
const ROW_SIZES = [WIDE_ROW, NORMAL_ROW, NARROW_ROW] as const;

export const layoutFor = (columns: number): GridLayout => {
  const space = columns - LABEL_WIDTH;
  const perRow =
    ROW_SIZES.find((size) => space / size >= MIN_SLOT_WIDTH) ?? NARROW_ROW;
  const slot = space / perRow;
  const cellWidth = Math.max(
    MIN_CELL_WIDTH,
    Math.round(slot * CELL_WIDTH_SCALE),
  );
  return { perRow, cellWidth };
};
