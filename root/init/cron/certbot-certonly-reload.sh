#!/bin/bash

docker run \
  --rm \
  --mount type=volume,src=pp-acme-challenge,dst=/usr/share/nginx/html/.well-known/acme-challenge,readonly \
  --mount type=volume,src=pp-letsencrypt,dst=/etc/letsencrypt,readonly \
  certbot/certbot \
  certonly \
  --domain test.prgrssv.net \
  --force-renewal \
  --webroot \
  --webroot-path /usr/share/nginx/html
docker exec nginx nginx -s reload
