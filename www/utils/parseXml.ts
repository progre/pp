import { Channel } from 'peercast-yp-channels-parser';
import xml2js from 'xml2js';

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

export default async function parseXml(
  xml: string,
  now: Date
): Promise<Channel[]> {
  const { peercast } = await xml2js.parseStringPromise(xml);
  // console.log(peercast.channels_found[0].channel);
  const uptime = peercast.servent[0]['$'].uptime;
  const uptimeStr = `${(uptime / 60 / 60 / 24) | 0}日+${
    (uptime / 60 / 60) | 0
  }:${(uptime / 60) | 0}:${uptime % 60}`;
  console.log(peercast.channels_found);
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
    ...(<any[]>peercast.channels_found[0].channel).map((x): Channel => {
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
