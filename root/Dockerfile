FROM docker
RUN apk update && apk add openssl
CMD peercast_password="$(openssl rand -base64 33 | tr '/+' '_-')" && \
  docker run \
  --env INSECURE_DOMAIN \
  --env LOGFLARE_URI \
  --env PASSWORD \
  --env PEERCAST_PASSWORD=$peercast_password \
  --env ROOT_CRT \
  --env ROOT_DOMAIN \
  --env ROOT_KEY \
  --env TZ=Asia/Tokyo \
  --mount type=volume,src=pp-fluent-bit,dst=/output/fluent-bit/ \
  --mount type=volume,src=pp-nginx,dst=/output/nginx/ \
  progre/pp-init:latest && \
  \
  docker run \
  --rm \
  --env TZ=Asia/Tokyo \
  --mount type=volume,src=pp-letsencrypt,dst=/etc/letsencrypt \
  --publish 80:80 \
  --publish 443:443 \
  certbot/certbot \
  certonly \
  --agree-tos \
  --domain "$ROOT_DOMAIN" \
  --email "$EMAIL_ADDRESS" \
  --no-eff-email \
  --standalone && \
  \
  docker run \
  --detach \
  --env TZ=Asia/Tokyo \
  --mount type=volume,src=pp-fluent-bit,dst=/fluent-bit/etc/ \
  --name fluent-bit \
  --publish 24224:24224 \
  --restart always \
  fluent/fluent-bit && \
  \
  docker run \
  --detach \
  --env PEERCAST_PASSWORD=$peercast_password \
  --env PORT=7144 \
  --env TZ=Asia/Tokyo \
  --name peercast \
  --publish 7144:7144 \
  --restart always \
  progre/pp-peercast:latest && \
  \
  docker run \
  --detach \
  --env PEERCAST_PASSWORD=$peercast_password \
  --env PORT=7146 \
  --env TZ=Asia/Tokyo \
  --name peercast-next \
  --publish 7146:7146 \
  --restart always \
  progre/pp-peercast:next && \
  \
  docker run \
  --detach \
  --env ROOT_DOMAIN \
  --env TZ=Asia/Tokyo \
  --log-driver=fluentd \
  --mount type=volume,src=pp-acme-challenge,dst=/usr/share/nginx/html/.well-known/acme-challenge,readonly \
  --mount type=volume,src=pp-letsencrypt,dst=/etc/letsencrypt,readonly \
  --mount type=volume,src=pp-nginx,dst=/etc/nginx/conf.d/ \
  --name nginx \
  --publish 80:80 \
  --publish 443:443 \
  --publish 7443:7443 \
  --restart always \
  nginx:stable \
  /etc/nginx/conf.d/run.sh && \
  \
  docker run \
  --detach \
  --env TZ=Asia/Tokyo \
  --mount type=volume,src=/var/run/docker.sock,dst=/var/run/docker.sock \
  --name cron \
  --restart always \
  progre/pp-cron:latest
