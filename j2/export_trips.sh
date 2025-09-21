#!/usr/bin/env bash
set -euo pipefail
ARG="${1:-yesterday}"
if [ "$ARG" = "today" ]; then DAY=$(date -u +%F)
elif [ "$ARG" = "yesterday" ]; then DAY=$(date -u -d "yesterday" +%F 2>/dev/null || date -u -v-1d +%F)
else DAY="$ARG"; fi
FROM="${DAY}T00:00:00Z"; TO="${DAY}T23:59:59Z"
OUT="/opt/rec/exports/trips-${DAY}.csv"; TMP="${OUT}.tmp"
URL="http://100.64.189.32/export_csv?from=${FROM}&to=${TO}"
curl -fsS "$URL" -o "$TMP"
mv "$TMP" "$OUT"
echo "$OUT"
