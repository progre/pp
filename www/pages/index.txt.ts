import { GetServerSidePropsContext } from 'next';
import { Readable } from 'stream';
import ContentEncoder from '../utils/ContentEncoder';
import { vercelEnv } from '../utils/env';
import { pageView } from '../utils/pageView';

const protocol = `http${vercelEnv === 'local' ? '' : 's'}`;

export async function getServerSideProps({
  req,
  resolvedUrl,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  await pageView(req, resolvedUrl);

  const encoder = new ContentEncoder(
    req.headers['accept-encoding'] as string | null
  );
  const originURL = `${protocol}://${req.headers.host}/_internal/index.txt`;
  const originRes = await fetch(originURL);
  res.shouldKeepAlive = false;
  res.writeHead(originRes.status, [
    ['Content-Type', originRes.headers.get('Content-Type') ?? ''],
    ...encoder.headers(),
  ]);
  await encoder.end('', originRes, res);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
