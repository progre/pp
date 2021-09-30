import { vercelEnv } from './env';
import { warning } from './logger';

const protocol = `http${vercelEnv === 'local' ? '' : 's'}`;

let cachedIndexTxt: string | null = null;
let cachedTime = 0;

export default async function fetchIndexTxt(
  host: string
): Promise<{ status: number; contentType: string; body: string }> {
  if (cachedIndexTxt != null && Date.now() < cachedTime + 60 * 1000) {
    console.log('Cache hit');
    return {
      status: 200,
      contentType: 'text/plain; charset=UTF-8',
      body: cachedIndexTxt,
    };
  }

  const handle = setTimeout(
    () => warning('Warning. Response is too late. /_internal/index.txt'),
    8000
  );
  const originURL = `${protocol}://${host}/_internal/index.txt`;
  const originRes = await fetch(originURL);
  clearTimeout(handle);
  const body = await originRes.text();

  cachedIndexTxt = body;
  cachedTime = Date.now();

  return {
    status: originRes.status,
    contentType: originRes.headers.get('Content-Type') ?? '',
    body,
  };
}
