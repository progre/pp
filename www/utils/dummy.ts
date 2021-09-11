import arrayShuffle from 'array-shuffle';
import * as parser from 'peercast-yp-channels-parser';
import { Channel } from 'peercast-yp-channels-parser';

function generateId(): string {
  const random = (): string =>
    Math.floor(Math.random() * 2 ** 32)
      .toString(16)
      .padStart(8, '0')
      .toUpperCase();
  return random() + random() + random() + random();
}

function generateIp(): string {
  const random = (): number => (Math.random() * 256) | 0;
  return `${random()}.${random()}.${random()}.${random()}`;
}

function generateUrl(): string {
  const random = (): number =>
    Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  return `https://bbs.example/${random()}/${random()}`;
}

function generateGenre(): string {
  const genres = ['お絵かき', 'プログラミング', '模型', '作業'];
  const idx = (Math.random() * 20) | 0;
  return idx >= 4 ? 'Game' : genres[idx];
}

function generateHiragana(): string {
  return [...Array((Math.random() * 40) | 0)]
    .map(() =>
      String.fromCodePoint(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ('ぁ'.codePointAt(0)! + Math.random() * 0x53) | 0
      )
    )
    .join('');
}

export default function dummy(): string {
  const now = new Date();
  const channelNames = arrayShuffle([
    'ざーか狂',
    'あらの',
    'ざいど',
    'えふれいん',
    'げおるぎい',
    'あすみる',
    'ぎえどりゅす',
    '天涯孤独',
    '金剛石',
    'アニドを凝視する者',
    'みつかど',
    'けががん',
    'てろ',
    'ぱおるくさ',
    'わるてる',
    'ゆりつるふぃ',
    'やいろごいと',
    'まてゅー',
    'よんね',
    'ふろれんつ',
    'りゅしぐ',
    'うぇるぎうす',
    'ぐたねる',
    'かえりあん',
    'ボマチ',
    'ベチョをもたらす者',
    'あどりあーん',
    '不調法なインヴェーダー',
    'かーるとん',
    'ろにん',
    'しるら',
    'ぼち',
    'きりるれの',
    '解析を祈る者',
    '寿影使い',
  ]);
  const channels = channelNames.map(
    (x): Channel => ({
      name: x,
      id: generateId(),
      ip: generateIp(),
      url: generateUrl(),
      genre: generateGenre(),
      desc: generateHiragana(),
      bandwidthType: '',
      listeners: -1,
      relays: -1,
      bitrate: (400 + Math.random() * 2100) | 0,
      type: 'FLV',
      track: {
        creator: '',
        album: '',
        title: '',
        url: '',
        // genre: '',
      },
      createdAt: Math.floor(
        now.getTime() - Math.random() * 12 * 60 * 60 * 1000
      ),
      comment: generateHiragana(),
      direct: false,
    })
  );
  return parser.stringify(channels, now);
}
