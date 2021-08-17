```mermaid
flowchart TD;
  subgraph "リスナー"
    listener
    browser
    pecareco
  end

  subgraph "配信者"
    broadcaster
  end

  style pat fill:#0000
  subgraph pat["p@"]
    subgraph "p-at.net (Vercel)"
      isr["Vercel CDN"]
      www["next.js"]
    end

    style GCP fill:#0000
    subgraph GCP
      direction LR
      dns["Cloud DNS"]
      logger["Cloud Logger"]

      subgraph docker["Docker"]
        root["rootモードPeerCast"];
        nginxroot["Nginx(root.p-at.net)"]
        nginxinsecure["Nginx(insecure.p-at.net)"]
      end
    end
  end

  Terraform

  listener["リスナーのPeerCast"]--pcp-->broadcaster
  broadcaster["配信者のPeerCast"]--pcp-->root
  browser["PCYP"]--https-->isr
  pecareco["PeCaRecorder"]--http-->nginxinsecure
  nginxinsecure--https-->www
  isr--http-->www;
  www--https-->nginxroot;
  www--https-->logger
  nginxroot--http-->root;
  Terraform.->docker
  Terraform.->dns
  Terraform.->logger
```
