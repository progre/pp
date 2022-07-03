import { Socket } from 'node:net';
import { promisify } from 'node:util';

interface AtomParent {
  readonly identifier: string;
  readonly children: readonly Atom[];
}

interface AtomChild {
  readonly identifier: string;
  readonly data: ArrayBuffer;
}

type Atom = AtomParent | AtomChild;

function getIdentifier(data: ArrayBuffer): string | null {
  let identifier = '';
  const u8 = new Uint8Array(data);
  try {
    for (let i = 0; i < 4; i++) {
      identifier += String.fromCodePoint(u8[i]);
    }
  } catch (err) {
    return null;
  }
  return identifier;
}

function readAtom(data: ArrayBuffer): [Atom | null, number] {
  let idx = 0;
  const identifier = getIdentifier(data);
  if (identifier == null) {
    return [null, 0];
  }
  idx += 4;

  const lengthSrc = new Uint32Array(data.slice(idx, idx + 4))[0];
  idx += 4;
  const isParent = (lengthSrc & 0x80000000) != 0;
  const length = lengthSrc & 0x7fffffff;
  if (length > 1024 * 1024) {
    return [null, idx]; // length too long
  }
  if (isParent) {
    const children = [];
    for (let i = 0; i < length; i++) {
      const [child, length] = readAtom(data.slice(idx));
      idx += length;
      if (child == null) {
        return [null, idx];
      }
      children.push(child);
    }
    return [
      {
        identifier,
        children,
      },
      idx,
    ];
  }
  return [
    {
      identifier,
      data: data.slice(idx, idx + length),
    },
    idx,
  ];
}

async function writeAtom(socket: Socket, atom: Atom): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    socket.write(atom.identifier, 'utf8', (err) => {
      if (err != null) {
        reject(err);
        return;
      }
      resolve();
    });
  });

  const write = promisify(socket.write.bind(socket));

  if ('children' in atom) {
    const length = 0x80000000 | atom.children.length;
    const ab = new ArrayBuffer(4);
    const buf = new Uint32Array(ab);
    buf[0] = length;
    await write(new Uint8Array(ab));
    for (const child of atom.children) {
      await writeAtom(socket, child);
    }
  } else {
    const ab = new ArrayBuffer(4);
    const buf = new Uint32Array(ab);
    buf[0] = atom.data.byteLength;
    await write(new Uint8Array(ab));
    await write(new Uint8Array(atom.data));
  }
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.byteLength);
  const u8 = new Uint8Array(ab);
  for (let i = 0; i < buf.byteLength; i++) {
    u8[i] = buf[i];
  }
  return ab;
}

function generateSid(): ArrayBuffer {
  const buf = new Uint32Array(4);
  for (let i = 0; i < 4; i++) {
    buf[i] = Math.random() * 2 ** 32;
  }
  return buf.buffer;
}

export default async function handshake(socketAddr: string): Promise<boolean> {
  return new Promise((resolve, _reject) => {
    const client = new Socket();
    client.setTimeout(1000, () => client.destroy());
    const separate = socketAddr.lastIndexOf(':');
    const ip = socketAddr.slice(0, separate);
    const port = Number(socketAddr.slice(separate + 1));

    client.on('error', (_err) => {
      resolve(false);
      client.destroy();
    });
    client.on('data', async (data) => {
      const [atom, _] = readAtom(toArrayBuffer(data));
      if (atom == null || atom.identifier !== 'oleh') {
        client.destroy();
        resolve(false);
        return;
      }
      await writeAtom(client, {
        identifier: 'quit',
        data: Uint32Array.from([1009]).buffer,
      });
      client.destroy();
      resolve(true);
    });
    client.on('close', (_hadError) => {
      resolve(false);
    });
    client.connect(port, ip, async () => {
      await writeAtom(client, {
        identifier: 'pcp\n',
        data: new Uint8Array([1, 0, 0, 0]),
      });
      await writeAtom(client, {
        identifier: 'helo',
        children: [
          {
            identifier: 'agnt',
            data: Uint8Array.from(
              [...'p@ YP/1.0'].map((x) => x.codePointAt(0) ?? 0)
            ).buffer,
          },
          {
            identifier: 'sid\0',
            data: generateSid(),
          },
        ],
      });
    });
  });
}
