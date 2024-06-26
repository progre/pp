use crate::{peercast_xml, utils::to_minutes_to_secs_string};

#[derive(Clone, Hash)]
pub struct Channel {
    pub name: String,
    pub id: String,
    pub ip: String,
    pub url: String,
    pub genre: String,
    pub desc: String,
    pub listeners: i32,
    pub relays: i32,
    pub bitrate: u32,
    pub type_: String,
    pub track_artist: String,
    pub track_album: String,
    pub track_title: String,
    pub track_contact: String,
    /**
     * NOTE: 似たパラメーターとして channel.age, channel.uptime, channel.host.uptime がある。
     *       channel.age は YP が受け取ってからの時間、channel.host.uptime は配信元の配信時間。
     *       channel.age が channel.host.uptime よりも古くなることがある。
     *       恐らく channel.host.uptime は映像ストリームを受け取ってからの時間。
     *       peercast-yt においては channel.uptime は 0 固定。
     */
    pub uptime_minutes: u32,
    pub comment: String,
    pub direct: bool,
}

fn encode(src: &str) -> String {
    form_urlencoded::Serializer::new(String::new())
        .append_key_only(src)
        .finish()
}

impl Channel {
    pub fn into_string(self) -> String {
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
            to_minutes_to_secs_string(self.uptime_minutes),
            "click".into(),
            self.comment,
            if self.direct { "1" } else { "0" }.into(),
        ]
        .join("<>")
    }
}

impl From<peercast_xml::Channel> for Channel {
    fn from(value: peercast_xml::Channel) -> Self {
        let host = value.hits.host.first();
        Self {
            name: value.name,
            id: value.id,
            ip: host
                .and_then(|host| host.ip.map(|ip| ip.to_string()))
                .unwrap_or_default(),
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
            uptime_minutes: host.map(|host| host.uptime).unwrap_or_default() / 60,
            comment: value.comment,
            direct: host.map(|host| host.direct).unwrap_or_default() == 1,
        }
    }
}

impl From<&peercast_xml::Channel> for Channel {
    fn from(value: &peercast_xml::Channel) -> Self {
        let host = value.hits.host.first();
        Self {
            name: value.name.clone(),
            id: value.id.clone(),
            ip: host
                .and_then(|host| host.ip.map(|ip| ip.to_string()))
                .unwrap_or_default(),
            url: value.url.clone(),
            genre: value.genre.clone(),
            desc: value.desc.clone(),
            listeners: host.map(|host| host.listeners).unwrap_or_default() as i32,
            relays: host.map(|host| host.relays).unwrap_or_default() as i32,
            bitrate: value.bitrate,
            type_: value.type_.clone(),
            track_artist: value.track.artist.clone(),
            track_album: value.track.album.clone(),
            track_title: value.track.title.clone(),
            track_contact: value.track.contact.clone(),
            uptime_minutes: host.map(|host| host.uptime).unwrap_or_default() / 60,
            comment: value.comment.clone(),
            direct: host.map(|host| host.direct).unwrap_or_default() == 1,
        }
    }
}

pub fn join(channels: impl Iterator<Item = Channel>) -> String {
    channels
        .map(|channel| channel.into_string() + "\n")
        .collect::<String>()
}
