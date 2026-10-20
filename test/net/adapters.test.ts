import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  adapterFor,
  ipToNumber,
  prefixOf,
  readAdapters,
} from '../../src/net/adapters.ts';
import { ipv4, KIRK_ADAPTERS } from '../support/adapters.ts';

describe('ipToNumber', () => {
  it('turns an IPv4 address into one 32-bit number', () => {
    assert.equal(ipToNumber('0.0.0.0'), 0);
    assert.equal(ipToNumber('2.0.0.99'), 0x02000063);
    assert.equal(ipToNumber('255.255.255.255'), 0xffffffff);
  });
});

describe('prefixOf', () => {
  it('counts the 1-bits of a netmask', () => {
    assert.equal(prefixOf('255.0.0.0'), 8);
    assert.equal(prefixOf('255.255.255.0'), 24);
    assert.equal(prefixOf('255.255.255.255'), 32);
  });
});

describe('readAdapters', () => {
  it('keeps IPv4 only, real adapters first, then loopback', () => {
    assert.deepEqual(
      KIRK_ADAPTERS.map((a) => [a.name, a.address, a.prefix]),
      [
        ['Ethernet', '2.0.0.99', 8],
        ['WiFi', '192.168.0.112', 24],
        ['Loopback Pseudo-Interface 1', '127.0.0.1', 8],
      ],
    );
  });

  it('skips adapters without addresses', () => {
    assert.deepEqual(readAdapters({ Ghost: undefined }), []);
  });
});

describe('adapterFor', () => {
  it('finds the adapter whose subnet contains the sender', () => {
    assert.equal(adapterFor(KIRK_ADAPTERS, '2.0.0.10')?.name, 'Ethernet');
    assert.equal(adapterFor(KIRK_ADAPTERS, '192.168.0.1')?.name, 'WiFi');
    assert.equal(
      adapterFor(KIRK_ADAPTERS, '127.0.0.1')?.name,
      'Loopback Pseudo-Interface 1',
    );
  });

  it('returns undefined when no subnet matches', () => {
    assert.equal(adapterFor(KIRK_ADAPTERS, '10.0.0.5'), undefined);
  });

  it('prefers the most specific subnet', () => {
    const overlapping = readAdapters({
      Wide: [ipv4('2.0.0.99', '255.0.0.0')],
      Narrow: [ipv4('2.0.0.98', '255.255.255.0')],
    });
    assert.equal(adapterFor(overlapping, '2.0.0.10')?.name, 'Narrow');
    assert.equal(adapterFor(overlapping, '2.1.0.10')?.name, 'Wide');
  });
});
