export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface Theme {
  readonly name: string;
  readonly low: Rgb;
  readonly high: Rgb;
  readonly empty: string;
  readonly label: string;
  readonly accent: string;
}

export const OLIVE: Theme = {
  name: 'olive',
  low: { r: 70, g: 76, b: 22 },
  high: { r: 218, g: 228, b: 112 },
  empty: '#5c602c',
  label: '#7f8452',
  accent: '#b9ca4a',
};

export const BLUE: Theme = {
  name: 'blue',
  low: { r: 20, g: 60, b: 150 },
  high: { r: 150, g: 215, b: 255 },
  empty: '#2a3550',
  label: '#5a6a8a',
  accent: '#78aaff',
};

export const AMBER: Theme = {
  name: 'amber',
  low: { r: 90, g: 45, b: 5 },
  high: { r: 255, g: 205, b: 100 },
  empty: '#5a3c1e',
  label: '#8a6a4a',
  accent: '#ffb347',
};

export const RED: Theme = {
  name: 'red',
  low: { r: 80, g: 10, b: 10 },
  high: { r: 255, g: 95, b: 75 },
  empty: '#4a1c1c',
  label: '#7a4a4a',
  accent: '#ff5a4a',
};

export const MAGENTA: Theme = {
  name: 'magenta',
  low: { r: 70, g: 20, b: 90 },
  high: { r: 240, g: 145, b: 255 },
  empty: '#45284f',
  label: '#77608a',
  accent: '#d58cff',
};

export const MONO: Theme = {
  name: 'mono',
  low: { r: 60, g: 60, b: 60 },
  high: { r: 240, g: 240, b: 240 },
  empty: '#3a3a3a',
  label: '#777777',
  accent: '#dddddd',
};

export const THEMES: readonly Theme[] = [
  OLIVE,
  AMBER,
  BLUE,
  RED,
  MAGENTA,
  MONO,
];

export const DEFAULT_THEME = OLIVE;
