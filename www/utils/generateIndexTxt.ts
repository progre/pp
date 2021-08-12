import * as parser from 'peercast-yp-channels-parser';
import { Channel } from 'peercast-yp-channels-parser';
import xml2js from 'xml2js';

const ROOT_SERVER_ORIGIN =
  process.env.ROOT_SERVER_ORIGIN ?? 'http://admin:hoge@192.168.10.102';

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

async function parseXml(xml: string, now: Date): Promise<Channel[]> {
  const { peercast } = await xml2js.parseStringPromise(xml);
  const uptime = peercast.servent[0]['$'].uptime;
  const day = (uptime / 60 / 60 / 24) | 0;
  const hours = String(((uptime / 60 / 60) | 0) % 24).padStart(2, '0');
  const minutes = String(((uptime / 60) | 0) % 60).padStart(2, '0');
  const seconds = uptime % 60;
  const uptimeStr = `${day}日+${hours}:${minutes}:${seconds}`;
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
      console.log(x, x.hits[0], x.track[0]);
      return {
        name: channelAttr.name,
        id: channelAttr.id,
        ip: hostAttr.ip,
        url: channelAttr.url,
        genre: channelAttr.genre,
        desc: channelAttr.desc,
        bandwidthType: '',
        listeners: hostAttr.listeners,
        relays: hostAttr.relays,
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

export default async function generateIndexTxt(
  insecure: boolean
): Promise<string> {
  const res = await fetch(`${ROOT_SERVER_ORIGIN}/admin?cmd=viewxml`);
  const now = new Date();
  const channels = [
    ...(!insecure
      ? []
      : [
          {
            name: 'p@◆Insecure',
            id: '00000000000000000000000000000000',
            ip: '',
            url: 'https://p-at.net/index.txt',
            genre: '',
            desc: '通信は暗号化されていません。',
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
            comment: '',
            direct: false,
          },
        ]),
    ...(await parseXml(await res.text(), now)),
  ];
  return parser.stringify(channels, now);
}
