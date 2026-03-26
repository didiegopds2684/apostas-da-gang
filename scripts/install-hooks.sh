#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
HOOK_FILE="$ROOT_DIR/.git/hooks/pre-push"

cp "$ROOT_DIR/scripts/pre-push.sh" "$HOOK_FILE"
chmod +x "$HOOK_FILE"

echo "✓ Hook pre-push instalado em $HOOK_FILE"
