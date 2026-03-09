#!/usr/bin/env bash
set -euo pipefail

# Install finance-domain skills for a specialized OpenClaw instance.
# This is intentionally separate from the newborn baseline.

YOYOO_HOME="${YOYOO_HOME:-/root/.openclaw}"
TARGET_DIR="${YOYOO_HOME}/skills"
mkdir -p "${TARGET_DIR}"

FINANCE_SKILLS=(
  us-stock-analysis
)

CANDIDATE_ROOTS=(
  "${HOME}/.agents/skills"
  "${HOME}/.openclaw/skills"
  "${HOME}/.codex/skills/.system"
)

REMOTE_SKILL_URL_us_stock_analysis="https://cmcm.bot/skills/us-stock-analysis.md"

normalize_name() {
  local name="$1"
  echo "${name//-/_}"
}

fetch_remote_skill() {
  local name="$1"
  local normalized
  normalized="$(normalize_name "${name}")"
  local var_name="REMOTE_SKILL_URL_${normalized}"
  local url="${!var_name:-}"

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
  local root=""
  for root in "${CANDIDATE_ROOTS[@]}"; do
    if [[ -d "${root}/${name}" && -f "${root}/${name}/SKILL.md" ]]; then
      src="${root}/${name}"
      break
    fi
  done

  if [[ -n "${src}" ]]; then
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
