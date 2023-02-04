import { Channel } from 'peercast-yp-channels-parser';

export default function pAtInsecure(now: Date): Channel {
  return {
    name: 'p@◆Warning',
    id: '00000000000000000000000000000000',
    ip: '',
    url: 'https://p-at.net/',
    genre: '',
    desc: 'この URL は廃止されます。http://p-at.net/ に修正してください。',
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
  };
}
