#!/bin/bash
set -eu

pushd /root/.config/peercast/
envsubst < peercast.ini.template > peercast.ini
popd

./Peercast_YT-x86_64.AppImage --appimage-extract-and-run
