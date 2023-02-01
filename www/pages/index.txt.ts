import { GetServerSidePropsContext } from 'next';
import generateIndexTxt from '../utils/fetch/generateIndexTxt';
import { pageView } from '../utils/fetch/pageView';
import handler from '../utils/http/handler';

export async function getServerSideProps({
  req,
  resolvedUrl,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const [_, txt] = await Promise.all([
    pageView(req, resolvedUrl),
    generateIndexTxt(),
  ]);
  handler(res, txt, true);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
