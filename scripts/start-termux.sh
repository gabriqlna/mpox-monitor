#!/data/data/com.termux/files/usr/bin/bash

set -euo pipefail

PROJECT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/.next/termux.log"
PID_FILE="$PROJECT_DIR/.next/termux.pid"
PORT="${PORT:-3000}"

mkdir -p "$PROJECT_DIR/.next"

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    printf 'O site já está rodando (PID %s) em http://127.0.0.1:%s\n' "$PID" "$PORT"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

if command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock >/dev/null 2>&1 || true
fi

cd "$PROJECT_DIR"
nohup npm run dev -- --hostname 0.0.0.0 --port "$PORT" >"$LOG_FILE" 2>&1 < /dev/null &
PID=$!
printf '%s\n' "$PID" > "$PID_FILE"
printf 'Site iniciado em http://127.0.0.1:%s (PID %s)\n' "$PORT" "$PID"
printf 'Log: %s\n' "$LOG_FILE"
