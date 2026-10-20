import { Buffer } from 'node:buffer';

interface ArtDmxOptions {
  readonly opCode?: number;
  readonly protocolVersion?: number;
  readonly sequence?: number;
  readonly physical?: number;
  readonly subUni?: number;
  readonly net?: number;
  readonly length?: number;
  readonly data?: readonly number[];
}

export const makeArtDmx = ({
  opCode = 0x5000,
  protocolVersion = 14,
  sequence = 0,
  physical = 0,
  subUni = 0,
  net = 0,
  data = [0, 0],
  length = data.length,
}: ArtDmxOptions = {}): Buffer => {
  const packet = Buffer.alloc(18 + data.length);
  packet.write('Art-Net\0', 0, 'latin1');
  packet.writeUInt16LE(opCode, 8);
  packet.writeUInt16BE(protocolVersion, 10);
  packet.writeUInt8(sequence, 12);
  packet.writeUInt8(physical, 13);
  packet.writeUInt8(subUni, 14);
  packet.writeUInt8(net, 15);
  packet.writeUInt16BE(length, 16);
  Buffer.from(data).copy(packet, 18);
  return packet;
};
