import { ServerResponse } from 'http';
import { Readable } from 'stream';
import { promisify } from 'util';
import zlib from 'zlib';
import { FetchResponse } from 'gaxios/build/src/common';

const brotliCompress = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

export default class ContentEncoder {
  private contentEncoding: string | null;

  constructor(acceptEncodingRaw: string | null) {
    const acceptEncoding =
      acceptEncodingRaw?.split(',').map((x) => x.trimEnd()) ?? [];
    this.contentEncoding =
      ['br', 'gzip'].find((x) => acceptEncoding.includes(x)) ?? null;
  }

  headers(): string[][] {
    return this.contentEncoding == null
      ? []
      : [['Content-Encoding', this.contentEncoding]];
  }

  async write(
    contentHeader: string,
    originRes: FetchResponse,
    res: ServerResponse
  ): Promise<void> {
    switch (this.contentEncoding) {
      case 'br': {
        res.end(await brotliCompress(contentHeader + (await originRes.text())));
        break;
      }
      case 'gzip': {
        res.end(await gzip(contentHeader + (await originRes.text())));
        break;
      }
      case null: {
        res.write(contentHeader);
        const readable = originRes.body as unknown as Readable;
        if (readable.addListener == null)
          throw new Error('node-fetch ではない');
        for await (const buf of readable) {
          res.write(buf);
        }
        res.end();
        break;
      }
      default:
        throw new Error();
    }
  }
}
