import mpegts from 'mpegts.js';
import { VideoPlayerItem } from './VideoPlayerRepository';
// const mpegts = (await import('mpegts.js')).default;

export default function createVideoPlayer(
  peercastHost: string,
  channelId: string
): VideoPlayerItem {
  const player = mpegts.createPlayer({
    type: 'flv',
    // isLive: true,
    url: `http://${peercastHost}/stream/${channelId}.flv`,
  });
  const video = document.createElement('video');
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.display = 'block';
  player.attachMediaElement(video);
  player.load();
  player.play();
  return { channelId, video, player };
}
