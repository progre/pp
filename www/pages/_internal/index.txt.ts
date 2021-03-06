import { GetServerSidePropsContext } from 'next';
import generateIndexTxt from '../../utils/fetch/generateIndexTxt';
import handler from '../../utils/http/handler';

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const txt = await generateIndexTxt();
  handler(res, txt, true);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
