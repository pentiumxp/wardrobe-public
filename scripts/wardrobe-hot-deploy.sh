#!/bin/sh
set -eu

CONTAINER_NAME="wardrobe-app"
SOURCE_ROOT="/volume1/Wardrobe/wardrobe-app"
TARGET_ROOT="/app"
DOCKER_BIN="/usr/local/bin/docker"

if [ "$#" -lt 1 ]; then
  echo "usage: wardrobe-hot-deploy.sh <relative-path> [<relative-path> ...]" >&2
  exit 2
fi

is_allowed_path() {
  case "$1" in
    app.py|web/*|wardrobe_app/*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

for rel in "$@"; do
  case "$rel" in
    ""|/*|*..*)
      echo "invalid path: $rel" >&2
      exit 3
      ;;
  esac
  if ! is_allowed_path "$rel"; then
    echo "path not allowed: $rel" >&2
    exit 4
  fi
  src="$SOURCE_ROOT/$rel"
  if [ ! -f "$src" ]; then
    echo "source file missing: $src" >&2
    exit 5
  fi
done

for rel in "$@"; do
  dest="$TARGET_ROOT/$rel"
  dest_dir=$(dirname "$dest")
  err_file=$(mktemp)
  if ! "$DOCKER_BIN" exec "$CONTAINER_NAME" mkdir -p "$dest_dir" 2>"$err_file"; then
    if grep -qi "read-only" "$err_file"; then
      echo "skip-mkdir-readonly-bind:$rel" >&2
    else
      cat "$err_file" >&2
      rm -f "$err_file"
      exit 6
    fi
  fi
  rm -f "$err_file"

  err_file=$(mktemp)
  if ! "$DOCKER_BIN" cp "$SOURCE_ROOT/$rel" "$CONTAINER_NAME:$dest" 2>"$err_file"; then
    if grep -qi "read-only" "$err_file"; then
      echo "skip-copy-readonly-bind:$rel" >&2
    else
      cat "$err_file" >&2
      rm -f "$err_file"
      exit 7
    fi
  fi
  rm -f "$err_file"
done

"$DOCKER_BIN" restart "$CONTAINER_NAME" >/dev/null
echo "deployed:$*"
