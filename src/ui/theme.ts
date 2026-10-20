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

export const DEFAULT_THEME = OLIVE;
