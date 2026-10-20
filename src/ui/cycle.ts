export const nextInCycle = <T>(items: readonly T[], current: T): T =>
  items[(items.indexOf(current) + 1) % items.length] ?? current;
