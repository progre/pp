import { GetServerSidePropsContext } from 'next';
import generateIndexTxt from '../../utils/generateIndexTxt';
import handler from '../../utils/handler';

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  handler(res, await generateIndexTxt(true));
  return { props: {} };
}

export default function Null(): null {
  return null;
}
