```mermaid
flowchart TD;
  subgraph "リスナー"
    listener
    browser
  end

  subgraph "配信者"
    broadcaster
  end

  Terraform.->docker
  Terraform.->dns

  style pat fill:#0000
  subgraph pat["p@"]
    subgraph "p-at.net (Vercel)"
      isr["Vercel ISR<br>(自動キャッシュ管理)"]
      www["next.js"]
    end

    style GCP fill:#0000
    subgraph GCP
      direction LR
      dns["Cloud DNS"]

      subgraph docker["root.p-at.net (Docker)"]
        root["rootモードPeerCast"];
        nginx["Nginx"]
      end
    end
  end

  listener["リスナーのPeerCast"]--pcp-->broadcaster
  broadcaster["配信者のPeerCast"]--pcp-->root
  browser["PCYP"]--http/https-->isr
  isr--http-->www;
  www--https-->nginx;
  nginx--http-->root;
```
