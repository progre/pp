import { createHash } from 'crypto';
import { IncomingMessage } from 'http';
import querystring from 'querystring';
import { gaCidSalt, vercel } from '../utils/env';

const GA_TRACKING_ID = 'UA-43486767-10';

export async function pageView(
  host: string,
  page: string,
  ipSrc: IncomingMessage
): Promise<void> {
  console.log(
    ipSrc,
    ipSrc.headers['X-Forwarded-Host'],
    ipSrc.headers['x-forwarded-host'],
    ipSrc.headers['X-Forwarded-For'],
    ipSrc.headers['x-forwarded-for'],
    ipSrc.socket.remoteAddress
  );
  const ip =
    ipSrc.headers['X-Forwarded-For']?.toString() ??
    ipSrc.socket.remoteAddress ??
    '';
  const data = {
    v: '1',
    tid: GA_TRACKING_ID,
    cid: createHash('sha256')
      .update(ip + gaCidSalt)
      .digest('base64'),
    t: 'pageview',
    dh: host,
    dp: page,
  };
  const query = querystring.stringify(data);
  const res = await fetch(
    `https://www.google-analytics.com/${
      vercel ? 'debug/' : 'debug/'
    }collect?${query}`
  );
  if (!vercel) {
    console.log(ip, res.status, await res.text());
  }
}
