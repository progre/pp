import { Link as MLink } from '@mui/material';
import NextLink from 'next/link';
import { JSX, PropsWithChildren } from 'react';

function Link(
  props: PropsWithChildren<{ href: string; rawLink?: boolean }>
): JSX.Element {
  if (props.rawLink) {
    return <MLink href={props.href}>{props.children}</MLink>;
  }
  return (
    <MLink component={NextLink} href={props.href}>
      {props.children}
    </MLink>
  );
}

export default function Footer(props: { rawLink?: boolean }): JSX.Element {
  return (
    <footer style={{ margin: '8rem 0 0' }}>
      <p style={{ display: 'flex', gap: '2rem' }}>
        <Link href="/" rawLink={props.rawLink}>
          p@ YP
        </Link>
        <Link href="/terms" rawLink={props.rawLink}>
          利用規約
        </Link>
        {/* <Link href="/feed" rawLink>
          チャンネル一覧 (β)
        </Link> */}
      </p>
      <p style={{ marginTop: '2rem', textAlign: 'center' }}>
        ©
        <a
          style={{ marginLeft: '0.25em' }}
          href="https://bsky.app/profile/progre.me"
          target="_blank"
          rel="noreferrer"
        >
          ぷろぐれ
        </a>
      </p>
    </footer>
  );
}
