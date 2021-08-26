FROM ubuntu:latest
RUN apt update && \
  apt install --yes gettext curl && \
  curl --remote-name --location https://github.com/plonk/peercast-yt/releases/download/v0.3.8/Peercast_YT-x86_64.AppImage && \
  apt-get purge --yes curl && \
  apt-get clean

RUN chmod 755 Peercast_YT-x86_64.AppImage
ADD peercast/peercast.ini.template /root/.config/peercast/
ADD peercast/run.sh /
RUN chmod 755 run.sh

EXPOSE 7144
CMD ["/run.sh"]
