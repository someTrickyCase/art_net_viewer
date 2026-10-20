import { rotateClockwise } from './pixel-art.ts';

const UPRIGHT = [
  '   8',
  '  887',
  '  876',
  '  8 6',
  '  876',
  '  876',
  '  876',
  ' 38763',
  '3387633',
  '3 454 3',
];

const LAUNCH_PAD = ['  111', '1111111'];

const FLAME_WIDTH = 5;
const FLAME_LONG = ['', '', '    7', '67999', '    7'];
const FLAME_SHORT = ['', '', '   69', '  799', '   69'];

const withFlame = (
  body: readonly string[],
  flame: readonly string[],
): string[] =>
  body.map((row, index) =>
    ((flame[index] ?? '').padEnd(FLAME_WIDTH) + row).trimEnd(),
  );

const FLYING_BODY = rotateClockwise(UPRIGHT);

export const ROCKET_ON_PAD: readonly string[] = [...UPRIGHT, ...LAUNCH_PAD];

export const ROCKET_FLYING: readonly (readonly string[])[] = [
  withFlame(FLYING_BODY, FLAME_LONG),
  withFlame(FLYING_BODY, FLAME_SHORT),
];
