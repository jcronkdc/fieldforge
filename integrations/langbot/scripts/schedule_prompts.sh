#!/usr/bin/env bash
set -euo pipefail

PROMPT_FILE="$(dirname "$0")/../prompts/daily_seeds.yaml"

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Prompt file not found: $PROMPT_FILE" >&2
  exit 1
fi

python broadcast_prompts.py --from-yaml "$PROMPT_FILE"

