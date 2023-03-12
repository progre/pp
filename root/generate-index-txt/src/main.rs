mod index_txt;
mod peercast_xml;

use std::{
    env,
    time::{Duration, SystemTime},
};

use anyhow::Result;
use tokio::time::sleep;

use crate::{index_txt::to_index_txt, peercast_xml::Peercast};

const ORIGIN: &str = "http://172.17.0.1:7144";

#[tokio::main]
async fn main() -> Result<()> {
    env::var("GOOGLE_APPLICATION_CREDENTIALS_JSON").expect("GOOGLE_APPLICATION_CREDENTIALS_JSON");
    let bucket =
        env::var("GENERATE_INDEX_TXT_BUCKET_NAME").expect("GENERATE_INDEX_TXT_BUCKET_NAME");
    let peercast_password = env::var("PEERCAST_PASSWORD").expect("PEERCAST_PASSWORD");

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
            let index_txt = to_index_txt(peercast, SystemTime::now());
            cloud_storage::Client::new()
                .object()
                .create(
                    &bucket,
                    index_txt.into(),
                    "index.txt",
                    "text/plain; charset=UTF-8",
                )
                .await?;
        }
        sleep(Duration::from_secs(10 * 60)).await;
    }
}
