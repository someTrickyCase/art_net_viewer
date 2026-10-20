export type Selection = number | null;

export const resolveSelection = (
  addresses: readonly number[],
  selected: Selection,
): Selection => {
  if (selected !== null && addresses.includes(selected)) {
    return selected;
  }
  return addresses[0] ?? null;
};

export const stepSelection = (
  addresses: readonly number[],
  selected: Selection,
  step: number,
): Selection => {
  const current = resolveSelection(addresses, selected);
  if (current === null) {
    return null;
  }
  const index = addresses.indexOf(current);
  const count = addresses.length;
  return addresses[(index + step + count) % count] ?? null;
};
