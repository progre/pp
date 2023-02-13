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
  --mount type=volume,src=pp-fluent-bit,dst=/output/fluent-bit/ \
  --mount type=volume,src=pp-nginx,dst=/output/nginx/ \
  progre/pp-init:latest && \
  docker run \
  --detach \
  --mount type=volume,src=pp-fluent-bit,dst=/fluent-bit/etc/ \
  --publish 24224:24224 \
  --restart always \
  fluent/fluent-bit && \
  docker run \
  --detach \
  --env PEERCAST_PASSWORD=$peercast_password \
  --env PORT=7144 \
  --publish 7144:7144 \
  --restart always \
  progre/pp-peercast:latest && \
  docker run \
  --detach \
  --env PEERCAST_PASSWORD=$peercast_password \
  --env PORT=7146 \
  --publish 7146:7146 \
  --restart always \
  progre/pp-peercast:next && \
  docker run \
  --detach \
  --env ROOT_DOMAIN \
  --env TZ=Asia/Tokyo \
  --log-driver=fluentd \
  --mount type=volume,src=pp-nginx,dst=/etc/nginx/conf.d/ \
  --publish 80:80 \
  --publish 443:443 \
  --publish 7443:7443 \
  --restart always \
  nginx:stable \
  /etc/nginx/conf.d/run.sh
