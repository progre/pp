import { GetServerSidePropsContext } from 'next';
import handler from '../utils/handler';
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
  const originText = await originRes.text();
  handler(res, originText, false);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
