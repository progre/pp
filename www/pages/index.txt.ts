import { GetServerSidePropsContext } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import { ServerResponse } from 'http';
import parseXml from '../utils/parseXml';

const ROOT_SERVER_ORIGIN =
  process.env.ROOT_SERVER_ORIGIN ?? 'http://admin:hoge@192.168.10.102';

async function generateIndexTxt(): Promise<string> {
  const res = await fetch(`${ROOT_SERVER_ORIGIN}/admin?cmd=viewxml`);
  const now = new Date();
  const channels = await parseXml(await res.text(), now);
  return parser.stringify(channels, now);
}

async function handler(res: ServerResponse): Promise<void> {
  const indexTxt = await generateIndexTxt();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  res.shouldKeepAlive = false;
  res.writeHead(200);
  res.end(indexTxt);
}

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  await handler(res);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
