import type { NetworkInterfaceInfo } from 'node:os';

import { readAdapters } from '../../src/net/adapters.ts';
import type { Adapter, InterfaceTable } from '../../src/net/adapters.ts';

export const ipv4 = (
  address: string,
  netmask: string,
  internal = false,
): NetworkInterfaceInfo => ({
  address,
  netmask,
  family: 'IPv4',
  mac: '00:00:00:00:00:00',
  internal,
  cidr: null,
});

export const ipv6: NetworkInterfaceInfo = {
  address: 'fe80::1',
  netmask: 'ffff:ffff:ffff:ffff::',
  family: 'IPv6',
  mac: '00:00:00:00:00:00',
  internal: false,
  cidr: null,
  scopeid: 0,
};

export const KIRK_LAPTOP: InterfaceTable = {
  'Ethernet': [ipv6, ipv4('2.0.0.99', '255.0.0.0')],
  'WiFi': [ipv4('192.168.0.112', '255.255.255.0')],
  'Loopback Pseudo-Interface 1': [ipv4('127.0.0.1', '255.0.0.0', true)],
};

export const KIRK_ADAPTERS = readAdapters(KIRK_LAPTOP);

export const readKirkAdapters = (): readonly Adapter[] => KIRK_ADAPTERS;
