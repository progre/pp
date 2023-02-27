#!/bin/sh

docker run \
  --rm \
  --mount type=volume,src=pp-acme-challenge,dst=/usr/share/nginx/html/.well-known/acme-challenge \
  --mount type=volume,src=pp-letsencrypt,dst=/etc/letsencrypt \
  certbot/certbot \
  certonly \
  --domain "$ROOT_DOMAIN" \
  --force-renewal \
  --webroot \
  --webroot-path /usr/share/nginx/html
docker exec nginx nginx -s reload
