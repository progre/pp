import { Logging } from '@google-cloud/logging';
import { LogEntry } from '@google-cloud/logging/build/src/entry';
import { GetServerSidePropsContext } from 'next';
import { gcpCredentials, vercelEnv } from '../utils/env';
import generateIndexTxt from '../utils/generateIndexTxt';
import handler from '../utils/handler';

const logName = `pp-${vercelEnv}`;

const logging =
  gcpCredentials == null
    ? null
    : new Logging({
        projectId: 'progreyp',
        credentials: JSON.parse(gcpCredentials),
      });
const log = logging?.log(logName) ?? null;

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const txt = await generateIndexTxt();
  const metadata: LogEntry = {
    resource: { type: 'global' },
    severity: 'INFO',
  };
  if (log != null) {
    await log.write(log.entry(metadata, txt));
  }
  handler(res, txt, true);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
