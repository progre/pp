import { GetServerSidePropsContext } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import dummyChannels from '../../utils/channel/dummyChannels';
import handler from '../../utils/http/handler';

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const now = new Date();
  const txt = parser.stringify(dummyChannels(now), now) + '\n';
  handler(res, txt, false);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
