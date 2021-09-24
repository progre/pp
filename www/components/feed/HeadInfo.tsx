import { Button, CircularProgress, Grid, TextField } from '@mui/material';
import React, { ChangeEvent } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WarningIcon from '@mui/icons-material/Warning';
import { yellow } from '@mui/material/colors';

function Item(props: { icon: JSX.Element; text: string }): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '0.5em' }}>
      {props.icon} {props.text}
    </div>
  );
}

export default function HeadInfo(props: {
  peercastPort: number;
  defaultPeercastPort: number;
  checkedPort: number;
  bandwidth: number | null;
  disabledCheckButton: boolean;
  setPeercastPort(value: number): void;
  uptest(): void;
}): JSX.Element {
  return (
    <div>
      <p>
        ブラウザーと同じ PC で PeerCast
        本体を起動している場合に限り、このページで配信を視聴することができます。
      </p>
      <Grid container spacing={2} style={{ marginTop: 8, marginBottom: 32 }}>
        <Grid item xs={6}>
          <div>
            {props.checkedPort === props.peercastPort ? (
              <Item
                icon={<CheckCircleIcon color="success" />}
                text="PeerCast 起動OK"
              />
            ) : (
              <Item icon={<HelpOutlineIcon />} text="PeerCast 起動未確認" />
            )}
          </div>
          <div>
            {props.bandwidth == null ? (
              <Item icon={<HelpOutlineIcon />} text="帯域確認中..." />
            ) : props.bandwidth / 1024 > 2000 ? (
              <Item
                icon={<CheckCircleIcon color="success" />}
                text={`${(props.bandwidth / 1024 / 1024) | 0} Mbps`}
              />
            ) : props.bandwidth / 1024 > 500 ? (
              <Item
                icon={<CheckCircleIcon color="success" />}
                text={`${(props.bandwidth / 1024) | 0} kbps`}
              />
            ) : props.bandwidth > 0 ? (
              <Item
                icon={<WarningIcon sx={{ color: yellow[800] }} />}
                text="Under 500 kbps"
              />
            ) : (
              <Item icon={<HelpOutlineIcon />} text="帯域未確認" />
            )}
          </div>
        </Grid>
        <Grid
          item
          xs={6}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <TextField
            type="number"
            label="PeerCast ポート"
            value={props.peercastPort}
            placeholder={String(props.defaultPeercastPort)}
            style={{ minWidth: '6em', width: '8em' }}
            inputProps={{
              style: { textAlign: 'end' },
            }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              props.setPeercastPort(e.target.valueAsNumber);
            }}
          />
          <div style={{ position: 'relative' }}>
            {props.disabledCheckButton ? (
              <CircularProgress
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  margin: 'auto',
                  width: 24,
                  height: 24,
                }}
              />
            ) : (
              <></>
            )}
            <Button
              variant="contained"
              disabled={props.disabledCheckButton}
              onClick={props.uptest}
              style={{ textTransform: 'initial' }}
            >
              PeerCast 起動チェック &amp; 帯域チェック
            </Button>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
