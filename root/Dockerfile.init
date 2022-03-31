# NOTE: dood コンテナーはテンプレートファイルにアクセスできるが、ボリュームにアクセスできない。
#       ubuntu コンテナーはテンプレートファイルにアクセスできないが、ボリュームにアクセスできる。
#       従って、テンプレートファイルを詰めた init 用のコンテナーを実行し、ボリュームに成果物を保存する。

FROM ubuntu:latest
RUN apt update && \
  apt install --yes gettext && \
  apt-get clean
ADD init/fluent-bit/fluent-bit.conf.template /work/fluent-bit/
WORKDIR /work/
CMD envsubst \$LOGFLARE_API_KEY < fluent-bit/fluent-bit.conf.template > /output/fluent-bit/etc/fluent-bit.conf
