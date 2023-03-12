use std::net::SocketAddr;

use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct Servent {
    #[serde(rename = "@uptime")]
    pub uptime: u32,
}

#[derive(Deserialize, Debug)]
pub struct Bandwidth {
    #[serde(rename = "@in")]
    pub in_: u32,
    #[serde(rename = "@out")]
    pub out: u32,
}

#[derive(Deserialize, Debug)]
pub struct Connections {
    #[serde(rename = "@total")]
    pub total: u32,
    #[serde(rename = "@relays")]
    pub relays: u32,
    #[serde(rename = "@direct")]
    pub direct: u32,
}

#[derive(Clone, Deserialize, Debug)]
pub struct Host {
    #[serde(rename = "@ip")]
    pub ip: SocketAddr,
    #[serde(rename = "@hops")]
    pub hops: u32,
    #[serde(rename = "@listeners")]
    pub listeners: u32,
    #[serde(rename = "@relays")]
    pub relays: u32,
    #[serde(rename = "@uptime")]
    pub uptime: u32,
    #[serde(rename = "@push")]
    pub push: u32,
    #[serde(rename = "@relay")]
    pub relay: u32,
    #[serde(rename = "@direct")]
    pub direct: u8,
    #[serde(rename = "@cin")]
    pub cin: u32,
    #[serde(rename = "@stable")]
    pub stable: u32,
    #[serde(rename = "@version")]
    pub version: u32,
    #[serde(rename = "@update")]
    pub update: u32,
    #[serde(rename = "@tracker")]
    pub tracker: u32,
}

#[derive(Clone, Deserialize, Debug)]
pub struct Hits {
    #[serde(rename = "@hosts")]
    pub hosts: u32,
    #[serde(rename = "@listeners")]
    pub listeners: u32,
    #[serde(rename = "@relays")]
    pub relays: u32,
    #[serde(rename = "@firewalled")]
    pub firewalled: u32,
    #[serde(rename = "@closest")]
    pub closest: u32,
    #[serde(rename = "@furthest")]
    pub furthest: u32,
    #[serde(rename = "@newest")]
    pub newest: u32,

    #[serde(default)]
    pub host: Vec<Host>,
}

#[derive(Clone, Deserialize, Debug)]
pub struct Track {
    #[serde(rename = "@title")]
    pub title: String,
    #[serde(rename = "@artist")]
    pub artist: String, // NOTE: ATOM 表現は crea(tor)
    #[serde(rename = "@album")]
    pub album: String,
    #[serde(rename = "@genre")]
    pub genre: String,
    #[serde(rename = "@contact")]
    pub contact: String, // NOTE: ATOM 表現は alb(u)m
}

#[derive(Clone, Deserialize, Debug)]
pub struct Channel {
    #[serde(rename = "@id")]
    pub id: String,
    #[serde(rename = "@name")]
    pub name: String,
    #[serde(rename = "@bitrate")]
    pub bitrate: u32,
    #[serde(rename = "@comment")]
    pub comment: String,
    #[serde(rename = "@desc")]
    pub desc: String,
    #[serde(rename = "@genre")]
    pub genre: String,
    #[serde(rename = "@type")]
    pub type_: String,
    #[serde(rename = "@url")]
    pub url: String,
    #[serde(rename = "@uptime")]
    pub uptime: u32,
    #[serde(rename = "@age")]
    pub age: u32,
    #[serde(rename = "@skip")]
    pub skip: u32,
    #[serde(rename = "@bcflags")]
    pub bcflags: u32,

    pub hits: Hits,
    pub relay: (),
    pub track: Track,
}

#[derive(Deserialize, Debug)]
pub struct ChannelsRelayed {
    #[serde(rename = "@total")]
    pub total: u32,

    #[serde(default)]
    pub channel: Vec<Channel>,
}

#[derive(Deserialize, Debug)]
pub struct ChannelsFound {
    #[serde(rename = "@total")]
    pub total: u32,

    #[serde(default)]
    pub channel: Vec<Channel>,
}

#[derive(Deserialize, Debug)]
pub struct Peercast {
    #[serde(rename = "@session")]
    pub session: String,

    pub servent: Servent,
    pub bandwidth: Bandwidth,
    pub connections: Connections,
    pub channels_relayed: ChannelsRelayed,
    pub channels_found: ChannelsFound,
}
