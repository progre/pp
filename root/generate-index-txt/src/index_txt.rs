use std::time::SystemTime;

use chrono::{DateTime, FixedOffset, Utc};
use regex::Regex;

use crate::peercast_xml::{Channel, Peercast};

const MESSAGE: &str = "index.txt の生成フローを改善するテスト";

struct IndexTxtChannel {
    name: String,
    id: String,
    ip: String,
    url: String,
    genre: String,
    desc: String,
    listeners: i32,
    relays: i32,
    bitrate: u32,
    type_: String,
    track_artist: String,
    track_album: String,
    track_title: String,
    track_contact: String,
    /**
     * NOTE: 似たパラメーターとして channel.age, channel.uptime, host.uptime がある。
     *       数回の観測では、channel.age は host.uptime よりも古く、channel.uptime は 0 固定だった。
     */
    age: u32,
    comment: String,
    direct: bool,
}

fn encode(src: &str) -> String {
    form_urlencoded::Serializer::new(String::new())
        .append_key_only(src)
        .finish()
}

impl IndexTxtChannel {
    fn into_string(self) -> String {
        let percent_encoded_name = encode(&self.name);
        [
            self.name,
            self.id,
            self.ip,
            self.url,
            self.genre,
            self.desc,
            self.listeners.to_string(),
            self.relays.to_string(),
            self.bitrate.to_string(),
            self.type_,
            self.track_artist,
            self.track_album,
            self.track_title,
            self.track_contact,
            percent_encoded_name,
            self.age.to_string(),
            "click".into(),
            self.comment,
            if self.direct { "1" } else { "0" }.into(),
        ]
        .join("<>")
    }
}

impl From<Channel> for IndexTxtChannel {
    fn from(value: Channel) -> Self {
        let host = value.hits.host.get(0);
        Self {
            name: value.name,
            id: value.id,
            ip: host.map(|host| host.ip.to_string()).unwrap_or_default(),
            url: value.url,
            genre: value.genre,
            desc: value.desc,
            listeners: host.map(|host| host.listeners).unwrap_or_default() as i32,
            relays: host.map(|host| host.relays).unwrap_or_default() as i32,
            bitrate: value.bitrate,
            type_: value.type_,
            track_artist: value.track.artist,
            track_album: value.track.album,
            track_title: value.track.title,
            track_contact: value.track.contact,
            age: value.age,
            comment: value.comment,
            direct: host.map(|host| host.direct).unwrap_or_default() == 1,
        }
    }
}

fn uptime_to_string(uptime: u32) -> String {
    let day = (uptime as f64 / 60.0 / 60.0 / 24.0) as u32;
    let hours = format!("{:02}", (((uptime as f64 / 60.0 / 60.0) as u32) % 24));
    let minutes = format!("{:02}", ((uptime as f64 / 60.0) as u32) % 60);
    let seconds = format!("{:02}", uptime % 60);
    format!("{}:{}:{}:{}", day, hours, minutes, seconds)
}

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
        age: 0,
        comment,
        direct: false,
    }
}

fn to_header_virtual_channel(uptime: u32, now: SystemTime) -> IndexTxtChannel {
    let now = DateTime::<Utc>::from(now).with_timezone(&FixedOffset::east_opt(9 * 3600).unwrap());
    let uptime_string = uptime_to_string(uptime);
    p_at_status(
        MESSAGE.into(),
        format!("Uptime: {} Updated: {}", uptime_string, now.to_rfc3339()),
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

fn index_txt_channels_to_index_txt(channels: Vec<IndexTxtChannel>) -> String {
    channels
        .into_iter()
        .map(|channel| channel.into_string() + "\n")
        .collect::<Vec<_>>()
        .join("")
}

pub fn to_index_txt(peercast: Peercast, now: SystemTime) -> String {
    let header_virtual_channel = to_header_virtual_channel(peercast.servent.uptime, now);
    let index_txt_channels = vec![header_virtual_channel]
        .into_iter()
        .chain(
            peercast
                .channels_found
                .channel
                .into_iter()
                .map(|x| x.into())
                .map(modify_channel),
        )
        .collect();
    index_txt_channels_to_index_txt(index_txt_channels)
}
