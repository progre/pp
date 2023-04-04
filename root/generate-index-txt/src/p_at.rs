use chrono::{DateTime, FixedOffset, SecondsFormat};
use regex::Regex;

use crate::{
    index_txt::{join, IndexTxtChannel},
    peercast_xml::Peercast,
    utils::to_day_to_secs_string,
};

const MESSAGE: &str = "平常運転";

fn p_at_status(desc: String, comment: String) -> IndexTxtChannel {
    IndexTxtChannel {
        name: "p@◆Status".into(),
        id: "00000000000000000000000000000000".into(),
        ip: "".into(),
        url: "https://mastodon-japan.net/@p_at".into(),
        genre: "".into(),
        desc,
        listeners: -9,
        relays: -9,
        bitrate: 0,
        type_: "RAW".into(),
        track_artist: "".into(),
        track_album: "".into(),
        track_title: "".into(),
        track_contact: "".into(),
        age_minutes: 0,
        comment,
        direct: false,
    }
}

fn insecure_p_at_statuses() -> Vec<IndexTxtChannel> {
    fn channel(idx: usize, params: (&str, &str, &str)) -> IndexTxtChannel {
        IndexTxtChannel {
            name: format!("p@◆{}", params.0),
            id: "00000000000000000000000000000000".into(),
            ip: "".into(),
            url: params.2.into(),
            genre: "".into(),
            desc: params.1.into(),
            listeners: 9999 - idx as i32,
            relays: 9999 - idx as i32,
            bitrate: 0,
            type_: "RAW".into(),
            track_artist: "".into(),
            track_album: "".into(),
            track_title: "".into(),
            track_contact: "".into(),
            age_minutes: 0,
            comment: "".into(),
            direct: false,
        }
    }
    [
        ("Warning ※必ずお読みください (1)", "お使いの p@ YP の URL は廃止されます。新しい URL に変更してください。", "https://p-at.net"),
        ("Warning ※必ずお読みください (2)", "新しい URL に変更するには、ウィンドウ上部メニューバーの オプション(O) かツールバーの 歯車アイコン をクリックして 全般の設定 をクリックし、", "https://p-at.net"),
        ("Warning ※必ずお読みください (3)", "YP タブの p@ の項目の URL を「http://insecure.p-at.net/」から「http://p-at.net/」に変更してください。", "https://p-at.net"),
        ("Warning ※必ずお読みください (4)", "【注意1】新しい設定を追加するのではなく、設定を書き換えてください。同じ YP の設定が複数あると誤動作を起こします。", "https://p-at.net"),
        ("Warning ※必ずお読みください (5)", "【注意2】Windows 10 より古い環境は動作保証外です。Windows 10 以降へアップデートしてから使用してください。", "https://p-at.net"),
        ("Info 支援のお願い (1)", "p@ YP は広告等を掲載せずに個人によって運営されています。 皆様からの支援はより良いサービスを長期的に提供する助けになります。", "https://p-at.net"),
        ("Info 支援のお願い (2)", "GitHub から支援する場合(推奨)は、こちらのコンタクト URL からお願いします。", "https://github.com/sponsors/progre"),
        ("Info 支援のお願い (3)", "PIXIV FANBOX から支援する場合は、こちらのコンタクト URL からお願いします。", "https://progre.fanbox.cc/"),
    ].into_iter().enumerate().map(|(idx, params)| channel(idx, params)).collect()
}

fn to_header_virtual_channel(uptime: u32, date: DateTime<FixedOffset>) -> IndexTxtChannel {
    let uptime_string = to_day_to_secs_string(uptime);
    p_at_status(
        MESSAGE.into(),
        format!(
            "Uptime={} Updated={}",
            uptime_string,
            date.to_rfc3339_opts(SecondsFormat::Secs, true)
        ),
    )
}

fn modify_channel(mut channel: IndexTxtChannel) -> IndexTxtChannel {
    let genre_src = channel.genre;
    let genre: String;
    let naisho;
    if let Some(genre_in_src) = {
        Regex::new(r"pp\?(.*)")
            .unwrap()
            .captures(&genre_src)
            .and_then(|x| x.get(1))
    } {
        genre = genre_in_src.as_str().to_owned();
        naisho = true;
    } else if let Some(genre_in_src) = {
        Regex::new(r"pp(.*)")
            .unwrap()
            .captures(&genre_src)
            .and_then(|x| x.get(1))
    } {
        genre = genre_in_src.as_str().to_owned();
        naisho = false;
    } else {
        genre = genre_src;
        naisho = false;
    }

    channel.genre = genre;
    if naisho {
        channel.listeners = -1;
        channel.relays = -1;
    }
    channel
}

fn to_index_txt_channels(peercast: &Peercast) -> impl Iterator<Item = IndexTxtChannel> + '_ {
    peercast
        .channels_found
        .channel
        .iter()
        .filter(|x| !x.hits.host.is_empty()) // NOTE: 配信終了直後に host が空で残ることがある
        .map(|x| -> IndexTxtChannel { x.into() })
        .map(modify_channel)
}

pub fn to_index_txt(peercast: &Peercast, date: DateTime<FixedOffset>) -> String {
    join(
        [to_header_virtual_channel(peercast.servent.uptime, date)]
            .into_iter()
            .chain(to_index_txt_channels(peercast)),
    )
}

pub fn to_insecure_txt(peercast: &Peercast, date: DateTime<FixedOffset>) -> String {
    join(
        [to_header_virtual_channel(peercast.servent.uptime, date)]
            .into_iter()
            .chain(insecure_p_at_statuses())
            .chain(to_index_txt_channels(peercast)),
    )
}
