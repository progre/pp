FROM nginx:stable
RUN apt update && \
  apt install --yes apache2-utils certbot python3-certbot-nginx && \
  apt-get clean

RUN rm /etc/nginx/conf.d/default.conf
ADD nginx/root.conf.template /etc/nginx/conf.d/
ADD nginx/insecure.conf.template /etc/nginx/conf.d/
ADD nginx/cron.d/certbot /etc/cron.d/

ADD nginx/run.sh /
RUN chmod 755 run.sh

EXPOSE 80 443
CMD ["/run.sh"]
