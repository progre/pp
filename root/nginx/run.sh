#!/bin/bash
set -eu

pushd /etc/nginx/conf.d/
envsubst \$INSECURE_DOMAIN < insecure.conf.template > insecure.conf
PEERCAST_BASIC_AUTH=$(echo -n "admin:$PEERCAST_PASSWORD" | base64) \
  envsubst "\$\$PEERCAST_BASIC_AUTH \$\$ROOT_DOMAIN" < root.conf.template > root.conf
popd

htpasswd -b -c /etc/nginx/.htpasswd admin "$PASSWORD"

echo -e "$ROOT_CRT" > "/etc/nginx/$ROOT_DOMAIN.crt"
echo -e "$ROOT_KEY" > "/etc/nginx/$ROOT_DOMAIN.key"

nginx -g "daemon off;"
