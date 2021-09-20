import { Link as MLink } from '@material-ui/core';
import NextLink from 'next/link';
import { PropsWithChildren } from 'react';

function Link(
  props: PropsWithChildren<{ href: string; rawLink?: boolean }>
): JSX.Element {
  if (props.rawLink) {
    return <MLink href={props.href}>{props.children}</MLink>;
  }
  return (
    <NextLink href={props.href} passHref>
      <MLink>{props.children}</MLink>
    </NextLink>
  );
}

export default function Footer(props: { rawLink?: boolean }): JSX.Element {
  return (
    <footer style={{ margin: '8rem 0 4rem' }}>
      <p style={{ display: 'flex', gap: '2rem' }}>
        <Link href="/" rawLink={props.rawLink}>
          p@ YP
        </Link>
        <Link href="/terms" rawLink={props.rawLink}>
          利用規約
        </Link>
        <Link href="/feed" rawLink>
          チャンネル一覧 (β)
        </Link>
      </p>
      <p style={{ marginTop: '2rem', textAlign: 'center' }}>© ぷろぐれ</p>
    </footer>
  );
}
