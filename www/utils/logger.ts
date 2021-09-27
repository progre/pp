import { Logging } from '@google-cloud/logging';
import { LogEntry } from '@google-cloud/logging/build/src/entry';
import { gcpCredentials, vercelEnv } from './env';

const logName = `pp-${vercelEnv}`;

const logging =
  gcpCredentials == null
    ? null
    : new Logging({
        projectId: 'progreyp',
        credentials: JSON.parse(gcpCredentials),
      });
const log = logging?.log(logName) ?? null;

const infoMetadata: LogEntry = {
  resource: { type: 'global' },
  severity: 'INFO',
};

const warningMetadata: LogEntry = {
  resource: { type: 'global' },
  severity: 'WARNING',
};

const errorMetadata: LogEntry = {
  resource: { type: 'global' },
  severity: 'ERROR',
};

export async function info(data: string): Promise<void> {
  if (log == null) {
    return;
  }
  await log.write(log.entry(infoMetadata, data));
}

export async function warning(data: string): Promise<void> {
  if (log == null) {
    return;
  }
  await log.write(log.entry(warningMetadata, data));
}

export async function error(data: string): Promise<void> {
  if (log == null) {
    return;
  }
  await log.write(log.entry(errorMetadata, data));
}
