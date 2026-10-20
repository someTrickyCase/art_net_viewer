import type { Buffer } from 'node:buffer';
import { createSocket } from 'node:dgram';

export const ANY_ADDRESS = '0.0.0.0';

export interface ListenerOptions {
  readonly address: string;
  readonly port: number;
  readonly onPacket: (packet: Buffer, source: string) => void;
  readonly onError: (error: Error) => void;
}

export interface Listener {
  readonly port: number;
  readonly close: () => Promise<void>;
}

export const listen = (options: ListenerOptions): Promise<Listener> =>
  new Promise((resolve, reject) => {
    const socket = createSocket({ type: 'udp4', reuseAddr: true });

    const close = (): Promise<void> =>
      new Promise((done) => {
        socket.close(() => {
          done();
        });
      });

    socket.on('message', (packet, remote) => {
      options.onPacket(packet, remote.address);
    });
    socket.once('error', reject);
    socket.bind(options.port, options.address, () => {
      socket.off('error', reject);
      socket.on('error', options.onError);
      resolve({ port: socket.address().port, close });
    });
  });
