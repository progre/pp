import { Link } from '@material-ui/core';
import NextLink from 'next/link';

export default function Footer(): JSX.Element {
  return (
    <footer style={{ margin: '8rem 0 4rem' }}>
      <p>
        <NextLink href="/" passHref>
          <Link>p@ YP</Link>
        </NextLink>
        <span style={{ marginLeft: '2rem' }}>
          <NextLink href="/terms" passHref>
            <Link>利用規約</Link>
          </NextLink>
        </span>
      </p>
      <p style={{ marginTop: '2rem', textAlign: 'center' }}>© ぷろぐれ</p>
    </footer>
  );
}
