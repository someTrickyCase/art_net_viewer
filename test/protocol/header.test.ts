import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { describe, it } from 'node:test';

import { isArtNet, OpCode, readOpCode } from '../../src/protocol/header.ts';

const makeHeader = (opCode: number): Buffer => {
  const packet = Buffer.alloc(10);
  packet.write('Art-Net\0', 0, 'latin1');
  packet.writeUInt16LE(opCode, 8);
  return packet;
};

describe('isArtNet', () => {
  it('accepts a packet with the Art-Net ID', () => {
    assert.equal(isArtNet(makeHeader(OpCode.Dmx)), true);
  });

  it('rejects a wrong ID (case-sensitive)', () => {
    const packet = makeHeader(OpCode.Dmx);
    packet.write('art-net', 0, 'latin1');
    assert.equal(isArtNet(packet), false);
  });

  it('rejects a packet shorter than the header', () => {
    const packet = Buffer.from('Art-Net\0', 'latin1');
    assert.equal(isArtNet(packet), false);
  });
});

describe('readOpCode', () => {
  it('reads the OpCode as little-endian', () => {
    const packet = makeHeader(OpCode.Dmx);
    assert.deepEqual([packet[8], packet[9]], [0x00, 0x50]);
    assert.equal(readOpCode(packet), OpCode.Dmx);
  });
});
