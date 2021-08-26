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

    subgraph GCP
      direction TB
      subgraph GCE
        subgraph docker1["Docker"]
          nginxroot["Nginx(root.p-at.net)"]
          nginxinsecure["Nginx(insecure.p-at.net)"]
          Certbot
        end
        subgraph docker2["Docker"]
          root["rootモードPeerCast"];
        end
      end
      dns["Cloud DNS"]
      logger["Cloud Logger"]
    end
  end

  Certbot.->nginxroot
  listener["リスナーのPeerCast"]--pcp-->broadcaster
  broadcaster["配信者のPeerCast"]--pcp-->root
  browser["PCYP"]--https-->isr
  pecareco["PCYP (PeCaRecorder等のhttps未対応のソフト)"]--http-->nginxinsecure
  nginxinsecure--https-->www
  isr--http-->www;
  www--https-->logger
  www--https-->nginxroot;
  nginxroot--http-->root;
  Certbot.->letsencrypt["Let's Encrypt"]
```
