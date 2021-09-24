import http, { IncomingMessage, ServerResponse } from 'http';

export default function handler(
  req: IncomingMessage,
  res: ServerResponse
): void {
  if (req.method !== 'POST') {
    res.writeHead(405, http.STATUS_CODES[405]);
    res.end();
    return;
  }
  res.writeHead(200);
  res.end();
}
