#!/bin/bash
set -eu

cp /etc/nginx/conf.d/.htpasswd /etc/nginx/
cp "/etc/nginx/conf.d/$ROOT_DOMAIN.crt" /etc/nginx/
cp "/etc/nginx/conf.d/$ROOT_DOMAIN.key" /etc/nginx/

nginx -g "daemon off;"
