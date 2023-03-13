mod index_txt;
mod p_at;
mod peercast_xml;
mod utils;

use std::{env, time::Duration};

use anyhow::{anyhow, Result};
use chrono::DateTime;
use p_at::to_index_txt;
use tokio::time::sleep;

use crate::peercast_xml::Peercast;

const ORIGIN: &str = "http://172.17.0.1:7144";

#[tokio::main]
async fn main() -> Result<()> {
    env::var("GOOGLE_APPLICATION_CREDENTIALS_JSON").expect("GOOGLE_APPLICATION_CREDENTIALS_JSON");
    let bucket =
        env::var("GENERATE_INDEX_TXT_BUCKET_NAME").expect("GENERATE_INDEX_TXT_BUCKET_NAME");
    let peercast_password = env::var("PEERCAST_PASSWORD").expect("PEERCAST_PASSWORD");

    let update_interval = 10 * 60;
    loop {
        {
            let res = reqwest::Client::new()
                .get(format!("{}/admin?cmd=viewxml", ORIGIN))
                .basic_auth("admin", Some(&peercast_password))
                .send()
                .await?;
            let date = DateTime::parse_from_rfc2822(
                res.headers()
                    .get("Date")
                    .ok_or_else(|| anyhow!("Date is not found"))?
                    .to_str()?,
            )?;
            let xml = res.text().await?;

            let peercast: Peercast = quick_xml::de::from_str(&xml)?;
            let index_txt = to_index_txt(peercast, date);
            let client = cloud_storage::Client::new();
            let mut object = client
                .object()
                .create(
                    &bucket,
                    index_txt.into(),
                    "index.txt",
                    "text/plain; charset=UTF-8",
                )
                .await?;
            object.cache_control = Some(format!("max-age={}", update_interval + 60)); // 次のファイルをアップロードして cache_control を設定する時間の余裕を持つ
            client.object().update(&object).await?;
        }
        sleep(Duration::from_secs(update_interval)).await;
    }
}
