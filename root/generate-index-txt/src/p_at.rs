use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
};

use chrono::{DateTime, FixedOffset, SecondsFormat};
use regex::Regex;

use crate::{
    index_txt::{join, Channel},
    peercast_xml::Peercast,
    utils::to_day_to_secs_string,
};

const MESSAGE: &str = "平常運転";

fn p_at_status(desc: String, comment: String) -> Channel {
    Channel {
        name: "p@◆Status".into(),
        id: "00000000000000000000000000000000".into(),
        ip: String::new(),
        url: "https://bsky.app/profile/p-at.net".into(),
        genre: String::new(),
        desc,
        listeners: -9,
        relays: -9,
        bitrate: 0,
        type_: "RAW".into(),
        track_artist: String::new(),
        track_album: String::new(),
        track_title: String::new(),
        track_contact: String::new(),
        age_minutes: 0,
        comment,
        direct: false,
    }
}

fn insecure_p_at_statuses() -> Vec<Channel> {
    fn channel(idx: usize, params: (&str, &str, &str)) -> Channel {
        Channel {
            name: format!("p@◆{}", params.0),
            id: "00000000000000000000000000000000".into(),
            ip: String::new(),
            url: params.2.into(),
            genre: String::new(),
            desc: params.1.into(),
            listeners: 9999 - idx as i32,
            relays: 9999 - idx as i32,
            bitrate: 0,
            type_: "RAW".into(),
            track_artist: String::new(),
            track_album: String::new(),
            track_title: String::new(),
            track_contact: String::new(),
            age_minutes: 0,
            comment: String::new(),
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

fn to_header_virtual_channel(uptime: u32, date: DateTime<FixedOffset>) -> Channel {
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

fn modify_channel(mut channel: Channel) -> Channel {
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

pub fn to_index_txt_channels(peercast: &Peercast) -> impl Iterator<Item = Channel> + '_ {
    peercast
        .channels_found
        .channel
        .iter()
        .filter(|x| !x.hits.host.is_empty()) // NOTE: 配信終了直後に host が空で残ることがある
        .map(|x| -> Channel { x.into() })
        .map(modify_channel)
}

pub fn to_index_txt(
    uptime: u32,
    index_txt_channels: impl Iterator<Item = Channel>,
    date: DateTime<FixedOffset>,
) -> String {
    join(
        [to_header_virtual_channel(uptime, date)]
            .into_iter()
            .chain(index_txt_channels),
    )
}

pub fn to_insecure_txt(
    uptime: u32,
    index_txt_channels: impl Iterator<Item = Channel>,
    date: DateTime<FixedOffset>,
) -> String {
    join(
        [to_header_virtual_channel(uptime, date)]
            .into_iter()
            .chain(insecure_p_at_statuses())
            .chain(index_txt_channels),
    )
}

pub fn to_channel_infos_hash(index_txt_channelscast: impl Iterator<Item = Channel>) -> u64 {
    let mut hasher = DefaultHasher::new();
    index_txt_channelscast
        .map(|mut channel| {
            channel.age_minutes = 0;
            channel
        })
        .collect::<Vec<_>>()
        .hash(&mut hasher);
    hasher.finish()
}
