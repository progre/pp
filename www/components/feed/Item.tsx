import crypto from 'crypto';
import { ButtonBase } from '@mui/material';
import * as colors from '@mui/material/colors';
import { Channel } from 'peercast-yp-channels-parser';
import React from 'react';
import styles from './Item.module.css';

function channelColor(src: string): [string, string] {
  const numColors = 19;
  const numDepths = 8;
  const hash = crypto.createHash('md5').update(src).digest();

  const colorIdx = hash[0] % numColors;
  const colorKey = Object.getOwnPropertyNames(colors).filter(
    (x) => !x.startsWith('_') && x !== 'common'
  )[colorIdx];
  const baseColor = (colors as unknown as Record<string, unknown>)[colorKey];

  const depthIdx = (hash[1] % numDepths) + 2;
  const depthKey = Object.keys(baseColor as Record<string, unknown>)[depthIdx];
  const backgroundColor = (baseColor as { [key: string]: string })[depthKey];

  const frontColor =
    Number.parseInt(backgroundColor.slice(1, 3), 16) +
      Number.parseInt(backgroundColor.slice(3, 5), 16) +
      Number.parseInt(backgroundColor.slice(5, 7), 16) <
    500
      ? colors.common.white
      : colors.common.black;
  return [backgroundColor, frontColor];
}

export default function Item(props: {
  channel: Channel;
  onClick(): void;
}): JSX.Element {
  const [backgroundColor, color] = channelColor(props.channel.name);
  return (
    <ButtonBase
      className={styles.content}
      component="div"
      onClick={props.onClick}
    >
      <div className={styles.image} style={{ color: 'gray' }}>
        under construction...
      </div>
      <div className={styles.info}>
        <div className={styles.avator} style={{ backgroundColor, color }}>
          {props.channel.name[0]}
        </div>
        <div className={styles.info_right}>
          <div>{props.channel.desc}</div>
          <div>{props.channel.name}</div>
        </div>
      </div>
    </ButtonBase>
  );
}
