#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
LOG_DIR="$ROOT_DIR/.logs"
LOG_FILE="$LOG_DIR/pre-push-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$LOG_DIR"

echo "🔍 Validando build do backend via Docker (mesmo ambiente do Railway)..."
echo "Log em: $LOG_FILE"
echo ""

if ! command -v docker &>/dev/null; then
  echo "⚠ Docker não encontrado — rodando build local sem Docker."
  cd "$ROOT_DIR/backend"
  npm ci >> "$LOG_FILE" 2>&1 && \
  npm run build >> "$LOG_FILE" 2>&1 && \
  npx prisma generate >> "$LOG_FILE" 2>&1 || {
    echo "✗ Build falhou. Veja: $LOG_FILE"
    tail -n 30 "$LOG_FILE"
    exit 1
  }
  echo "✓ Build validado. Prosseguindo com o push."
  exit 0
fi

if ! docker build -t bolao-pre-push-check "$ROOT_DIR/backend" >> "$LOG_FILE" 2>&1; then
  echo ""
  echo "✗ Build Docker falhou."
  echo "  Veja o log completo em: $LOG_FILE"
  echo ""
  tail -n 30 "$LOG_FILE"
  exit 1
fi

docker rmi bolao-pre-push-check --force >> "$LOG_FILE" 2>&1 || true

echo "✓ Build validado com sucesso. Prosseguindo com o push."
