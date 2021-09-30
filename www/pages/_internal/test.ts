import { GetServerSidePropsContext } from 'next';
import dummy from '../../utils/dummy';
import handler from '../../utils/handler';

let cachedTime = 0;
let cachedIndexTxt: string | null = null;

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  if (cachedIndexTxt != null && Date.now() < cachedTime + 60 * 1000) {
    console.log('Cache hit');
    handler(res, 'Cache hit', false);
    return { props: {} };
  }
  const txt = dummy();
  cachedTime = Date.now();
  cachedIndexTxt = txt;
  handler(res, txt, false);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
