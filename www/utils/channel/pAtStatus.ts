import { Channel } from 'peercast-yp-channels-parser';

export default function pAtStatus(
  desc: string,
  comment: string,
  now: Date
): Channel {
  return {
    name: 'p@◆Status',
    id: '00000000000000000000000000000000',
    ip: '',
    url: 'https://twitter.com/progremaster',
    genre: '',
    desc,
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
    comment,
    direct: false,
  };
}
