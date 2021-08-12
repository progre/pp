#!/bin/bash
set -eu

pushd /etc/nginx/conf.d/
envsubst \$ROOT_DOMAIN < root.conf.template > root.conf
envsubst \$INSECURE_DOMAIN < insecure.conf.template > insecure.conf
popd
pushd /root/.config/peercast/
PEERCAST_PASSWORD="$(openssl rand -base64 33)" envsubst < peercast.ini.template > peercast.ini
popd

htpasswd -b -c /etc/nginx/.htpasswd admin "$PASSWORD"

if [ "$ROOT_DOMAIN" != localhost ]; then
  certbot --nginx -n -m "$EMAIL_ADDRESS" --agree-tos -d "$ROOT_DOMAIN"
fi

nginx -g "daemon off;" &
./Peercast_YT-x86_64.AppImage --appimage-extract-and-run
