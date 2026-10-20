import type { Rgb, Theme } from './theme.ts';

export const MAX_VALUE = 255;
export const FILL_LEVELS = 8;
const VALUES_PER_LEVEL = 32;
const HEX_BASE = 16;
const HEX_DIGITS = 2;

const LOWER_ONE_EIGHTH_BLOCK = 0x2581;

export const EMPTY_GLYPH = '_';

const BLOCKS = Array.from({ length: FILL_LEVELS }, (_, level) =>
  String.fromCodePoint(LOWER_ONE_EIGHTH_BLOCK + level),
);

export const fillLevel = (value: number): number =>
  Math.ceil(value / VALUES_PER_LEVEL);

export const glyphFor = (value: number): string =>
  BLOCKS[fillLevel(value) - 1] ?? EMPTY_GLYPH;

const HALF = 2;

const centered = (glyph: string, width: number): string => {
  const left = Math.floor((width - glyph.length) / HALF);
  const right = width - glyph.length - left;
  return ' '.repeat(left) + glyph + ' '.repeat(right);
};

export const cellText = (value: number, width: number): string =>
  value === 0 ? centered(EMPTY_GLYPH, width) : glyphFor(value).repeat(width);

const mix = (from: number, to: number, amount: number): number =>
  Math.round(from + (to - from) * amount);

const toHexByte = (byte: number): string =>
  byte.toString(HEX_BASE).padStart(HEX_DIGITS, '0');

export const toHex = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b].map(toHexByte).join('')}`;

export const colorFor = (value: number, theme: Theme): string => {
  if (value === 0) {
    return theme.empty;
  }
  const amount = (value - 1) / (MAX_VALUE - 1);
  return toHex({
    r: mix(theme.low.r, theme.high.r, amount),
    g: mix(theme.low.g, theme.high.g, amount),
    b: mix(theme.low.b, theme.high.b, amount),
  });
};
