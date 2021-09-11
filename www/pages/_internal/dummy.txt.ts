import { GetServerSidePropsContext } from 'next';
import dummy from '../../utils/dummy';
import handler from '../../utils/handler';

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const txt = dummy();
  handler(res, txt, false);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
