import { GetServerSidePropsContext } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import { ServerResponse } from 'http';

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

function generateIndexTxt(): string {
  const now = new Date();
  return parser.stringify(
    [
      {
        name: 'p@◆Status',
        id: '00000000000000000000000000000000',
        ip: '',
        url: 'https://p-at.net/',
        genre: '',
        desc: 'まだ裏側ぜんぜんできてません',
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
        comment: `Updated at ${formatISO8601Like(now)}`,
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
