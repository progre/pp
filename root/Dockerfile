FROM docker
RUN apk update && apk add openssl
CMD peercast_password="$(openssl rand -base64 33 | tr '/+' '_-')" && \
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
  --publish 80:80 \
  --publish 443:443 \
  --restart always \
  progre/pp-nginx:latest
