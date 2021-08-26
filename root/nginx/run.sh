#!/bin/bash
set -eu

pushd /etc/nginx/conf.d/
envsubst \$INSECURE_DOMAIN < insecure.conf.template > insecure.conf
PEERCAST_BASIC_AUTH=$(echo -n "admin:$PEERCAST_PASSWORD" | base64) \
  envsubst "\$\$PEERCAST_BASIC_AUTH \$\$ROOT_DOMAIN" < root.conf.template > root.conf
popd

htpasswd -b -c /etc/nginx/.htpasswd admin "$PASSWORD"

if [ "$ROOT_DOMAIN" != localhost ]; then
  certbot --nginx -n -m "$EMAIL_ADDRESS" --agree-tos -d "$ROOT_DOMAIN"
  nginx -s quit
fi

nginx -g "daemon off;"
