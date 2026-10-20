import { themeColorAt } from './cell.ts';
import { paint } from './paint.ts';
import type { Theme } from './theme.ts';

export type Tone = number | null;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export const MIN_TONE = 1;
export const MAX_TONE = 9;
export const TRANSPARENT = ' ';
export const PIXELS_PER_CELL = 2;

const UPPER_HALF_BLOCK = 0x2580;
const LOWER_HALF_BLOCK = 0x2584;
const UPPER_HALF = String.fromCodePoint(UPPER_HALF_BLOCK);
const LOWER_HALF = String.fromCodePoint(LOWER_HALF_BLOCK);

export const toneAt = (art: readonly string[], x: number, y: number): Tone => {
  const pixel = art[y]?.[x] ?? TRANSPARENT;
  return pixel === TRANSPARENT ? null : Number(pixel);
};

export const toneColor = (tone: number, theme: Theme): string =>
  themeColorAt(theme, (tone - MIN_TONE) / (MAX_TONE - MIN_TONE));

export const artWidth = (art: readonly string[]): number =>
  Math.max(0, ...art.map((row) => row.length));

export const rotateClockwise = (art: readonly string[]): string[] =>
  Array.from({ length: artWidth(art) }, (_line, y) =>
    Array.from(
      { length: art.length },
      (_pixel, x) => art[art.length - 1 - x]?.[y] ?? TRANSPARENT,
    )
      .join('')
      .trimEnd(),
  );

export const placeArt = (
  art: readonly string[],
  at: Point,
  size: Size,
): string[] =>
  Array.from({ length: size.height }, (_line, y) =>
    Array.from(
      { length: size.width },
      (_pixel, x) => art[y - at.y]?.[x - at.x] ?? TRANSPARENT,
    ).join(''),
  );

const halfBlockCell =
  (theme: Theme) =>
  (top: Tone, bottom: Tone): string => {
    if (top === null) {
      return bottom === null
        ? TRANSPARENT
        : paint.hex(toneColor(bottom, theme))(LOWER_HALF);
    }
    const upper = paint.hex(toneColor(top, theme));
    return bottom === null
      ? upper(UPPER_HALF)
      : upper.bgHex(toneColor(bottom, theme))(UPPER_HALF);
  };

export const halfBlockCells = (
  art: readonly string[],
  theme: Theme,
): string[][] => {
  const width = artWidth(art);
  const cell = halfBlockCell(theme);
  const renderRow = (row: number): string[] => {
    const top = row * PIXELS_PER_CELL;
    return Array.from({ length: width }, (_, x) =>
      cell(toneAt(art, x, top), toneAt(art, x, top + 1)),
    );
  };
  return Array.from(
    { length: Math.ceil(art.length / PIXELS_PER_CELL) },
    (_, row) => renderRow(row),
  );
};

export const halfBlockRows = (art: readonly string[], theme: Theme): string[] =>
  halfBlockCells(art, theme).map((cells) => cells.join(''));
