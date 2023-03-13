use std::time::SystemTime;

use chrono::{DateTime, FixedOffset, SecondsFormat, Utc};
use regex::Regex;

use crate::{index_txt::IndexTxtChannel, peercast_xml::Peercast, utils::to_day_to_secs_string};

const MESSAGE: &str = "index.txt の生成フローを改善するテスト";

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
    let uptime_string = to_day_to_secs_string(uptime);
    p_at_status(
        MESSAGE.into(),
        format!(
            "Uptime={} Updated={}",
            uptime_string,
            now.to_rfc3339_opts(SecondsFormat::Secs, true)
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

pub fn to_index_txt(peercast: Peercast, now: SystemTime) -> String {
    let header_virtual_channel = to_header_virtual_channel(peercast.servent.uptime, now);
    vec![header_virtual_channel]
        .into_iter()
        .chain(
            peercast
                .channels_found
                .channel
                .into_iter()
                .map(|x| x.into())
                .map(modify_channel),
        )
        .map(|channel| channel.into_string() + "\n")
        .collect::<Vec<_>>()
        .join("")
}
