import mpegts from 'mpegts.js';

type Player = mpegts.Player;

export interface VideoPlayerItem {
  channelId: string;
  video: HTMLVideoElement;
  player: Player;
}

export default class VideoPlayerRepository {
  static instance = new VideoPlayerRepository();
  #items: readonly VideoPlayerItem[] = [];

  find(channelId: string): VideoPlayerItem | null {
    return this.#items.find((x) => x.channelId === channelId) ?? null;
  }

  items(): readonly VideoPlayerItem[] {
    return this.#items;
  }

  push(item: VideoPlayerItem): void {
    this.#items = [item, ...this.#items];
  }

  remove(channelId: string): void {
    this.#items = this.#items.filter((x) => x.channelId !== channelId);
  }
}
