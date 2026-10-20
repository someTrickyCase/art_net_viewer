import type { ArtDmx } from '../../src/protocol/art-dmx.ts';

interface FrameOptions {
  readonly portAddress?: number;
  readonly sequence?: number;
  readonly data?: readonly number[];
}

export const makeFrame = ({
  portAddress = 0,
  sequence = 0,
  data = [0, 0],
}: FrameOptions = {}): ArtDmx => ({
  sequence,
  physical: 0,
  net: portAddress >> 8,
  subNet: (portAddress >> 4) & 0x0f,
  universe: portAddress & 0x0f,
  portAddress,
  data: Uint8Array.from(data),
});
