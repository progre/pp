FROM docker
RUN apk update && apk add openssl
CMD docker run \
  --detach \
  --env LOGFLARE_API_KEY \
  --mount type=volume,src=pp-fluent-bit,dst=/output/fluent-bit/etc/ \
  progre/pp-init:latest && \
  docker run \
  --detach \
  --mount type=volume,src=pp-fluent-bit,dst=/fluent-bit/etc/ \
  --publish 24224:24224 \
  fluent/fluent-bit && \
  peercast_password="$(openssl rand -base64 33 | tr '/+' '_-')" && \
  docker run \
  --detach \
  --env PEERCAST_PASSWORD=$peercast_password \
  --publish 7144:7144 \
  --restart always \
  progre/pp-peercast:latest && \
  docker run \
  --detach \
  --env PEERCAST_PASSWORD=$peercast_password \
  --env EMAIL_ADDRESS \
  --env INSECURE_DOMAIN \
  --env PASSWORD \
  --env ROOT_CRT \
  --env ROOT_DOMAIN \
  --env ROOT_KEY \
  --log-driver=fluentd \
  --publish 80:80 \
  --publish 443:443 \
  --restart always \
  progre/pp-nginx:latest
