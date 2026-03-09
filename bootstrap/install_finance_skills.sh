#!/usr/bin/env bash
set -euo pipefail

# Install finance-domain skills for a specialized OpenClaw instance.
# This is intentionally separate from the newborn baseline.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=bootstrap/skill_sources.sh
source "${SCRIPT_DIR}/skill_sources.sh"

YOYOO_HOME="${YOYOO_HOME:-/root/.openclaw}"
TARGET_DIR="${YOYOO_HOME}/skills"
mkdir -p "${TARGET_DIR}"

FINANCE_SKILLS=(
  us-stock-analysis
)

fetch_remote_skill() {
  local name="$1"
  local url=""
  url="$(get_remote_skill_url "${name}")"

  if [[ -z "${url}" ]]; then
    echo "[warn] no remote source configured for ${name}" >&2
    return 1
  fi

  rm -rf "${TARGET_DIR:?}/${name}"
  mkdir -p "${TARGET_DIR}/${name}"
  curl -L --fail --max-time 30 -fsSL "${url}" -o "${TARGET_DIR}/${name}/SKILL.md"
  echo "[ok] ${name} <= ${url}"
}

install_one() {
  local name="$1"
  local src=""
  if src="$(find_local_skill_source "${name}")"; then
    rm -rf "${TARGET_DIR:?}/${name}"
    cp -R "${src}" "${TARGET_DIR}/${name}"
    echo "[ok] ${name} <= ${src}"
    return 0
  fi

  fetch_remote_skill "${name}"
}

failures=0
for skill in "${FINANCE_SKILLS[@]}"; do
  if ! install_one "${skill}"; then
    failures=$((failures + 1))
  fi
done

echo "installed_finance_skills=${#FINANCE_SKILLS[@]}"
echo "failed_finance_skills=${failures}"
if [[ "${failures}" -gt 0 ]]; then
  exit 1
fi
