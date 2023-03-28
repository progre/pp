import { GetServerSidePropsContext } from 'next';
export async function getServerSideProps({
  req: _,
  resolvedUrl: __,
  res,
}: GetServerSidePropsContext): Promise<unknown> {
  const originRes = await fetch(
    'https://storage.googleapis.com/p-at-net/index.txt'
  );
  const text = await originRes.text();
  originRes.headers.forEach((value, key) => {
    if (key.startsWith('x-goog-') || key.startsWith('x-guploader-')) {
      return;
    }
    res.setHeader(key, value);
  });
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.writeHead(200);
  res.end(text);
  return { props: {} };
}

export default function Null(): null {
  return null;
}
