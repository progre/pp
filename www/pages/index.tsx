import { Container, Link } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { GetServerSidePropsResult } from 'next';
import NextLink from 'next/link';
import * as parser from 'peercast-yp-channels-parser';
import { useState } from 'react';
import CopyBox from '../components/CopyBox';
import Footer from '../components/Footer';
import Head from '../components/Head';
import SupportEmail from '../components/SupportEmail';
import dummyChannels from '../utils/channel/dummyChannels';
import { decrypt, encrypt } from '../utils/simplecrypt';

interface Props {
  dummyIndexTxt: string;
  cipheredSupportEmail: string;
}

export default function index(props: Props): JSX.Element {
  const [checkTerms, setCheckTerms] = useState(false);
  const [shownSupportEmail, setShownSupportEmail] = useState(false);

  const description =
    'p@ YP は PeerCast のライブストリーミングチャンネルの掲載所です。ソースコードは AGPL で公開されています。';
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
          お使いのソフトウェアに以下の URL を登録してください。
          <br />
          末尾の<code>index.txt</code>
          を含めるかどうかは各ソフトウェアにより異なります。
        </p>
        <CopyBox value="https://p-at.net/index.txt" />
        <p>
          ※<b>PeCaRecorder のみ</b>以下の URL を登録してください。
        </p>
        <CopyBox value="http://p-at.net/" />
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
          style={{ pointerEvents: 'none' }}
          control={
            <Checkbox
              style={{ pointerEvents: 'all' }}
              checked={checkTerms}
              onChange={(ev) => setCheckTerms(ev.target.checked)}
              color="primary"
            />
          }
          label={'利用規約の内容を確認し、同意した'}
        />
        <div style={{ minHeight: '22rem' }}>
          {!checkTerms ? (
            <div
              style={{
                height: '22rem',
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
                お使いの PeerCast に配信掲載 URL として以下の URL
                を登録してください。
              </p>
              <CopyBox value="pcp://root.p-at.net" />
              <p>
                以下の書式に従ってチャンネルのジャンルを設定すると、掲載の仕方を変更できます。
              </p>
              <samp>書式) [pp[?]][Genre]</samp>
              <br />
              <samp>例) pp?ゲーム</samp>
              <table style={{ margin: '1rem' }}>
                <tbody>
                  <tr>
                    <td style={{ display: 'block' }}>pp</td>
                    <td style={{ paddingLeft: '1rem' }}>
                      以下のオプションを使用することを示す記号です。掲載の仕方を変更する場合に付けてください。
                    </td>
                  </tr>
                  <tr>
                    <td style={{ display: 'block', paddingTop: '0.5rem' }}>
                      ?
                    </td>
                    <td style={{ paddingTop: '0.5rem', paddingLeft: '1rem' }}>
                      リスナー数を秘匿できます。
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        <h2>心得</h2>
        <p>
          やばいの（著作権的に一発アウトなものの垂れ流しなど）を掲載するのはお控えください。
        </p>
        <h2>制約事項</h2>
        <p>
          p@ YP に IPv4 チャンネルと IPv6
          チャンネルを同時に掲載することはできません。
          <br />
          これは技術的な問題によるものです。他の YP
          と併用して掲載するとうまくいきます。
          <br />
          <br />
          本家 PeerCast 系統のポート 0 配信も可能ですが、推奨しません。
          <br />
          バックエンドは peercast-yt
          なので受け付けは可能ですが、リスナー個々人も本系 PeerCast
          系統を使用して利用 YP を正しく設定する必要があります。
        </p>
      </article>
      <article style={{ marginTop: '6rem' }}>
        <h1>支援のお願い</h1>
        <p>
          p@ YP は広告等を掲載せずに個人によって運営されています。
          皆様からの支援はより良いサービスを長期的に提供する助けになります。
        </p>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li>
            <a target="_blank" href="https://progre.fanbox.cc/">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FavoriteIcon />}
              >
                PIXIV FANBOX で支援する
              </Button>
            </a>
          </li>
          <li style={{ marginTop: '1ex' }}>
            <a target="_blank" href="https://github.com/sponsors/progre">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FavoriteIcon />}
              >
                GitHub で支援する
              </Button>
            </a>
          </li>
        </ul>
      </article>
      <article id="contact" style={{ marginTop: '6rem' }}>
        <h1>連絡先</h1>
        <div>
          <Link
            href="https://twitter.com/p_at_yp"
            target="_blank"
            rel="noreferrer"
          >
            @p_at_yp
          </Link>
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', marginTop: '1ex' }}
        >
          <small style={{ fontSize: '11px', color: '#999' }}>
            ※メールでのご連絡をご希望の方は
          </small>
          <button
            style={{
              fontSize: '7px',
              padding: 0,
              color: '#777',
              marginLeft: '0.5em',
              marginRight: '0.5em',
            }}
            onClick={() => setShownSupportEmail(!shownSupportEmail)}
          >
            こちら
          </button>
          {!shownSupportEmail ? null : (
            <SupportEmail email={decrypt(props.cipheredSupportEmail)} />
          )}
        </div>
        <p>
          ※各ライブストリームの内容について配信者と連絡を取りたい場合は、掲載情報
          ( https://p-at.net/index.txt ) に掲載されているコンタクト URL や IP
          アドレスをご確認いただき、配信者に直接ご連絡していただきますようお願いいたします。p@
          YP
          は各ライブストリームの内容について関知しておらず、掲載されている情報以上の個人情報を収集しておりません。
        </p>
      </article>
      <Footer />
    </Container>
  );
}

export async function getStaticProps(): Promise<
  GetServerSidePropsResult<Props>
> {
  const now = new Date();
  return {
    props: {
      dummyIndexTxt: parser.stringify(dummyChannels(now), now) + '\n',
      cipheredSupportEmail: encrypt(
        process.env.SUPPORT_EMAIL ??
          '(現在メールでのサポートを受け付けておりません)'
      ),
    },
  };
}
