```mermaid
flowchart TD

subgraph "リスナー"
  listener
  browser
  pecareco
end

subgraph "配信者"
  broadcaster
end

subgraph "GitHub"
  Repository
  gha -.-> Repository
end

style pat fill:#0000
subgraph pat["p@YP"]
  subgraph vercel["p-at.net (Vercel)"]
    isr["Vercel CDN\n(https://p-at.net)"]
    www["index.txt 配信用 HTTP サーバー\n(Next.js)"]
  end

  subgraph GCP
    direction TB
    subgraph GCE
      subgraph docker1["Docker1"]
        nginxroot["Nginx\n(https://root.p-at.net)"]
        nginxinsecure["Nginx\n(http://insecure.p-at.net)"]
      end
      subgraph docker2["Docker2"]
        root["root モード PeerCast\n(pcp://root.p-at.net)"];
      end
    end
    dns["Cloud DNS"]
    logger["Cloud Logger"]
  end
end

listener["リスナーの PeerCast"]--pcp-->broadcaster
broadcaster["配信者の PeerCast"]--pcp-->root
browser["PCYP"]--https-->isr
pecareco["PeCaRecorder 等の https 未対応の PCYP"]--http-->nginxinsecure
nginxinsecure--https-->isr
isr--http-->www;
www--https-->logger
www--https-->nginxroot;
nginxroot--http-->root;

gha["GitHub Action"] -."Terraform".-> GCP
www -.Pull.-> Repository
```
