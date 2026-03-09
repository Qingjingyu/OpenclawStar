#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=bootstrap/install_skills_lib.sh
source "${SCRIPT_DIR}/install_skills_lib.sh"
# shellcheck source=bootstrap/skill_packs.sh
source "${SCRIPT_DIR}/skill_packs.sh"

if [[ $# -lt 1 || -z "${1}" ]]; then
  echo "usage: bash bootstrap/install_pack_skills.sh content,research,dev" >&2
  echo "available packs:" >&2
  list_pack_names | sed 's/^/- /' >&2
  exit 1
fi

IFS=',' read -r -a requested_packs <<< "$1"
all_skills=()
pack=""
for pack in "${requested_packs[@]}"; do
  pack="$(printf '%s' "${pack}" | xargs)"
  if [[ -z "${pack}" ]]; then
    continue
  fi

  pack_output="$(get_pack_skills "${pack}" || true)"
  if [[ -z "${pack_output}" ]]; then
    echo "[error] unknown pack: ${pack}" >&2
    echo "available packs:" >&2
    list_pack_names | sed 's/^/- /' >&2
    exit 1
  fi

  while IFS= read -r skill; do
    [[ -z "${skill}" ]] && continue
    all_skills+=("${skill}")
  done <<EOF_PACK
${pack_output}
EOF_PACK
done

if [[ ${#all_skills[@]} -eq 0 ]]; then
  echo "[error] no valid packs requested" >&2
  exit 1
fi

unique_skills=()
seen_list="|"
skill=""
for skill in "${all_skills[@]}"; do
  case "$seen_list" in
    *"|${skill}|"*)
      continue
      ;;
  esac
  seen_list="${seen_list}${skill}|"
  unique_skills+=("${skill}")
done

label="packs_$(printf '%s' "$1" | tr ',' '_' | tr '-' '_')"
install_skill_list "$label" "${unique_skills[@]}"
