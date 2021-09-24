import { Channel } from 'peercast-yp-channels-parser';
import { default as ChannelView } from './Channel';
import styles from './ChannelList.module.css';

export default function ChannelList(props: {
  channels: Channel[];
  leftBandwidth: number;
  onClickChannel(channelId: string): void;
}): JSX.Element {
  return (
    <div className={styles.container}>
      {props.channels.length === 0 ? (
        <>いっこもチャンネルないです(´・ω・｀)</>
      ) : (
        props.channels.map((x) => (
          <ChannelView
            key={x.id}
            channel={x}
            disabled={
              console.log(x.bitrate, props.leftBandwidth) ||
              x.bitrate > props.leftBandwidth
            }
            onClick={() => props.onClickChannel(x.id)}
          />
        ))
      )}
    </div>
  );
}
