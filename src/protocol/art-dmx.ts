import type { Buffer } from 'node:buffer';

import { isArtNet, OpCode, readOpCode } from './header.ts';

export interface ArtDmx {
  readonly sequence: number;
  readonly physical: number;
  readonly net: number;
  readonly subNet: number;
  readonly universe: number;
  readonly portAddress: number;
  readonly data: Uint8Array;
}

export type ArtDmxError =
  | 'not-art-net'
  | 'not-dmx'
  | 'too-short'
  | 'old-protocol'
  | 'bad-length'
  | 'truncated';

export type ArtDmxResult =
  | { readonly ok: true; readonly value: ArtDmx }
  | { readonly ok: false; readonly error: ArtDmxError };

export const MAX_CHANNELS = 512;

const PROTOCOL_VERSION_OFFSET = 10;
const SEQUENCE_OFFSET = 12;
const PHYSICAL_OFFSET = 13;
const SUB_UNI_OFFSET = 14;
const NET_OFFSET = 15;
const LENGTH_OFFSET = 16;
const DATA_OFFSET = 18;

const MIN_PROTOCOL_VERSION = 14;
const MIN_LENGTH = 2;

const BITS_PER_BYTE = 8;
const BITS_PER_NIBBLE = 4;
const LOW_NIBBLE_MASK = 0x0f;
const NET_MASK = 0x7f;

const readLength = (packet: Buffer): number =>
  packet.readUInt16BE(LENGTH_OFFSET);

const findHeaderError = (packet: Buffer): ArtDmxError | null => {
  if (!isArtNet(packet)) {
    return 'not-art-net';
  }
  if (readOpCode(packet) !== OpCode.Dmx) {
    return 'not-dmx';
  }
  if (packet.length < DATA_OFFSET) {
    return 'too-short';
  }
  if (packet.readUInt16BE(PROTOCOL_VERSION_OFFSET) < MIN_PROTOCOL_VERSION) {
    return 'old-protocol';
  }
  return null;
};

const findLengthError = (packet: Buffer): ArtDmxError | null => {
  const length = readLength(packet);
  if (length < MIN_LENGTH || length > MAX_CHANNELS) {
    return 'bad-length';
  }
  if (packet.length < DATA_OFFSET + length) {
    return 'truncated';
  }
  return null;
};

const toArtDmx = (packet: Buffer): ArtDmx => {
  const subUni = packet.readUInt8(SUB_UNI_OFFSET);
  const net = packet.readUInt8(NET_OFFSET) & NET_MASK;
  const dataEnd = DATA_OFFSET + readLength(packet);
  return {
    sequence: packet.readUInt8(SEQUENCE_OFFSET),
    physical: packet.readUInt8(PHYSICAL_OFFSET),
    net,
    subNet: subUni >> BITS_PER_NIBBLE,
    universe: subUni & LOW_NIBBLE_MASK,
    portAddress: (net << BITS_PER_BYTE) | subUni,
    data: Uint8Array.from(packet.subarray(DATA_OFFSET, dataEnd)),
  };
};

export const parseArtDmx = (packet: Buffer): ArtDmxResult => {
  const error = findHeaderError(packet) ?? findLengthError(packet);
  if (error !== null) {
    return { ok: false, error };
  }
  return { ok: true, value: toArtDmx(packet) };
};
