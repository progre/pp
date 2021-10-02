import { GetServerSidePropsContext } from 'next';
import ContentEncoder from '../utils/ContentEncoder';
import fetchIndexTxt from '../utils/fetchIndexTxt';
import { pageView } from '../utils/pageView';

export async function getServerSideProps({
  req,
  resolvedUrl,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  pageView(req, resolvedUrl);

  const { status, contentType, body } = await fetchIndexTxt(
    req.headers.host ?? ''
  );
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
