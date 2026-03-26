#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
LOG_DIR="$ROOT_DIR/.logs"
LOG_FILE="$LOG_DIR/pre-push-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$LOG_DIR"

echo "🔍 Validando build do backend (mesmo ambiente do Railway)..."
echo "Log em: $LOG_FILE"
echo ""

run_step() {
  local name="$1"
  shift
  echo "▶ $name"
  echo "=== $name ===" >> "$LOG_FILE"
  if ! "$@" >> "$LOG_FILE" 2>&1; then
    echo ""
    echo "✗ Falhou em: $name"
    echo "  Veja o log completo em: $LOG_FILE"
    echo ""
    tail -n 30 "$LOG_FILE"
    exit 1
  fi
  echo "✓ $name"
}

cd "$ROOT_DIR/backend"

run_step "npm install"        npm install
run_step "npm run build (tsc)" npm run build
run_step "prisma generate"    npx prisma generate

echo ""
echo "✓ Build validado com sucesso. Prosseguindo com o push."
