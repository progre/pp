import { ServerResponse } from 'http';
import { Readable } from 'stream';
import { promisify } from 'util';
import zlib from 'zlib';
import { GetServerSidePropsContext } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import { vercel } from '../../utils/env';
import { pageView } from '../../utils/pageView';
import { FetchResponse } from 'gaxios/build/src/common';

const brotliCompress = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

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
  return parser.stringify(channels, now);
}

async function write(
  originRes: FetchResponse,
  contentEncoding: string | null,
  res: ServerResponse
): Promise<void> {
  switch (contentEncoding) {
    case 'br': {
      res.end(
        await brotliCompress(insecureHeader() + '\n' + (await originRes.text()))
      );
      break;
    }
    case 'gzip': {
      res.end(await gzip(insecureHeader() + '\n' + (await originRes.text())));
      break;
    }
    case null: {
      res.write(insecureHeader() + '\n');
      const readable = originRes.body as unknown as Readable;
      if (readable.addListener == null) throw new Error('node-fetch ではない');
      for await (const buf of readable) {
        res.write(buf);
      }
      res.end();
      break;
    }
    default:
      throw new Error();
  }
}

export async function getServerSideProps({
  req,
  resolvedUrl,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const acceptEncoding = (
    req.headers['accept-encoding'] as string | null
  )?.split(',');
  const contentEncoding =
    ['br', 'gzip'].find((x) => acceptEncoding?.includes(x)) ?? null;
  await pageView(req, resolvedUrl);
  const originURL = `${protocol}://${req.headers.host}/_internal/index.txt`;
  const originRes = await fetch(originURL);
  res.writeHead(originRes.status, [
    ['Content-Type', originRes.headers.get('Content-Type') ?? ''],
    ...(contentEncoding == null ? [] : [['Content-Encoding', contentEncoding]]),
  ]);
  console.log(res.getHeaders());
  write(originRes, contentEncoding, res);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
