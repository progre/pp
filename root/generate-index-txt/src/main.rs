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
use p_at::{to_index_txt, to_insecure_txt};
use tokio::{join, time::sleep};

use crate::peercast_xml::Peercast;

const ORIGIN: &str = "http://172.17.0.1:7144";

async fn write<'a>(
    client: &'a ObjectClient<'a>,
    bucket: &str,
    filename: &str,
    data: Vec<u8>,
    max_age: u32,
) -> Result<()> {
    let temp = format!("{}.temp", filename);
    let mut object = client
        .create(bucket, data, &temp, "text/plain; charset=UTF-8")
        .await?;
    object.cache_control = Some(format!("max-age={}", max_age));
    client.update(&object).await?;
    client.rewrite(&object, bucket, filename).await?;
    client.delete(bucket, &temp).await?;
    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    env::var("GOOGLE_APPLICATION_CREDENTIALS_JSON").expect("GOOGLE_APPLICATION_CREDENTIALS_JSON");
    let bucket =
        env::var("GENERATE_INDEX_TXT_BUCKET_NAME").expect("GENERATE_INDEX_TXT_BUCKET_NAME");
    let peercast_password = env::var("PEERCAST_PASSWORD").expect("PEERCAST_PASSWORD");

    let update_interval = 60;
    loop {
        {
            let xml = reqwest::Client::new()
                .get(format!("{}/admin?cmd=viewxml", ORIGIN))
                .basic_auth("admin", Some(&peercast_password))
                .send()
                .await?
                .text()
                .await?;

            let peercast: Peercast = quick_xml::de::from_str(&xml)?;
            let date = DateTime::<Utc>::from(SystemTime::now())
                .with_timezone(&FixedOffset::east_opt(9 * 3600).unwrap());
            let index_txt = to_index_txt(&peercast, date);
            let insecure_txt = to_insecure_txt(&peercast, date);

            let client = cloud_storage::Client::new();
            let client = client.object();
            let (result1, result2) = join!(
                write(
                    &client,
                    &bucket,
                    "index.txt",
                    index_txt.into(),
                    update_interval + 10,
                ),
                write(
                    &client,
                    &bucket,
                    "insecure.txt",
                    insecure_txt.into(),
                    update_interval + 10,
                )
            );
            result1?;
            result2?;
        }
        sleep(Duration::from_secs(update_interval as u64)).await;
    }
}
