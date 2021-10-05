import { Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import { GetServerSidePropsResult } from 'next';
import * as parser from 'peercast-yp-channels-parser';
import { Channel } from 'peercast-yp-channels-parser';
import React, { useEffect, useMemo, useState } from 'react';
import ChannelList from '../components/feed/ChannelList';
import HeadInfo from '../components/feed/HeadInfo';
import Footer from '../components/Footer';
import MiniPlayers from '../components/feed/MiniPlayers';
import Head from '../components/Head';
import uptest from '../utils/fetch/uptest';
import VideoPlayerRepository, {
  VideoPlayerItem,
} from '../utils/VideoPlayerRepository';

const ORIGIN_URL = 'https://p-at.net/_internal/index.txt';

async function checkPort(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${port}/`, {
      method: 'HEAD',
      mode: 'no-cors',
    });
    // Access-Control-Allow-Origin が定義されていないので 0 になるが、サーバーに到達できていれば OK 。
    return res.status < 400;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export default function feed(props: { channels: Channel[] }): JSX.Element {
  const defaultPeercastPort = 7144;
  const videoPlayerRepos = useMemo(() => VideoPlayerRepository.instance, []);
  const [videoPlayers, setVideoPlayers] = useState(
    [] as readonly VideoPlayerItem[]
  );
  const [bandwidth, setBandwidth] = useState(0 as number | null);
  const [peercastPort, setPeercastPort] = useState(defaultPeercastPort);
  const [checkedPort, setCheckedPort] = useState(0);
  const [disabledCheckButton, setDisabledCheckButton] = useState(false);
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
      <HeadInfo
        defaultPeercastPort={defaultPeercastPort}
        peercastPort={peercastPort}
        checkedPort={checkedPort}
        bandwidth={bandwidth}
        disabledCheckButton={disabledCheckButton}
        setPeercastPort={(value) => {
          if (Number.isNaN(value)) {
            return;
          }
          if (value < 1) {
            value = 1;
          } else if (65535 < value) {
            value = 65535;
          }
          setPeercastPort(value);
        }}
        uptest={async () => {
          setDisabledCheckButton(true);
          setBandwidth(null);
          await Promise.all([
            (async () => {
              const succeededPortCheck = await checkPort(peercastPort);
              if (succeededPortCheck) {
                setCheckedPort(peercastPort);
              }
            })(),
            (async () => {
              const bps = await uptest();
              setBandwidth(bps);
            })(),
          ]);
          setDisabledCheckButton(false);
        }}
      />
      <ChannelList
        channels={props.channels}
        leftBandwidth={bandwidth ?? 0}
        onClickChannel={async (channelId) => {
          if (videoPlayerRepos.find(channelId) != null) {
            return;
          }
          const createVideoPlayer = (await import('../utils/createVideoPlayer'))
            .default;
          const item = createVideoPlayer(
            `localhost:${peercastPort}`,
            channelId
          );
          videoPlayerRepos.push(item);
          const videoPlayers = videoPlayerRepos.items();
          setVideoPlayers(videoPlayers);
        }}
      />
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
