import { ServerResponse } from 'http';

export default function handler(res: ServerResponse, body: string): void {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  res.shouldKeepAlive = false;
  res.writeHead(200);
  res.end(body);
}
