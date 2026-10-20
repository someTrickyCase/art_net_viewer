import type { UniverseState } from '../state/universe-store.ts';
import { themeColorAt } from './cell.ts';
import { activityOf } from './format.ts';
import { paint } from './paint.ts';
import {
  artWidth,
  halfBlockCells,
  PIXELS_PER_CELL,
  placeArt,
  TRANSPARENT,
} from './pixel-art.ts';
import type { Point } from './pixel-art.ts';
import { ROCKET_FLYING, ROCKET_ON_PAD } from './rocket.ts';
import type { Theme } from './theme.ts';

export type SceneMode = 'flying' | 'waiting';

export const SCENE_ROWS = 6;
export const FLYING_WIDTH = Math.max(...ROCKET_FLYING.map(artWidth));
export const ON_PAD_WIDTH = artWidth(ROCKET_ON_PAD);
export const FLY_COLUMNS_PER_SECOND = 30;
export const FLICKER_MS = 100;
export const TWINKLE_MS = 2400;
export const STAR_SPACING = 7;
export const STAR_GLYPHS = [TRANSPARENT, '.', '+', '*'];

const MS_PER_SECOND = 1000;
const HALF = 2;
const CANVAS_HEIGHT = SCENE_ROWS * PIXELS_PER_CELL;
const FLYING_HEIGHT = Math.max(...ROCKET_FLYING.map((art) => art.length));
const FLYING_TOP = Math.floor((CANVAS_HEIGHT - FLYING_HEIGHT) / HALF);
const ON_PAD_TOP = CANVAS_HEIGHT - ROCKET_ON_PAD.length;

const TRAIL_GLYPH = '-';
const TRAIL_FIRST_ROW = 1;
const TRAIL_LAST_ROW = 4;
const TRAIL_BASE = 3;
const TRAIL_WOBBLE = 4;
const TRAIL_SKEW = 3;
const TRAIL_TICK_MS = 80;
const TRAIL_BRIGHTNESS = 0.6;

const HASH_PRIME = 0x9e3779b1;
const HASH_SHIFT = 16;

interface Sparkle {
  readonly x: number;
  readonly row: number;
  readonly glyph: string;
}

interface Star {
  readonly x: number;
  readonly row: number;
  readonly phase: number;
}

export const sceneModeOf = (
  universes: readonly UniverseState[],
  now: number,
): SceneMode =>
  universes.some((state) => activityOf(state.lastSeen, now) === 'live')
    ? 'flying'
    : 'waiting';

export const flightX = (now: number, width: number): number => {
  const travelled = Math.floor((now * FLY_COLUMNS_PER_SECOND) / MS_PER_SECOND);
  return (travelled % (width + FLYING_WIDTH)) - FLYING_WIDTH;
};

export const padX = (width: number): number =>
  Math.floor((width - ON_PAD_WIDTH) / HALF);

export const spritePosition = (
  mode: SceneMode,
  now: number,
  width: number,
): Point =>
  mode === 'flying'
    ? { x: flightX(now, width), y: FLYING_TOP }
    : { x: padX(width), y: ON_PAD_TOP };

export const spriteFrame = (
  mode: SceneMode,
  now: number,
): readonly string[] => {
  if (mode === 'waiting') {
    return ROCKET_ON_PAD;
  }
  const index = Math.floor(now / FLICKER_MS) % ROCKET_FLYING.length;
  return ROCKET_FLYING[index] ?? ROCKET_ON_PAD;
};

const hash = (seed: number): number => {
  const mixed = Math.imul(seed + 1, HASH_PRIME);
  return (mixed ^ (mixed >>> HASH_SHIFT)) >>> 0;
};

export const starsFor = (width: number): Star[] =>
  Array.from({ length: Math.floor(width / STAR_SPACING) }, (_, index) => ({
    x: hash(index * HALF) % width,
    row: hash(index * HALF + 1) % SCENE_ROWS,
    phase: hash(-index - 1) % TWINKLE_MS,
  }));

export const twinkleLevel = (star: Star, now: number): number => {
  const position = ((now + star.phase) % TWINKLE_MS) / TWINKLE_MS;
  const wave = 1 - Math.abs(position * HALF - 1);
  return Math.min(
    STAR_GLYPHS.length - 1,
    Math.floor(wave * wave * STAR_GLYPHS.length),
  );
};

const twinklesFor = (width: number, now: number, theme: Theme): Sparkle[] =>
  starsFor(width).flatMap((star) => {
    const level = twinkleLevel(star, now);
    if (level === 0) {
      return [];
    }
    const color = themeColorAt(theme, level / (STAR_GLYPHS.length - 1));
    const glyph = paint.hex(color)(STAR_GLYPHS[level] ?? TRANSPARENT);
    return [{ x: star.x, row: star.row, glyph }];
  });

const trailRows = Array.from(
  { length: TRAIL_LAST_ROW - TRAIL_FIRST_ROW + 1 },
  (_, index) => TRAIL_FIRST_ROW + index,
);

const trailFor = (spriteX: number, now: number, theme: Theme): Sparkle[] => {
  const tick = Math.floor(now / TRAIL_TICK_MS);
  return trailRows.flatMap((row) => {
    const length = TRAIL_BASE + ((tick + row * TRAIL_SKEW) % TRAIL_WOBBLE);
    return Array.from({ length }, (_, step) => {
      const fade = 1 - (step + 1) / (length + 1);
      const color = themeColorAt(theme, fade * TRAIL_BRIGHTNESS);
      return {
        x: spriteX - 1 - step,
        row,
        glyph: paint.hex(color)(TRAIL_GLYPH),
      };
    });
  });
};

const withSparkles = (
  cells: readonly (readonly string[])[],
  sparkles: readonly Sparkle[],
): string[] => {
  const byCell = new Map(
    sparkles.map((sparkle) => [
      `${String(sparkle.row)}:${String(sparkle.x)}`,
      sparkle.glyph,
    ]),
  );
  const pick = (cell: string, row: number, x: number): string =>
    cell === TRANSPARENT
      ? (byCell.get(`${String(row)}:${String(x)}`) ?? cell)
      : cell;
  return cells.map((line, row) =>
    line.map((cell, x) => pick(cell, row, x)).join(''),
  );
};

interface SceneInput {
  readonly mode: SceneMode;
  readonly now: number;
  readonly width: number;
  readonly theme: Theme;
}

export const sceneRows = ({
  mode,
  now,
  width,
  theme,
}: SceneInput): string[] => {
  const at = spritePosition(mode, now, width);
  const canvas = placeArt(spriteFrame(mode, now), at, {
    width,
    height: CANVAS_HEIGHT,
  });
  const sparkles =
    mode === 'flying'
      ? trailFor(at.x, now, theme)
      : twinklesFor(width, now, theme);
  return withSparkles(halfBlockCells(canvas, theme), sparkles);
};
