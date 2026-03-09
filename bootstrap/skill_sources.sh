#!/usr/bin/env bash
set -euo pipefail

# Shared skill source registry for OpenclawStar bootstrap scripts.
# Search order:
# 1. curated skills inside this repo
# 2. local machine skill directories
# 3. remote URLs as fallback

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCLAWSTAR_REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
OPENCLAWSTAR_SKILLS_ROOT="${OPENCLAWSTAR_REPO_ROOT}/skills"

CANDIDATE_ROOTS=(
  "${OPENCLAWSTAR_SKILLS_ROOT}"
  "${HOME}/.agents/skills"
  "${HOME}/.openclaw/skills"
  "${HOME}/.codex/skills/.system"
)

normalize_skill_name() {
  local name="$1"
  echo "${name//-/_}"
}

get_remote_skill_url() {
  local name="$1"
  local normalized
  normalized="$(normalize_skill_name "${name}")"
  local var_name="REMOTE_SKILL_URL_${normalized}"
  echo "${!var_name:-}"
}

find_local_skill_source() {
  local name="$1"
  local root=""
  for root in "${CANDIDATE_ROOTS[@]}"; do
    if [[ -f "${root}/${name}/SKILL.md" ]]; then
      echo "${root}/${name}"
      return 0
    fi
    local found=""
    found="$(find "${root}" -maxdepth 3 -type f -path "*/${name}/SKILL.md" 2>/dev/null | head -n 1 || true)"
    if [[ -n "${found}" ]]; then
      dirname "${found}"
      return 0
    fi
  done
  return 1
}

REMOTE_SKILL_URL_search="https://cmcm.bot/skills/search.md"
REMOTE_SKILL_URL_multi_search_engine="https://cmcm.bot/skills/multi-search-engine.md"
REMOTE_SKILL_URL_agent_browser="https://cmcm.bot/skills/agent-browser.md"
REMOTE_SKILL_URL_wechat_article_search="https://cmcm.bot/skills/wechat-article-search.md"
REMOTE_SKILL_URL_baoyu_url_to_markdown="https://cmcm.bot/skills/baoyu-url-to-markdown.md"
REMOTE_SKILL_URL_find_skills="https://cmcm.bot/skills/find-skills.md"
REMOTE_SKILL_URL_ontology="https://cmcm.bot/skills/ontology.md"
REMOTE_SKILL_URL_proactive_agent="https://cmcm.bot/skills/proactive-agent.md"
REMOTE_SKILL_URL_self_improvement="https://cmcm.bot/skills/self-improvement.md"
REMOTE_SKILL_URL_skill_creator="https://cmcm.bot/skills/skill-creator.md"
REMOTE_SKILL_URL_agent_team_orchestration="https://cmcm.bot/skills/agent-team-orchestration.md"
REMOTE_SKILL_URL_actionbook="https://cmcm.bot/skills/actionbook.md"
REMOTE_SKILL_URL_agent_docs="https://cmcm.bot/skills/agent-docs.md"
REMOTE_SKILL_URL_automation_workflows="https://cmcm.bot/skills/automation-workflows.md"
REMOTE_SKILL_URL_security_audit="https://cmcm.bot/skills/security-audit.md"
REMOTE_SKILL_URL_trust_verifier="https://cmcm.bot/skills/trust-verifier.md"
REMOTE_SKILL_URL_skill_vetter="https://cmcm.bot/skills/skill-vetter.md"
REMOTE_SKILL_URL_slides="https://cmcm.bot/skills/slides.md"
REMOTE_SKILL_URL_spreadsheets="https://cmcm.bot/skills/spreadsheets.md"
REMOTE_SKILL_URL_us_stock_analysis="https://cmcm.bot/skills/us-stock-analysis.md"
