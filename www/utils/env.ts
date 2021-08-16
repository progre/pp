export const gcpCredentials: string | null =
  process.env.GCP_CREDENTIALS ?? null;
export const rootServerOrigin =
  process.env.ROOT_SERVER_ORIGIN ?? 'http://admin:hoge@192.168.10.102';
export const vercel = !!process.env.VERCEL;
export const vercelEnv = process.env.VERCEL_ENV ?? 'local';
