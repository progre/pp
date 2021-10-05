import { ServerResponse } from 'http';
import { promisify } from 'util';
import zlib from 'zlib';

const brotliCompress = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

export default class ContentEncoder {
  private contentEncoding: string | null;

  constructor(acceptEncodingRaw: string | null) {
    const acceptEncoding =
      acceptEncodingRaw?.split(',').map((x) => x.trimStart()) ?? [];
    this.contentEncoding =
      ['br', 'gzip'].find((x) => acceptEncoding.includes(x)) ?? null;
  }

  headers(): string[][] {
    return this.contentEncoding == null
      ? []
      : [['Content-Encoding', this.contentEncoding]];
  }

  async end(res: ServerResponse, content: string): Promise<void> {
    switch (this.contentEncoding) {
      case 'br': {
        res.end(await brotliCompress(content));
        break;
      }
      case 'gzip': {
        res.end(await gzip(content));
        break;
      }
      case null: {
        res.end(content);
        break;
      }
      default:
        throw new Error();
    }
  }
}
