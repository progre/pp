import { GetServerSidePropsContext } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import { ServerResponse } from 'http';

function handler(res: ServerResponse) {
  // res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate"); // 24時間のキャッシュ
  res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  res.shouldKeepAlive = false;
  res.writeHead(200);
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'short',
    timeStyle: 'long',
  });
  res.end(
    parser.stringify(
      [
        {
          name: `p@◆Updated at ${formatter.format(now)}`,
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
    )
  );
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  handler(res);
  return { props: {} };
}

export default function Null() {
  return null;
}
