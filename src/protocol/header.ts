import type { Buffer } from 'node:buffer';

export const ARTNET_PORT = 6454;

export const OpCode = {
  Poll: 0x2000,
  PollReply: 0x2100,
  Dmx: 0x5000,
  Sync: 0x5200,
  Address: 0x6000,
  TimeCode: 0x9700,
} as const;

const ARTNET_ID = 'Art-Net\0';
const ID_LENGTH = 8;
const OPCODE_OFFSET = 8;
const HEADER_LENGTH = 10;

export const isArtNet = (packet: Buffer): boolean =>
  packet.length >= HEADER_LENGTH &&
  packet.toString('latin1', 0, ID_LENGTH) === ARTNET_ID;

export const readOpCode = (packet: Buffer): number =>
  packet.readUInt16LE(OPCODE_OFFSET);
