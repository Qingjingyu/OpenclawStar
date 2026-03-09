#!/usr/bin/env bash
set -euo pipefail

# Install the default recommended skill baseline for a newborn OpenClaw instance.
# Copies skills into ${YOYOO_HOME}/skills so each instance has its own stable baseline.

YOYOO_HOME="${YOYOO_HOME:-/root/.openclaw}"
TARGET_DIR="${YOYOO_HOME}/skills"
mkdir -p "${TARGET_DIR}"

DEFAULT_SKILLS=(
  search
  multi-search-engine
  agent-browser
  wechat-article-search
  baoyu-url-to-markdown
  find-skills
  ontology
  proactive-agent
  self-improvement
  skill-creator
  agent-team-orchestration
  actionbook
  agent-docs
  automation-workflows
  security-audit
  trust-verifier
  skill-vetter
  slides
  spreadsheets
)

CANDIDATE_ROOTS=(
  "${HOME}/.agents/skills"
  "${HOME}/.openclaw/skills"
  "${HOME}/.codex/skills/.system"
)

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

  if [[ -z "${src}" ]]; then
    echo "[warn] skill not found: ${name}" >&2
    return 1
  fi

  rm -rf "${TARGET_DIR:?}/${name}"
  cp -R "${src}" "${TARGET_DIR}/${name}"
  echo "[ok] ${name} <= ${src}"
}

failures=0
for skill in "${DEFAULT_SKILLS[@]}"; do
  if ! install_one "${skill}"; then
    failures=$((failures + 1))
  fi
done

echo "installed_default_skills=${#DEFAULT_SKILLS[@]}"
echo "failed_default_skills=${failures}"
if [[ "${failures}" -gt 0 ]]; then
  exit 1
fi
