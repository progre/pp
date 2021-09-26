import { GetServerSidePropsContext } from 'next';
import generateIndexTxt from '../../utils/generateIndexTxt';
import handler from '../../utils/handler';
import { info } from '../../utils/logger';

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const txt = await generateIndexTxt();
  await info(txt);
  handler(res, txt, true);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
