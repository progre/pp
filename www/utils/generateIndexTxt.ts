import * as parser from 'peercast-yp-channels-parser';
import { Channel } from 'peercast-yp-channels-parser';
import request from 'request';
import xml2js from 'xml2js';
import { ca, rootServerOrigin } from '../utils/env';

function formatISO8601Like(date: Date): string {
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Asia/Tokyo',
  });
  return (
    formatter
      .format(date)
      .replace(/\//g, '-')
      .replace(/(?<=\d) (?=\d)/, 'T') + '+09:00'
  );
}

function uptimeToString(uptime: number): string {
  const day = (uptime / 60 / 60 / 24) | 0;
  const hours = String(((uptime / 60 / 60) | 0) % 24).padStart(2, '0');
  const minutes = String(((uptime / 60) | 0) % 60).padStart(2, '0');
  const seconds = String(uptime % 60).padStart(2, '0');
  return `${day}日+${hours}:${minutes}:${seconds}`;
}

async function parseXml(xml: string, now: Date): Promise<readonly Channel[]> {
  let peercast;
  try {
    const root = await xml2js.parseStringPromise(xml);
    peercast = root.peercast;
  } catch (err) {
    if (err.stack?.startsWith('Error: Unexpected close tag')) {
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
    {
      name: 'p@◆Status',
      id: '00000000000000000000000000000000',
      ip: '',
      url: 'https://twitter.com/progremaster',
      genre: '',
      desc: 'まだまともにテストしていません',
      bandwidthType: '',
      listeners: -1,
      relays: -1,
      bitrate: 0,
      type: 'RAW',
      track: {
        creator: '',
        album: '',
        title: '',
        url: '',
      },
      createdAt: now.getTime(),
      comment: `Uptime: ${uptimeStr} Updated: ${formatISO8601Like(now)}`,
      direct: false,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(<any[]>peercast.channels_found[0].channel ?? []).map((x): Channel => {
      const channelAttr = x['$'];
      const trackAttr = x.track[0]['$'];
      const hostAttr = x.hits[0].host[0]['$'];
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
        ip: hostAttr.ip,
        url: channelAttr.url,
        genre,
        desc: channelAttr.desc,
        bandwidthType: '',
        listeners: naisho ? '-1' : hostAttr.listeners,
        relays: naisho ? '-1' : hostAttr.relays,
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
        direct: hostAttr.direct,
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
    console.error(err);
  }
  return [
    {
      name: 'p@◆Status',
      id: '00000000000000000000000000000000',
      ip: '',
      url: 'https://twitter.com/progremaster',
      genre: `■お知らせ: 障害が発生しています🥺。${reason}暫くチャンネルは建てられません。復旧までしばらくお待ちください…`,
      desc: '',
      bandwidthType: '',
      listeners: -1,
      relays: -1,
      bitrate: 0,
      type: 'RAW',
      track: {
        creator: '',
        album: '',
        title: '',
        url: '',
      },
      createdAt: now.getTime(),
      comment: `Updated: ${formatISO8601Like(now)}`,
      direct: false,
    },
  ];
}

export default async function generateIndexTxt(): Promise<string> {
  try {
    const res = await new Promise<request.Response>((resolve, reject) => {
      request.get(
        {
          url: `${rootServerOrigin}/admin?cmd=viewxml`,
          agentOptions: { ca },
        },
        (err, res) => {
          if (err != null) reject(err);
          resolve(res);
        }
      );
    });
    if (res.statusCode !== 200) {
      throw new Error(`${res.statusCode}`);
    }
    const xml = String(res.body);
    const now = new Date();
    const channels = await parseXml(xml, now);
    return parser.stringify(<Channel[]>channels, now);
  } catch (err: unknown) {
    const now = new Date();
    return parser.stringify(
      <Channel[]>errorIndexTxtChannels(<{ stack: string }>err, now),
      now
    );
  }
}
