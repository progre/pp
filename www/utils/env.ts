import fs from 'fs';
import zlib from 'zlib';

export const gaCidSalt: string = process.env.GA_CID_SALT ?? 'salt';
export const gcpCredentials: string | null =
  process.env.GCP_CREDENTIALS_BR != null
    ? zlib
        .brotliDecompressSync(
          Buffer.from(process.env.GCP_CREDENTIALS_BR, 'base64')
        )
        .toString()
    : null;
export const rootServerOrigin =
  process.env.ROOT_SERVER_ORIGIN ?? 'http://admin:hoge@192.168.10.102';
export const vercel = !!process.env.VERCEL;
export const vercelEnv = process.env.VERCEL_ENV ?? 'local';
export const ca =
  process.env.CA_CERT_PEM_BR != null
    ? zlib
        .brotliDecompressSync(Buffer.from(process.env.CA_CERT_PEM_BR, 'base64'))
        .toString()
    : fs.readFileSync('secrets/ca.cert.pem');
