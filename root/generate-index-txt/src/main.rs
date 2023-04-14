mod index_txt;
mod p_at;
mod peercast_xml;
mod utils;

use std::{
    env,
    time::{Duration, SystemTime},
};

use anyhow::Result;
use chrono::{DateTime, FixedOffset, Utc};
use cloud_storage::client::ObjectClient;
use index_txt::IndexTxtChannel;
use p_at::{to_channel_infos_hash, to_index_txt, to_index_txt_channels, to_insecure_txt};
use tokio::{join, time::sleep};

use crate::peercast_xml::Peercast;

const ORIGIN: &str = "http://172.17.0.1:7144";

async fn fetch(peercast_password: &str) -> Result<String> {
    Ok(reqwest::Client::new()
        .get(format!("{}/admin?cmd=viewxml", ORIGIN))
        .basic_auth("admin", Some(peercast_password))
        .send()
        .await?
        .text()
        .await?)
}

async fn write<'a>(
    client: &'a ObjectClient<'a>,
    bucket: &str,
    path: &str,
    data: Vec<u8>,
    max_age: u32,
) -> Result<()> {
    let temp = format!("{}.temp", path);
    // TODO: XML API で x-goog-cache-control を使えば 1 リクエストで実現できそう
    let mut object = client
        .create(bucket, data, &temp, "text/plain; charset=UTF-8")
        .await?;
    object.cache_control = Some(format!("max-age={}", max_age));
    client.update(&object).await?;
    client.rewrite(&object, bucket, path).await?;
    client.delete(bucket, &temp).await?;
    Ok(())
}

fn check_hash_and_timestamp(
    uptime: u32,
    index_txt_channels: impl Iterator<Item = IndexTxtChannel>,
    hash: u64,
    hash_uptime: u32,
) -> Option<u64> {
    let current_hash = to_channel_infos_hash(index_txt_channels);
    if current_hash == hash && uptime < hash_uptime + 10 * 60 {
        return None;
    }
    Some(current_hash)
}

fn now() -> DateTime<FixedOffset> {
    DateTime::<Utc>::from(SystemTime::now())
        .with_timezone(&FixedOffset::east_opt(9 * 3600).unwrap())
}

#[tokio::main]
async fn main() -> Result<()> {
    env::var("GOOGLE_APPLICATION_CREDENTIALS_JSON").expect("GOOGLE_APPLICATION_CREDENTIALS_JSON");
    let bucket =
        env::var("GENERATE_INDEX_TXT_BUCKET_NAME").expect("GENERATE_INDEX_TXT_BUCKET_NAME");
    let peercast_password = env::var("PEERCAST_PASSWORD").expect("PEERCAST_PASSWORD");

    const UPDATE_INTERVAL: u32 = 20;
    let mut iteration = 0;
    let mut hash = 0;
    let mut hash_uptime = 0;
    loop {
        {
            let xml = fetch(&peercast_password).await?;
            let peercast: Peercast = quick_xml::de::from_str(&xml)?;
            let uptime = peercast.servent.uptime;
            let index_txt_channels: Vec<_> = to_index_txt_channels(&peercast).collect();

            let Some(new_hash) = check_hash_and_timestamp(
                uptime,
                index_txt_channels.clone().into_iter(),
                hash,
                hash_uptime,
            ) else {
                continue;
            };
            hash = new_hash;
            hash_uptime = uptime;

            let date = now();
            let client = cloud_storage::Client::new();
            let client = client.object();
            let (result1, result2) = join!(
                {
                    let index_txt_channels = index_txt_channels.clone();
                    async {
                        let index_txt = to_index_txt(uptime, index_txt_channels.into_iter(), date);
                        write(
                            &client,
                            &bucket,
                            "index.txt",
                            index_txt.into(),
                            UPDATE_INTERVAL + 10,
                        )
                        .await
                    }
                },
                {
                    async {
                        if iteration != 0 {
                            return Ok(());
                        }
                        let insecure_txt =
                            to_insecure_txt(uptime, index_txt_channels.into_iter(), date);
                        write(
                            &client,
                            &bucket,
                            "insecure/index.txt",
                            insecure_txt.into(),
                            UPDATE_INTERVAL * 180 + 10,
                        )
                        .await?;
                        Result::<_, anyhow::Error>::Ok(())
                    }
                }
            );
            result1?;
            result2?;
            iteration += 1;
            if iteration >= 180 {
                iteration = 0;
            }
        }
        sleep(Duration::from_secs(UPDATE_INTERVAL as u64)).await;
    }
}
