import * as parser from 'peercast-yp-channels-parser';
import pAtStatus from './channel/pAtStatus';
import { vercelEnv } from './env';
import fetchWithTimeout from './fetchWithTimeout';
import { info, warning } from './logger';

const protocol = `http${vercelEnv === 'local' ? '' : 's'}`;

let cachedIndexTxt: string | null = null;
let cachedTime = 0;

function timeoutMessage(): string {
  const now = new Date();
  const channels = [
    pAtStatus(
      'サーバーがばっふぁっふぁしてます(´・ω・｀)。暫くしてからやり直してください。',
      '',
      now
    ),
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
