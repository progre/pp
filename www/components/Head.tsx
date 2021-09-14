import NextHead from 'next/head';

export default function Head(props: {
  ogType: 'website' | 'article';
  subTitle?: string;
  description?: string;
  keywords?: string;
}): JSX.Element {
  const siteTitle = 'p@ YP';
  return (
    <NextHead>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <title>
        {props.subTitle ? `${props.subTitle} - ${siteTitle}` : siteTitle}
      </title>
      {props.description ? (
        <meta name="description" content={props.description} />
      ) : (
        <></>
      )}
      {props.keywords ? (
        <meta name="keywords" content={props.keywords} />
      ) : (
        <></>
      )}

      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:type" content={props.ogType} />
      <meta property="og:title" content={props.subTitle ?? siteTitle} />
      {props.description ? (
        <meta property="og:description" content={props.description} />
      ) : (
        <></>
      )}
      <meta property="og:image" content="https://p-at.net/ogimage.png" />
    </NextHead>
  );
}
