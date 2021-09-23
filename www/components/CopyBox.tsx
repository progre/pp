import FileCopyIcon from '@mui/icons-material/FileCopy';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';

export default function CopyBox(props: { value: string }): JSX.Element {
  const [openTimeoutHandler, setOpenTimeoutHandler] = useState(
    null as number | null
  );
  const open = openTimeoutHandler != null;
  return (
    <OutlinedInput
      type="text"
      value={props.value}
      readOnly
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={async () => {
              await navigator.clipboard.writeText(props.value);
              if (openTimeoutHandler != null) {
                clearTimeout(openTimeoutHandler);
              }
              const handler = setTimeout(
                (() => setOpenTimeoutHandler(null)) as TimerHandler,
                3000
              );
              setOpenTimeoutHandler(handler);
            }}
            edge="end"
          >
            <Tooltip
              arrow
              title="コピーしました"
              disableFocusListener
              disableHoverListener
              disableTouchListener
              open={open}
            >
              <FileCopyIcon />
            </Tooltip>
          </IconButton>
        </InputAdornment>
      }
    />
  );
}
