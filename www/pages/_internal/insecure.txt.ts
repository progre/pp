import { GetServerSidePropsContext } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import pAtInsecure from '../../utils/channel/pAtInsecure';
import generateIndexTxt from '../../utils/fetch/generateIndexTxt';
import { pageView } from '../../utils/fetch/pageView';
import handler from '../../utils/http/handler';

export async function getServerSideProps({
  req,
  resolvedUrl,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const [_, txt] = await Promise.all([
    pageView(req, resolvedUrl),
    generateIndexTxt(),
  ]);
  const now = new Date();
  const insecureHeader = parser.stringify([pAtInsecure(now)], now) + '\n';
  handler(res, insecureHeader + txt, true);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
