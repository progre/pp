import {
  Container,
  CssBaseline,
  TextField,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { GetServerSidePropsResult } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import { Channel } from 'peercast-yp-channels-parser';
import React, { useEffect, useMemo, useState } from 'react';
import Item from '../components/feed/Item';
import Head from '../components/Head';
import MiniPlayers from '../components/feed/MiniPlayers';
import Footer from '../components/Footer';
import VideoPlayerRepository, {
  VideoPlayerItem,
} from '../utils/VideoPlayerRepository';

import styles from './feed.module.css';

const ORIGIN_URL = 'https://p-at.net/_internal/index.txt';

export default function feed(props: { channels: Channel[] }): JSX.Element {
  const defaultPeercastHost = 'localhost:7144';
  const videoPlayerRepos = useMemo(() => VideoPlayerRepository.instance, []);
  const [videoPlayers, setVideoPlayers] = useState(
    [] as readonly VideoPlayerItem[]
  );
  const [peercastHost, setPeercastHost] = useState('localhost:7144');
  useEffect(() => {
    const videoPlayers = videoPlayerRepos.items();
    setVideoPlayers(videoPlayers);
  }, []);
  return (
    <Container>
      <Head
        ogType="article"
        subTitle="チャンネル一覧"
        description="現在 p@ YP に掲載されているチャンネルの一覧。"
      />
      <CssBaseline />
      <Toolbar
        style={{
          paddingLeft: 0,
          paddingRight: 0,
          minHeight: 56,
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" color="inherit">
          p@ YP
        </Typography>
      </Toolbar>
      <TextField
        style={{ marginTop: 8, marginBottom: 32 }}
        label="PeerCast ホスト"
        variant="standard"
        value={peercastHost}
        placeholder={defaultPeercastHost}
        onChange={(e) => setPeercastHost(e.target.value)}
      />
      <div className={styles.container}>
        {props.channels.length === 0 ? (
          <>いっこもチャンネルないです(´・ω・｀)</>
        ) : (
          props.channels.map((x) => (
            <Item
              key={x.id}
              channel={x}
              onClick={async () => {
                if (videoPlayerRepos.find(x.id) != null) {
                  return;
                }
                const createVideoPlayer = (
                  await import('../utils/createVideoPlayer')
                ).default;
                const item = createVideoPlayer(
                  peercastHost ? peercastHost : defaultPeercastHost,
                  x.id
                );
                videoPlayerRepos.push(item);
                const videoPlayers = videoPlayerRepos.items();
                setVideoPlayers(videoPlayers);
              }}
            />
          ))
        )}
      </div>
      <Footer rawLink />
      <MiniPlayers
        videoPlayers={videoPlayers}
        onClickClose={(channelId) => {
          const videoPlayer = videoPlayers.find(
            (x) => x.channelId === channelId
          );
          videoPlayer?.player.destroy();
          videoPlayerRepos.remove(channelId);
          setVideoPlayers(videoPlayerRepos.items());
        }}
      />
    </Container>
  );
}

export async function getServerSideProps(): Promise<
  GetServerSidePropsResult<unknown>
> {
  const originRes = await fetch(ORIGIN_URL);
  const channelsSrc = await originRes.text();
  const channels = parser
    .parse(channelsSrc, new Date())
    .filter((x) => x.id !== '00000000000000000000000000000000');

  return { props: { channels } };
}
