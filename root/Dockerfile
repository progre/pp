# FROM ubuntu:latest
FROM nginx:stable
RUN apt update && \
  apt install --yes apache2-utils certbot curl nginx python3-certbot-nginx && \
  curl --remote-name --location https://github.com/plonk/peercast-yt/releases/download/v0.3.7/Peercast_YT-x86_64.AppImage && \
  apt-get purge --yes curl && \
  apt-get clean

RUN rm /etc/nginx/conf.d/default.conf
ADD nginx/root.conf.template /etc/nginx/conf.d/
ADD nginx/insecure.conf.template /etc/nginx/conf.d/
ADD cron.d/certbot /etc/cron.d/

RUN chmod 755 Peercast_YT-x86_64.AppImage
ADD peercast/peercast.ini.template /root/.config/peercast/
ADD run.sh /
RUN chmod 755 run.sh

EXPOSE 80 443 7144
CMD ["/run.sh"]
