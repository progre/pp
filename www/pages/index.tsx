import { Container, Link } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useState } from 'react';
import NextLink from 'next/link';
import CopyBox from '../components/CopyBox';
import Footer from '../components/Footer';
import Head from '../components/Head';
import dummy from '../utils/dummy';

export default function index(props: { dummyIndexTxt: string }): JSX.Element {
  const [checkTerms, setCheckTerms] = useState(false);

  const description =
    'p@ YP は PeerCast のライブストリーミングチャンネルの掲載所です。現行の各 YP のサブ的な立ち位置で試験運用しています。ソースコードは AGPL で公開されています。';
  const keywords =
    'peercast,ピアキャスト,ピアキャス,yp,yellowpages,イエローページ,livestreaming,livestream,ライブストリーム,ライブストリーミング,ライブ配信,生放送';
  return (
    <Container maxWidth="sm">
      <Head ogType="website" description={description} keywords={keywords} />
      <CssBaseline />
      <Toolbar
        style={{
          paddingLeft: 0,
          paddingRight: 0,
          height: 80,
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" color="inherit" style={{ paddingLeft: 8 }}>
          p@ YP
        </Typography>
        <div style={{ textAlign: 'right' }}>
          <Link href="#about" underline="none">
            <Button color="inherit" style={{ textTransform: 'initial' }}>
              p@ YP とは
            </Button>
          </Link>
          <Link href="#listen" underline="none">
            <Button color="inherit">視聴方法</Button>
          </Link>
          <Link href="#broadcast" underline="none">
            <Button color="inherit">掲載方法</Button>
          </Link>
          <Link href="#contact" underline="none">
            <Button color="inherit">連絡先</Button>
          </Link>
        </div>
      </Toolbar>
      <pre
        style={{
          backgroundColor: '#222',
          color: '#999',
          backgroundSize: 'cover',
          aspectRatio: '3.3028 / 1',
          width: '100%',
          overflow: 'hidden',
          fontSize: '8px',
          userSelect: 'none',
        }}
      >
        {props.dummyIndexTxt}
      </pre>
      <article id="about">
        <h1>p@ YP とは</h1>
        <p>{description}</p>
        <p>
          <Link
            href="https://github.com/progre/pp"
            target="_blank"
            rel="noreferrer"
          >
            https://github.com/progre/pp
          </Link>
        </p>
      </article>
      <article id="listen" style={{ marginTop: '6rem' }}>
        <h1>視聴方法</h1>
        <p>
          p@ YP
          に掲載されるチャンネル情報の取得、視聴には専用ソフトウェアが必要です。各ソフトウェアの使用方法はそれぞれの説明を参照してください。
        </p>
        <ul>
          <li>
            PeerCastStation
            <small style={{ marginLeft: '0.5em' }}>
              P2P ライブストリーミングソフトウェア
            </small>
            <br />
            <Link
              href="http://www.pecastation.org/"
              target="_blank"
              rel="noreferrer"
            >
              http://www.pecastation.org/
            </Link>
          </li>
          <li>
            PeCaRecorder
            <small style={{ marginLeft: '0.5em' }}>
              動画プレイヤー内蔵のチャンネル情報の取得用ソフトウェア (PCYP)
            </small>
            <br />
            <Link
              href="http://pecatv.s25.xrea.com/"
              target="_blank"
              rel="noreferrer"
            >
              http://pecatv.s25.xrea.com/
            </Link>
          </li>
        </ul>
        <p>
          お使いの PCYP に以下の URL を登録してください。※末尾の
          <code>index.txt</code> を含めるかどうかは各ソフトにより異なります
        </p>
        <CopyBox value="https://p-at.net/index.txt" />
        <p>
          <b>ただし PeCaRecorder の場合は以下の URL を指定してください</b>。
        </p>
        <CopyBox value="http://insecure.p-at.net/" />
        <h2>キャッシュの仕組み</h2>
        <p>
          チャンネル情報はキャッシュされているため、配信者が立てたチャンネル情報が即座に反映されないことがあります。
        </p>
        <p>
          キャッシュの期間は1分です。
          キャッシュが作られて1分経過した後の最初のアクセス時は
          <b>キャッシュが返ります</b>。
          それと同時にサーバーではキャッシュの更新が始まり、次回のアクセス時に新しいチャンネル情報を取得できます。
          従って、頻繁にアクセスされている時には1分強でチャンネル情報が更新されますが、アクセスがなければ2回アクセスしなければ最新のチャンネル情報を取得できません。
        </p>
      </article>
      <article id="broadcast" style={{ marginTop: '6rem' }}>
        <h1>掲載方法</h1>
        <p>
          <strong>
            チャンネルを掲載するには
            <NextLink href="/terms" passHref>
              <Link>利用規約</Link>
            </NextLink>
            に同意する必要があります。
          </strong>
        </p>
        <p>
          <strong>
            <NextLink href="/terms" passHref>
              <Link>利用規約</Link>
            </NextLink>
          </strong>
        </p>
        <FormControlLabel
          control={
            <Checkbox
              checked={checkTerms}
              onChange={(ev) => setCheckTerms(ev.target.checked)}
              color="primary"
            />
          }
          label="利用規約の内容を確認し、同意した"
        />
        <div style={{ minHeight: '21em' }}>
          {!checkTerms ? (
            <div
              style={{
                height: '21em',
                background: 'lightgray',
                userSelect: 'none',
              }}
            >
              <p style={{ padding: '1em' }}>
                利用規約に同意すると掲載方法を確認できます。
              </p>
            </div>
          ) : (
            <div>
              <p>
                PeerCast に掲載用 URL
                に以下を登録し、掲載するように設定するとチャンネルを掲載できます。
              </p>
              <CopyBox value="pcp://root.p-at.net" />
              <p>
                他の YP よろしくジャンル欄を使って掲載の挙動を変更できます。
              </p>
              <samp>書式) [pp][?][Genre]</samp>
              <p>
                ジャンルの先頭に pp
                が付いているとこの書式が有効になります。ない場合はそのままジャンルとして扱われます。
                ? をつけるとリスナー数を秘匿できます。
              </p>
              <samp>例) pp?ゲーム</samp>
            </div>
          )}
        </div>
        <h2>制約事項</h2>
        <p>
          IPv4 と IPv6
          を同時に掲載しようとするとうまくいかないようです。どちらかに絞るか他の
          YP と併用するとうまくいきます。 バックエンドは peercast-yt
          なのでポート0配信も可能です。但しポート0配信はリスナー側も peercast-yt
          でかつ YP の設定も一致している必要があるため、 p@ YP では非推奨です。
        </p>
        <h2>心得</h2>
        <p>
          やばいの（著作権的に一発アウトなものや動画を直接垂れ流すなど）を掲載するのはお控えください。
          御存知の通りチャンネルを掲載すると配信者の IP
          アドレスが載るので、何か問題が起きたらうちへの発信者情報開示請求をすっ飛ばして直接
          ISP とのやり取りが始まるはずですのでそのつもりで。
        </p>
      </article>
      <article id="contact" style={{ marginTop: '6rem' }}>
        <h1>連絡先</h1>
        <p>
          <Link
            href="https://twitter.com/progremaster"
            target="_blank"
            rel="noreferrer"
          >
            @progremaster
          </Link>
        </p>
        <p>
          各ライブストリームの内容については各ライブストリームの配信者にお問い合わせください。
        </p>
      </article>
      <Footer />
    </Container>
  );
}

export async function getStaticProps(): Promise<unknown> {
  return { props: { dummyIndexTxt: dummy() } };
}
