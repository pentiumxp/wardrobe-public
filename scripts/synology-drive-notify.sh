#!/bin/sh

set -eu

QUEUE_DIR="/volume1/Wardrobe/appdata/data/drive-notify-queue"
PID_FILE="/var/run/wardrobe-drive-notify.pid"
LOG_FILE="/var/log/wardrobe-drive-notify.log"
SYNOINDEX_BIN="/usr/syno/bin/synoindex"

log() {
  echo "[wardrobe-drive-notify] $1"
}

process_request() {
  req="$1"
  [ -f "$req" ] || return 0

  target="$(tr -d '\r' < "$req" | head -n 1)"
  [ -n "$target" ] || {
    rm -f "$req"
    return 0
  }

  if [ ! -f "$target" ]; then
    rm -f "$req"
    return 0
  fi

  dir="$(dirname "$target")"
  base="$(basename "$target")"
  pulse="$dir/${base}.hostsync.$$"

  mv "$target" "$pulse" 2>/dev/null || true
  sleep 1
  mv "$pulse" "$target" 2>/dev/null || true
  touch "$target" 2>/dev/null || true
  sync || true

  if [ -x "$SYNOINDEX_BIN" ]; then
    "$SYNOINDEX_BIN" -a "$target" >/dev/null 2>&1 || true
    "$SYNOINDEX_BIN" -R "$dir" >/dev/null 2>&1 || true
  fi

  rm -f "$req"
}

run_loop() {
  mkdir -p "$QUEUE_DIR"
  while true; do
    found=0
    for req in "$QUEUE_DIR"/*.req; do
      [ -e "$req" ] || continue
      found=1
      process_request "$req"
    done
    if [ "$found" -eq 0 ]; then
      sleep 2
    fi
  done
}

start_service() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    log "already running"
    return 0
  fi
  nohup "$0" daemon >> "$LOG_FILE" 2>&1 &
  echo "$!" > "$PID_FILE"
  log "started"
}

stop_service() {
  if [ -f "$PID_FILE" ]; then
    pid="$(cat "$PID_FILE")"
    kill "$pid" 2>/dev/null || true
    rm -f "$PID_FILE"
  fi
  return 0
}

case "${1:-start}" in
  daemon)
    run_loop
    ;;
  start)
    start_service
    ;;
  stop)
    stop_service
    ;;
  restart)
    stop_service
    start_service
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
    ;;
esac
