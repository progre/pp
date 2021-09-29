import mpegts from 'mpegts.js';
import { ReadableStream } from 'web-streams-polyfill/ponyfill';

type Config = mpegts.Config;
type LoaderErrors = mpegts.LoaderErrors;
const LoaderErrors = mpegts.LoaderErrors as unknown as Record<
  keyof LoaderErrors,
  LoaderErrors
>;
const LoaderStatus = mpegts.LoaderStatus;
type MediaSegment = mpegts.MediaSegment;
type Range = mpegts.Range;
type SeekHandler = mpegts.SeekHandler;

export default function createReadableStreamLoader(
  readableStreamFactory: () => Promise<ReadableStream>,
  abortController: AbortController
): mpegts.CustomLoaderConstructor {
  return class extends ReadableStreamLoader {
    constructor(_seekHandler: SeekHandler, _config: Config) {
      super('ReadableStreamLoader', readableStreamFactory, abortController);
    }
  };
}

class ReadableStreamLoader extends mpegts.BaseLoader {
  private receivedLength = 0;
  private readableStream?: ReadableStream;

  constructor(
    typeName: string,
    private readableStreamFactory: () => Promise<ReadableStream>,
    private abortController: AbortController | null
  ) {
    super(typeName);
    this._needStash = true;
  }

  override destroy(): void {
    this.abort();
    super.destroy();
  }

  override async open(_dataSource: MediaSegment, _range: Range): Promise<void> {
    this._status = LoaderStatus.kConnecting;
    this.readableStream = await this.readableStreamFactory();
    this._status = LoaderStatus.kBuffering;
    try {
      for await (const data of this.readableStream) {
        this.dispatchArrayBuffer(data);
      }
    } catch (e) {
      const err = e as {
        name?: string;
        code?: number;
        message?: string;
      };
      if (err.name !== 'AbortError' || err.code !== 20) {
        this._status = LoaderStatus.kError;

        const info = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          code: err.code!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          msg: err.message!,
        };
        if (this.onError) {
          this.onError(LoaderErrors.EXCEPTION, info);
          return;
        }
        throw new Error(info.msg);
      }
    }
    this._status = LoaderStatus.kComplete;
    this.onComplete?.(0, this.receivedLength - 1);
  }

  abort(): void {
    const abortController = this.abortController;
    this.abortController = null;
    abortController?.abort();
  }

  private dispatchArrayBuffer(chunk: ArrayBuffer): void {
    if (this._status !== LoaderStatus.kIdle && !this.isWorking()) {
      throw new Error('logic error');
    }
    const byteStart = this.receivedLength;
    this.receivedLength += chunk.byteLength;
    this.onDataArrival?.(chunk, byteStart, this.receivedLength);
  }
}
