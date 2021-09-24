function bytes(bits: number): number {
  return bits / 8;
}

function bits(bytes: number): number {
  return bytes * 8;
}

async function uptestOnce(): Promise<number> {
  const bottomKbps = 500 * 1024;
  const maxSeconds = 5;
  const dummy = new Uint8Array(Array(bytes(bottomKbps) * maxSeconds).keys());
  const start = performance.now();
  await fetch('/api/uptest', { method: 'POST', body: dummy });
  const time = performance.now() - start;
  const timeSeconds = time / 1000;
  return bits(dummy.length) / timeSeconds;
}

export default async function uptest(): Promise<number> {
  let bps = await uptestOnce();
  if (bps > 1000 * 1024) {
    bps = (bps + (await uptestOnce())) / 2;
  }
  if (bps > 1500 * 1024) {
    bps = bps * (2 / 3) + (await uptestOnce()) * (1 / 3);
  }
  return bps;
}
