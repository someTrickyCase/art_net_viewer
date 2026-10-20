import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { describe, it } from 'node:test';

import { parseArtDmx } from '../../src/protocol/art-dmx.ts';
import type { ArtDmx } from '../../src/protocol/art-dmx.ts';
import { makeArtDmx } from '../support/packets.ts';

const parseOk = (packet: Buffer): ArtDmx => {
  const result = parseArtDmx(packet);
  if (!result.ok) {
    assert.fail(`expected a valid ArtDmx packet, got "${result.error}"`);
  }
  return result.value;
};

const MA2_LEVELS = [182, 99, 0, 0, 255, 0, 242, 26, 0, 13];

describe('parseArtDmx', () => {
  it('parses a real MA2 onPC packet (net 2, sub 1, uni 1)', () => {
    const packet = makeArtDmx({
      sequence: 219,
      subUni: 0x11,
      net: 0x02,
      data: [...MA2_LEVELS, ...new Array<number>(502).fill(0)],
    });
    const dmx = parseOk(packet);
    assert.equal(dmx.sequence, 219);
    assert.equal(dmx.net, 2);
    assert.equal(dmx.subNet, 1);
    assert.equal(dmx.universe, 1);
    assert.equal(dmx.portAddress, 529);
    assert.equal(dmx.data.length, 512);
    assert.deepEqual([...dmx.data.subarray(0, 10)], MA2_LEVELS);
  });

  it('splits SubUni into Sub-Net (high) and Universe (low)', () => {
    const dmx = parseOk(makeArtDmx({ subUni: 0xb1 }));
    assert.equal(dmx.subNet, 11);
    assert.equal(dmx.universe, 1);
    assert.equal(dmx.portAddress, 177);
  });

  it('uses only 7 bits of Net', () => {
    const dmx = parseOk(makeArtDmx({ net: 0x82 }));
    assert.equal(dmx.net, 2);
    assert.equal(dmx.portAddress, 512);
  });

  it('reads the physical port', () => {
    assert.equal(parseOk(makeArtDmx({ physical: 3 })).physical, 3);
  });

  it('takes only Length bytes of data', () => {
    const packet = makeArtDmx({ data: [10, 20, 30, 40], length: 2 });
    assert.deepEqual([...parseOk(packet).data], [10, 20]);
  });

  it('copies the data out of the packet', () => {
    const packet = makeArtDmx({ data: [10, 20] });
    const dmx = parseOk(packet);
    packet.writeUInt8(99, 18);
    assert.equal(dmx.data[0], 10);
  });
});

describe('parseArtDmx errors', () => {
  const cases: readonly (readonly [string, Buffer, string])[] = [
    ['a wrong ID', Buffer.from('Hello, world!!!!!!!!'), 'not-art-net'],
    ['an ArtPoll packet', makeArtDmx({ opCode: 0x2000 }), 'not-dmx'],
    ['a cut header', makeArtDmx().subarray(0, 17), 'too-short'],
    ['protocol 13', makeArtDmx({ protocolVersion: 13 }), 'old-protocol'],
    ['Length 0', makeArtDmx({ data: [], length: 0 }), 'bad-length'],
    ['Length 513', makeArtDmx({ length: 513 }), 'bad-length'],
    ['missing data', makeArtDmx({ data: [1, 2], length: 4 }), 'truncated'],
  ];

  for (const [name, packet, error] of cases) {
    it(`rejects ${name} with "${error}"`, () => {
      assert.deepEqual(parseArtDmx(packet), { ok: false, error });
    });
  }
});
