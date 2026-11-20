#!/data/data/com.termux/files/usr/bin/bash

set -euo pipefail
PROJECT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
PID_FILE="$PROJECT_DIR/.next/termux.pid"

if [ ! -f "$PID_FILE" ]; then
  printf 'O site não está rodando por este script.\n'
  exit 0
fi

PID="$(cat "$PID_FILE")"
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  printf 'Site encerrado (PID %s).\n' "$PID"
else
  printf 'O processo já havia sido encerrado.\n'
fi
rm -f "$PID_FILE"
if command -v termux-wake-unlock >/dev/null 2>&1; then
  termux-wake-unlock >/dev/null 2>&1 || true
fi
