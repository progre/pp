import { GetServerSidePropsContext } from 'next';
import fetchIndexTxt from '../utils/fetch/fetchIndexTxt';
import { pageView } from '../utils/fetch/pageView';
import ContentEncoder from '../utils/http/ContentEncoder';

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
  await encoder.end(res, body);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
