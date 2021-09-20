import { IconButton, Paper } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import mpegts from 'mpegts.js';
import React, { useEffect, useRef } from 'react';
import { VideoPlayerItem } from '../../utils/VideoPlayerRepository';

type Player = mpegts.Player;

function FlvPlayer(props: {
  video: HTMLVideoElement;
  player: Player;
  onClickClose(): void;
}): JSX.Element {
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    videoWrapperRef.current?.appendChild(props.video);
    return () => {
      videoWrapperRef.current?.removeChild(props.video);
    };
  }, [props.video]);
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000',
        aspectRatio: '16 / 9',
      }}
    >
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          width: '100%',
          height: '100%',
        }}
      >
        <IconButton
          size="small"
          style={{
            backgroundColor: '#fff7',
            borderRadius: 4,
            margin: 16,
          }}
          onClick={props.onClickClose}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <div ref={videoWrapperRef} />
    </div>
  );
}

export default function MiniPlayers(props: {
  videoPlayers: readonly VideoPlayerItem[];
  onClickClose(channelId: string): void;
}): JSX.Element {
  if (props.videoPlayers.length === 0) {
    return <></>;
  }
  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 0,
        width: 400,
      }}
    >
      <Paper
        style={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        elevation={3}
      >
        <div>-</div>
        <div style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 64px)' }}>
          {props.videoPlayers.map(({ channelId, video, player }) => (
            <FlvPlayer
              key={channelId}
              video={video}
              player={player}
              onClickClose={() => {
                props.onClickClose(channelId);
              }}
            />
          ))}
        </div>
      </Paper>
    </div>
  );
}
