import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createSocket } from 'node:dgram';
import { describe, it } from 'node:test';

import { listen } from '../../src/net/listener.ts';
import type { Listener } from '../../src/net/listener.ts';

const LOOPBACK = '127.0.0.1';

const noop = (): void => undefined;

const sendToLoopback = (port: number, packet: Buffer): Promise<void> =>
  new Promise((resolve, reject) => {
    const client = createSocket('udp4');
    client.send(packet, port, LOOPBACK, (error) => {
      client.close();
      if (error === null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });

describe('listen', () => {
  it('delivers a packet and its sender address', async () => {
    let listener: Listener | undefined;
    const received = new Promise<[Buffer, string]>((resolve) => {
      void listen({
        address: LOOPBACK,
        port: 0,
        onPacket: (packet, source) => {
          resolve([packet, source]);
        },
        onError: noop,
      }).then(async (opened) => {
        listener = opened;
        await sendToLoopback(opened.port, Buffer.from('hello'));
      });
    });

    const [packet, source] = await received;
    assert.equal(packet.toString(), 'hello');
    assert.equal(source, LOOPBACK);
    await listener?.close();
  });

  it('rejects when the address is not on this machine', async () => {
    await assert.rejects(
      listen({
        address: '203.0.113.1',
        port: 0,
        onPacket: noop,
        onError: noop,
      }),
      { code: 'EADDRNOTAVAIL' },
    );
  });
});
