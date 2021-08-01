import { GetServerSidePropsContext } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import { ServerResponse } from 'http';

function generateIndexTxt(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'short',
    timeStyle: 'long',
    timeZone: 'Asia/Tokyo',
  });
  return parser.stringify(
    [
      {
        name: `p@◆Updated at ${formatter.format(now)} (${JSON.stringify(
          formatter.resolvedOptions()
        )})`,
        id: '00000000000000000000000000000000',
        ip: '',
        url: 'https://p-at.net/',
        genre: '',
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
        comment: '',
        direct: false,
      },
    ],
    now
  );
}

function handler(res: ServerResponse): void {
  const indexTxt = generateIndexTxt();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  res.shouldKeepAlive = false;
  res.writeHead(200);
  res.end(indexTxt);
}

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  handler(res);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
