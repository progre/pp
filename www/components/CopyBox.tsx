import IconButton from '@material-ui/core/IconButton';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import InputAdornment from '@material-ui/core/InputAdornment';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Tooltip from '@material-ui/core/Tooltip';
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
