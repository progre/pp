import { Channel } from 'peercast-yp-channels-parser';

export default function pAtInsecure(now: Date): Channel {
  return {
    name: 'p@◆Insecure',
    id: '00000000000000000000000000000000',
    ip: '',
    url: 'https://p-at.net/index.txt',
    genre: '',
    desc: '通信は暗号化されていません',
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
