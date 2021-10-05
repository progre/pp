import { GetServerSidePropsContext } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import pAtInsecure from '../../utils/channel/pAtInsecure';
import ContentEncoder from '../../utils/ContentEncoder';
import fetchIndexTxt from '../../utils/fetchIndexTxt';
import { pageView } from '../../utils/pageView';

export async function getServerSideProps({
  req,
  resolvedUrl,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const [_, { status, contentType, body }] = await Promise.all([
    pageView(req, resolvedUrl),
    fetchIndexTxt(req.headers.host ?? ''),
  ]);
  const encoder = new ContentEncoder(
    req.headers['accept-encoding'] as string | null
  );
  res.writeHead(status, [['Content-Type', contentType], ...encoder.headers()]);
  const now = new Date();
  const insecureHeader = parser.stringify([pAtInsecure(now)], now) + '\n';
  await encoder.end(res, insecureHeader + body);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
