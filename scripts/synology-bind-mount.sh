#!/bin/sh

set -eu

SRC_CLOSET="/volume1/homes/xuxinxp/Drive/ChatGPT-Drive/徐欣/奢侈品/衣橱"
SRC_WATCH="/volume1/homes/xuxinxp/Drive/ChatGPT-Drive/徐欣/奢侈品/腕表"
SRC_WUPING_CLOSET="/volume1/Hermes-吴萍/衣橱"
DST_CLOSET="/volume1/Wardrobe/closet-sync"
DST_WATCH="/volume1/Wardrobe/watch-sync"
DST_WUPING_CLOSET="/volume1/Wardrobe/hermes-wuping-closet"
SMB_SHARE="//127.0.0.1/Wardrobe"
SMB_LOOP="/volume1/Wardrobe/drive-smb"
SMB_CREDENTIALS="/usr/local/etc/wardrobe-smb-credentials.conf"
CONTAINER_NAME="wardrobe-app"
DOCKER_BIN="/usr/local/bin/docker"

log() {
  echo "[wardrobe-bind] $1"
}

ensure_bind_mount() {
  src="$1"
  dst="$2"
  mkdir -p "$dst"

  if mount | grep -F "on $dst " >/dev/null 2>&1; then
    current_src="$(mount | awk -v target="$dst" '$3 == "on" && $4 == target { print $1; exit }')"
    if [ "$current_src" = "$src" ]; then
      return 0
    fi
    umount "$dst" || true
  fi

  mount --bind "$src" "$dst"
}

ensure_cifs_mount() {
  if mount | grep -F "on $SMB_LOOP " >/dev/null 2>&1; then
    current_src="$(mount | awk -v target="$SMB_LOOP" '$3 == "on" && $4 == target { print $1; exit }')"
    if [ "$current_src" = "$SMB_SHARE" ]; then
      return 0
    fi
    umount "$SMB_LOOP" || true
  fi

  if [ ! -d "$SMB_LOOP" ]; then
    mkdir -p "$SMB_LOOP"
  fi

  if [ ! -f "$SMB_CREDENTIALS" ]; then
    log "missing SMB credentials: $SMB_CREDENTIALS"
    return 1
  fi

  mount.cifs "$SMB_SHARE" "$SMB_LOOP" -o "credentials=$SMB_CREDENTIALS,vers=3.0,iocharset=utf8,uid=0,gid=0,file_mode=0777,dir_mode=0777"
}

restart_container() {
  if [ ! -x "$DOCKER_BIN" ]; then
    return 0
  fi

  tries=0
  while [ "$tries" -lt 24 ]; do
    if "$DOCKER_BIN" ps >/dev/null 2>&1; then
      if "$DOCKER_BIN" inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
        "$DOCKER_BIN" restart "$CONTAINER_NAME" >/dev/null 2>&1 || "$DOCKER_BIN" start "$CONTAINER_NAME" >/dev/null 2>&1 || true
      fi
      return 0
    fi
    tries=$((tries + 1))
    sleep 5
  done

  log "docker daemon not ready; skipped container restart"
  return 0
}

run_start() {
  tries=0
  while [ "$tries" -lt 24 ]; do
    if [ -d "$SRC_CLOSET" ] && [ -d "$SRC_WATCH" ]; then
      ensure_bind_mount "$SRC_CLOSET" "$DST_CLOSET"
      ensure_bind_mount "$SRC_WATCH" "$DST_WATCH"
      if [ -d "$SRC_WUPING_CLOSET" ]; then
        ensure_bind_mount "$SRC_WUPING_CLOSET" "$DST_WUPING_CLOSET"
      else
        mkdir -p "$DST_WUPING_CLOSET"
        log "optional WuPing source not found; using local placeholder: $DST_WUPING_CLOSET"
      fi
      ensure_cifs_mount
      restart_container
      log "bind mounts and SMB loop ready"
      return 0
    fi
    tries=$((tries + 1))
    sleep 5
  done

  log "source directories not ready"
  return 1
}

run_stop() {
  umount "$SMB_LOOP" 2>/dev/null || true
  umount "$DST_CLOSET" 2>/dev/null || true
  umount "$DST_WATCH" 2>/dev/null || true
  umount "$DST_WUPING_CLOSET" 2>/dev/null || true
  return 0
}

case "${1:-start}" in
  start)
    run_start
    ;;
  stop)
    run_stop
    ;;
  restart)
    run_stop
    run_start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
    ;;
esac
