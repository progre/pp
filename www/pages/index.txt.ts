import { GetServerSidePropsContext } from 'next';
import { Readable } from 'stream';
import { vercel } from '../utils/env';
import { pageView } from '../utils/pageView';

const protocol = `http${vercel ? 's' : ''}`;

export async function getServerSideProps({
  req,
  resolvedUrl,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  await pageView(req, resolvedUrl);
  const originURL = `${protocol}://${req.headers.host}/_internal/index.txt`;
  const originRes = await fetch(originURL);
  res.setHeader('Content-Type', originRes.headers.get('Content-Type') ?? '');
  res.shouldKeepAlive = false;
  res.writeHead(originRes.status);
  const readable = originRes.body as unknown as Readable;
  if (readable.addListener == null) throw new Error('node-fetch ではない');
  for await (const buf of readable) {
    res.write(buf);
  }
  res.end();
  return { props: {} };
}

export default function Null(): null {
  return null;
}
