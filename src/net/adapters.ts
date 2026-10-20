import type { NetworkInterfaceInfo } from 'node:os';

export interface Adapter {
  readonly name: string;
  readonly address: string;
  readonly netmask: string;
  readonly prefix: number;
  readonly internal: boolean;
}

export type InterfaceTable = Readonly<
  Partial<Record<string, readonly NetworkInterfaceInfo[]>>
>;

const BITS_PER_OCTET = 8;
const BINARY = 2;

export const ipToNumber = (ip: string): number =>
  ip
    .split('.')
    .reduce((total, octet) => (total << BITS_PER_OCTET) + Number(octet), 0) >>>
  0;

export const prefixOf = (netmask: string): number =>
  ipToNumber(netmask).toString(BINARY).replaceAll('0', '').length;

const byExternalThenName = (a: Adapter, b: Adapter): number =>
  Number(a.internal) - Number(b.internal) || a.name.localeCompare(b.name);

export const readAdapters = (table: InterfaceTable): readonly Adapter[] =>
  Object.entries(table)
    .flatMap(([name, infos]) =>
      (infos ?? [])
        .filter((info) => info.family === 'IPv4')
        .map((info) => ({
          name,
          address: info.address,
          netmask: info.netmask,
          prefix: prefixOf(info.netmask),
          internal: info.internal,
        })),
    )
    .sort(byExternalThenName);

const networkOf = (ip: string, netmask: string): number =>
  (ipToNumber(ip) & ipToNumber(netmask)) >>> 0;

export const contains = (adapter: Adapter, ip: string): boolean =>
  networkOf(ip, adapter.netmask) ===
  networkOf(adapter.address, adapter.netmask);

export const adapterFor = (
  adapters: readonly Adapter[],
  ip: string,
): Adapter | undefined =>
  adapters
    .filter((adapter) => contains(adapter, ip))
    .reduce<Adapter | undefined>(
      (best, adapter) =>
        best === undefined || adapter.prefix > best.prefix ? adapter : best,
      undefined,
    );
