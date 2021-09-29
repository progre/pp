import { GetServerSidePropsContext } from 'next';
import ContentEncoder from '../utils/ContentEncoder';
import { vercelEnv } from '../utils/env';
import { warning } from '../utils/logger';
import { pageView } from '../utils/pageView';

const protocol = `http${vercelEnv === 'local' ? '' : 's'}`;

export async function getServerSideProps({
  req,
  resolvedUrl,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  await pageView(req, resolvedUrl);

  const handle = setTimeout(
    () => warning('Warning. Response is too late. /_internal/index.txt'),
    8000
  );
  const originURL = `${protocol}://${req.headers.host}/_internal/index.txt`;
  const originRes = await fetch(originURL);
  clearTimeout(handle);
  res.shouldKeepAlive = false;
  const encoder = new ContentEncoder(
    req.headers['accept-encoding'] as string | null
  );
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
