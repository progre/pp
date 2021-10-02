import { GetServerSidePropsContext } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import ContentEncoder from '../../utils/ContentEncoder';
import fetchIndexTxt from '../../utils/fetchIndexTxt';
import { pageView } from '../../utils/pageView';

function insecureHeader(): string {
  const now = new Date();
  const channels = [
    {
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
    },
  ];
  return parser.stringify(channels, now) + '\n';
}

export async function getServerSideProps({
  req,
  resolvedUrl,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  await Promise.all([
    pageView(req, resolvedUrl),
    (async () => {
      const { status, contentType, body } = await fetchIndexTxt(
        req.headers.host ?? ''
      );
      const encoder = new ContentEncoder(
        req.headers['accept-encoding'] as string | null
      );
      res.writeHead(status, [
        ['Content-Type', contentType],
        ...encoder.headers(),
      ]);
      await encoder.end(res, insecureHeader() + body);
    })(),
  ]);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
