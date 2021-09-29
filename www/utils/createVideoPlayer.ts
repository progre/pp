import mpegts from 'mpegts.js';
import { ReadableStream as PolyfillReadableStream } from 'web-streams-polyfill/ponyfill';
import createReadableStreamLoader from './mpegts/ReadableStreamLoader';
import { VideoPlayerItem } from './VideoPlayerRepository';

function wrap(src: ReadableStream<Uint8Array>): PolyfillReadableStream {
  const reader = src.getReader();
  return new PolyfillReadableStream({
    async start(controller): Promise<void> {
      for (;;) {
        const { done, value } = await reader.read();
        // データを消費する必要がなくなったら、ストリームを閉じます
        if (done) {
          controller.close();
          return;
        }
        // 次のデータチャンクを対象のストリームのキューに入れます
        controller.enqueue(value);
      }
    },
  });
}

export default function createVideoPlayer(
  peercastHost: string,
  channelId: string
): VideoPlayerItem {
  const abortController = new AbortController();
  const readableStreamFactory = async (): Promise<PolyfillReadableStream> => {
    const res = await fetch(`http://${peercastHost}/stream/${channelId}.flv`, {
      signal: abortController.signal,
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return wrap(res.body!);
  };

  const player = mpegts.createPlayer(
    {
      type: 'flv',
      // isLive: true,
    },
    {
      customLoader: createReadableStreamLoader(
        readableStreamFactory,
        abortController
      ),
    }
  );
  const video = document.createElement('video');
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.display = 'block';
  player.attachMediaElement(video);
  player.load();
  player.play();
  return { channelId, video, player };
}
