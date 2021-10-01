import { AbortController } from 'node-abort-controller';
import * as parser from 'peercast-yp-channels-parser';
import { vercelEnv } from './env';
import { info, warning } from './logger';

const protocol = `http${vercelEnv === 'local' ? '' : 's'}`;

let cachedIndexTxt: string | null = null;
let cachedTime = 0;

async function fetchWithTimeout(
  url: string,
  timeout: number
): Promise<Response> {
  const abortController = new AbortController();
  const handle = setTimeout(() => {
    abortController.abort();
  }, timeout);
  const signal = abortController.signal;
  const res = await fetch(url, { signal });
  clearTimeout(handle);
  return res;
}

function timeoutMessage(): string {
  const now = new Date();
  const channels = [
    {
      name: 'p@◆Status',
      id: '00000000000000000000000000000000',
      ip: '',
      url: 'https://twitter.com/progremaster',
      genre: '',
      desc: 'サーバーがばっふぁっふぁしてます(´・ω・｀)。暫くしてからやり直してください。',
      bandwidthType: '',
      listeners: -9,
      relays: -9,
      bitrate: 0,
      type: 'RAW',
      track: {
        creator: '',
        album: '',
        title: '',
        url: '',
      },
      createdAt: now.getTime(),
      comment: '',
      direct: false,
    },
  ];
  return parser.stringify(channels, now) + '\n';
}

export default async function fetchIndexTxt(
  host: string
): Promise<{ status: number; contentType: string; body: string }> {
  if (cachedIndexTxt != null && Date.now() < cachedTime + 60 * 1000) {
    const body = cachedIndexTxt;
    return { status: 200, contentType: 'text/plain; charset=UTF-8', body };
  }
  console.log('Cache refresh');
  try {
    const originURL = `${protocol}://${host}/_internal/index.txt`;
    const originRes = await fetchWithTimeout(originURL, 8000);
    const body = await originRes.text();
    const vercelCache = originRes.headers.get('x-vercel-cache');
    console.log(vercelCache);
    if (vercelCache === 'HIT') {
      cachedIndexTxt = body;
      cachedTime = Date.now();
    }
    const contentType = originRes.headers.get('Content-Type') ?? '';
    return { status: originRes.status, contentType, body };
  } catch (x) {
    const err = <{ name?: string }>x;
    if (err.name !== 'AbortError') {
      throw err;
    }
    info('Response is too late. /_internal/index.txt');
    let body;
    if (cachedIndexTxt != null) {
      body = cachedIndexTxt;
    } else {
      warning('No cache.');
      body = timeoutMessage();
    }
    return { status: 200, contentType: 'text/plain; charset=UTF-8', body };
  }
}
