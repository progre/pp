import { GetServerSidePropsContext } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import handler from '../../utils/handler';
import { vercel } from '../../utils/env';

const protocol = `http${vercel ? 's' : ''}`;

function insecureHeader(): string {
  const now = new Date();
  const channels = [
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
  ];
  return parser.stringify(channels, now);
}

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const originURL = `${protocol}://${req.headers.host}/index.txt`;
  const originRes = await fetch(originURL);
  const originText = await originRes.text();
  handler(res, insecureHeader() + '\n' + originText);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
