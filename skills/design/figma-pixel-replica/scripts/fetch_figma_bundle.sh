#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "" || "${2:-}" == "" || "${3:-}" == "" || "${4:-}" == "" ]]; then
  echo "Usage: $0 <figma_token> <file_key> <node_ids_csv> <output_dir> [scales_csv]"
  echo "Example: $0 \"\$FIGMA_TOKEN\" \"hexHZONLy6ZiM6r0j8YImj\" \"68:8642,68:9678\" /tmp/figma_bundle \"1,2,3\""
  exit 1
fi

for bin in curl jq; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Missing dependency: $bin"
    exit 1
  fi
done

CURL_COMMON_ARGS=(
  --retry 8
  --retry-delay 1
  --retry-all-errors
  --connect-timeout 10
  --max-time 45
  -sS
)

TOKEN="$1"
FILE_KEY="$2"
NODE_IDS_CSV="$3"
OUT_DIR="$4"
SCALES_CSV="${5:-1,2,3}"

mkdir -p "$OUT_DIR"
IFS=',' read -r -a NODE_IDS <<<"$NODE_IDS_CSV"
IFS=',' read -r -a SCALES <<<"$SCALES_CSV"

node_ids_encoded="$(printf "%s" "$NODE_IDS_CSV" | sed 's/:/%3A/g; s/,/%2C/g')"

echo "[1/4] Fetching node JSON..."
curl "${CURL_COMMON_ARGS[@]}" \
  -H "X-Figma-Token: $TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/nodes?ids=$node_ids_encoded" \
  > "$OUT_DIR/nodes.json"

echo "[2/4] Fetching PNG snapshots..."
for scale in "${SCALES[@]}"; do
  scale_trimmed="$(echo "$scale" | xargs)"
  manifest="$OUT_DIR/images_${scale_trimmed}x.json"

  curl "${CURL_COMMON_ARGS[@]}" \
    -H "X-Figma-Token: $TOKEN" \
    "https://api.figma.com/v1/images/$FILE_KEY?ids=$node_ids_encoded&format=png&scale=$scale_trimmed" \
    > "$manifest"

  for node in "${NODE_IDS[@]}"; do
    node_trimmed="$(echo "$node" | xargs)"
    node_safe="${node_trimmed//:/_}"
    url="$(jq -r --arg id "$node_trimmed" '.images[$id] // empty' "$manifest")"
    if [[ -n "$url" ]]; then
      curl "${CURL_COMMON_ARGS[@]}" "$url" > "$OUT_DIR/${node_safe}@${scale_trimmed}x.png"
    fi
  done
done

echo "[3/4] Fetching SVG snapshots when available..."
svg_manifest="$OUT_DIR/images_svg.json"
curl "${CURL_COMMON_ARGS[@]}" \
  -H "X-Figma-Token: $TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=$node_ids_encoded&format=svg" \
  > "$svg_manifest"

for node in "${NODE_IDS[@]}"; do
  node_trimmed="$(echo "$node" | xargs)"
  node_safe="${node_trimmed//:/_}"
  svg_url="$(jq -r --arg id "$node_trimmed" '.images[$id] // empty' "$svg_manifest")"
  if [[ -n "$svg_url" ]]; then
    curl "${CURL_COMMON_ARGS[@]}" "$svg_url" > "$OUT_DIR/${node_safe}.svg"
  fi
done

echo "[4/4] Writing manifest..."
cat > "$OUT_DIR/manifest.json" <<EOF
{
  "fileKey": "$FILE_KEY",
  "nodeIds": "$(echo "$NODE_IDS_CSV" | sed 's/"/\\"/g')",
  "scales": "$(echo "$SCALES_CSV" | sed 's/"/\\"/g')",
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "Done. Artifacts saved to: $OUT_DIR"
