import * as parser from 'peercast-yp-channels-parser';
import { Channel } from 'peercast-yp-channels-parser';
import request_ from 'request';
import xml2js from 'xml2js';
import { promisify } from 'util';
import pAtStatus from '../channel/pAtStatus';
import { ca, rootServerOrigin } from '../env';
import { error, info } from './logger';

const request = promisify(request_);

const message = '通常営業';

function formatISO8601Like(date: Date): string {
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Asia/Tokyo',
  });
  const parts = formatter.formatToParts(date).map((x) => x.value);
  return (
    `${parts[0]}-${parts[2]}-${parts[4]}` +
    `T${parts[6].padStart(2, '0')}:${parts[8]}:${parts[10]}+09:00`
  );
}

function uptimeToString(uptime: number): string {
  const day = (uptime / 60 / 60 / 24) | 0;
  const hours = String(((uptime / 60 / 60) | 0) % 24).padStart(2, '0');
  const minutes = String(((uptime / 60) | 0) % 60).padStart(2, '0');
  const seconds = String(uptime % 60).padStart(2, '0');
  return `${day}:${hours}:${minutes}:${seconds}`;
}

async function parseXml(xml: string, now: Date): Promise<readonly Channel[]> {
  let peercast;
  try {
    const root = await xml2js.parseStringPromise(xml);
    peercast = root.peercast;
  } catch (err) {
    if (
      (<{ stack?: string }>err).stack?.startsWith('Error: Unexpected close tag')
    ) {
      throw new Error('xml_parse_error');
    }
    throw err;
  }
  if (peercast == null) {
    throw new Error('invalid_xml');
  }
  const uptime = peercast.servent[0]['$'].uptime;
  const uptimeStr = uptimeToString(uptime);
  return [
    pAtStatus(
      message,
      `Uptime: ${uptimeStr} Updated: ${formatISO8601Like(now)}`,
      now
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(<any[]>peercast.channels_found[0].channel ?? [])
      .filter((x) => {
        const hitsAttr = x.hits?.[0]?.$;
        const newest = parseInt(hitsAttr?.newest, 10);
        if (Number.isNaN(newest)) {
          return false;
        }
        // hosts = 0 かつ newest != 0 は異常値なのでスキップする
        return parseInt(hitsAttr?.hosts, 10) > 0 || newest === 0;
      })
      .map((x): Channel => {
        const channelAttr = x['$'];
        if (x.track == null) {
          error('x.track is undefined:');
          error(JSON.stringify(x));
        }
        if (x.hits == null) {
          error('x.hits is undefined:');
          error(JSON.stringify(x));
        }
        const trackAttr = x.track[0]['$'];
        const hostAttr = x.hits[0].host?.[0]['$'] ?? null;
        const genreSrc: string = channelAttr.genre;
        let genre;
        let naisho;
        if (genreSrc.startsWith('pp?')) {
          genre = /pp\?(.*)/.exec(genreSrc)?.[1] ?? '';
          naisho = true;
        } else if (genreSrc.startsWith('pp')) {
          genre = /pp(.*)/.exec(genreSrc)?.[1] ?? '';
          naisho = false;
        } else {
          genre = genreSrc;
          naisho = false;
        }
        return {
          name: channelAttr.name,
          id: channelAttr.id,
          ip: hostAttr?.ip ?? '',
          url: channelAttr.url,
          genre,
          desc: channelAttr.desc,
          bandwidthType: '',
          listeners: naisho ? -1 : Number(hostAttr?.listeners ?? '0'),
          relays: naisho ? -1 : Number(hostAttr?.relays ?? '0'),
          bitrate: channelAttr.bitrate,
          type: channelAttr.type,
          track: {
            creator: trackAttr.artist,
            album: trackAttr.album,
            title: trackAttr.title,
            url: trackAttr.contact,
            // genre: trackAttr.genre,
          },
          createdAt: now.getTime() - channelAttr.age * 1000,
          comment: channelAttr.comment,
          direct: hostAttr?.direct === '1',
        };
      }),
  ];
}

function errorIndexTxtChannels(
  err: { message?: string; stack?: string; code?: string },
  now: Date
): readonly Channel[] {
  let reason;
  if (err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    reason = '内部の通信に失敗しています(0)。';
  } else if (err.code === 'ECONNREFUSED') {
    reason = 'サーバーのプロセスが落ちています。';
  } else if (err.code === 'ENOTFOUND') {
    reason = 'サーバーがまるごと落ちています。';
  } else if (err.code === 'ETIMEDOUT') {
    reason = 'サーバーが過負荷になっているか落ちています。';
  } else if (err.message === 'xml_parse_error') {
    reason = '内部の通信に失敗しています(1)。';
  } else if (err.message === 'invalid_xml') {
    reason = '内部の通信に失敗しています(2)。';
  } else if (err.message === '401') {
    reason = '内部の通信に失敗しています(401)。';
  } else if (err.message === '502') {
    reason = 'PeerCast が落ちてます。';
  } else {
    reason = '原因調査中です。';
    error(
      `unknownerror: ${err.message}, ${err.code}, ${JSON.stringify(err)}, ${
        err.stack
      }`
    );
  }
  return [
    pAtStatus(
      `■お知らせ: 障害が発生しています🥺。${reason}暫くチャンネルは建てられません。復旧までしばらくお待ちください…`,
      `Updated: ${formatISO8601Like(now)}`,
      now
    ),
  ];
}

async function fetchSelfSigned(url: string): Promise<string> {
  const res = await request({ url, agentOptions: { ca } });
  if (res.statusCode !== 200) {
    throw new Error(`${res.statusCode}`);
  }
  return String(res.body);
}

export default async function generateIndexTxt(): Promise<string> {
  try {
    throw new Error();
    const xml = await fetchSelfSigned(`${rootServerOrigin}/admin?cmd=viewxml`);
    info(xml);
    const now = new Date();
    const channels = await parseXml(xml, now);
    const indexTxt = parser.stringify(<Channel[]>channels, now) + '\n';
    info(indexTxt);
    return indexTxt;
  } catch (err: unknown) {
    const now = new Date();
    return (
      parser.stringify(
        <Channel[]>errorIndexTxtChannels(<{ stack: string }>err, now),
        now
      ) + '\n'
    );
  }
}
