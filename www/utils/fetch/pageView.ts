import { createHash } from 'crypto';
import { IncomingMessage } from 'http';
import querystring from 'querystring';
import { vercelEnv } from '../env';
import fetchWithTimeout from './fetchWithTimeout';

const GA_TRACKING_ID = 'UA-43486767-10';

export async function pageView(
  req: IncomingMessage,
  page: string
): Promise<void> {
  const ip =
    req.headers['x-nginx-real-ip'] ??
    req.headers['x-real-ip'] ??
    req.socket.remoteAddress ??
    '';
  const data = {
    v: '1',
    tid: GA_TRACKING_ID,
    cid: createHash('sha256')
      .update(ip + 'Lj5ZU7g9')
      .digest('base64'),
    uip: ip,
    t: 'pageview',
    dh: req.headers.host,
    dp: page,
  };
  const query = querystring.stringify(data);
  let res;
  try {
    res = await fetchWithTimeout(
      `https://www.google-analytics.com/${
        vercelEnv === 'production' ? '' : 'debug/'
      }collect?${query}`,
      8000
    );
  } catch (e) {
    const err = <{ name?: string }>e;
    if (err.name !== 'AbortError') {
      throw err;
    }
    console.error('Analytics timeout', query);
    return;
  }
  if (res.status !== 200) {
    console.error(await res.text());
  } else if (vercelEnv !== 'production') {
    console.log(ip, res.status, await res.text());
  }
}
