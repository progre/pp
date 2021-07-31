#!/bin/bash
set -eu

pushd /etc/nginx/conf.d/
envsubst < peercast.conf.template > peercast.conf
popd
pushd /root/.config/peercast/
PEERCAST_PASSWORD="$(openssl rand -base64 33)" envsubst < peercast.ini.template > peercast.ini
popd

htpasswd -b -c /etc/nginx/.htpasswd admin "$PASSWORD"

if [ "$DOMAIN" != localhost ]; then
  certbot --nginx -n -m "$EMAIL_ADDRESS" --agree-tos -d "$DOMAIN"
fi

nginx -g "daemon off;" &
./Peercast_YT-x86_64.AppImage --appimage-extract-and-run
