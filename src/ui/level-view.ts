import { cellText, MAX_VALUE } from './cell.ts';

export type LevelView = 'fill' | 'dmx' | 'percent';

export const LEVEL_VIEWS: readonly LevelView[] = ['fill', 'dmx', 'percent'];

export const LEVEL_VIEW_LABELS: Readonly<Record<LevelView, string>> = {
  fill: 'fill',
  dmx: 'dmx',
  percent: '%',
};

const FULL_PERCENT = 100;

export const toPercent = (value: number): number =>
  Math.round((value * FULL_PERCENT) / MAX_VALUE);

export const levelText = (view: LevelView, value: number): string =>
  String(view === 'percent' ? toPercent(value) : value);

export const levelCellText = (
  view: LevelView,
  value: number,
  width: number,
): string =>
  view === 'fill'
    ? cellText(value, width)
    : levelText(view, value).padStart(width);
