import { AbortController } from 'node-abort-controller';

export default async function fetchWithTimeout(
  url: string,
  timeout: number
): Promise<Response> {
  const abortController = new AbortController();
  const handle = setTimeout(() => {
    abortController.abort();
  }, timeout);
  const signal = abortController.signal;
  const res = await fetch(url, { signal });
  clearTimeout(handle);
  return res;
}
