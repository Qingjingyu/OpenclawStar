#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOOTSTRAP_DIR="${ROOT_DIR}/bootstrap"

YOYOO_HOME="${YOYOO_HOME:-${HOME}/.openclaw}"
YOYOO_WORKSPACE="${YOYOO_WORKSPACE:-${YOYOO_HOME}/workspace}"
YOYOO_PROFILE="${YOYOO_PROFILE:-ceo}"
YOYOO_ENABLE_BASE_SKILLS="${YOYOO_ENABLE_BASE_SKILLS:-1}"
YOYOO_INSTALL_FINANCE="${YOYOO_INSTALL_FINANCE:-0}"
YOYOO_INSTALL_PACKS="${YOYOO_INSTALL_PACKS:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --home)
      YOYOO_HOME="$2"
      YOYOO_WORKSPACE="${YOYOO_HOME}/workspace"
      shift 2
      ;;
    --profile)
      YOYOO_PROFILE="$2"
      shift 2
      ;;
    --pack|--packs)
      YOYOO_INSTALL_PACKS="$2"
      shift 2
      ;;
    --finance)
      YOYOO_INSTALL_FINANCE=1
      shift
      ;;
    --no-base)
      YOYOO_ENABLE_BASE_SKILLS=0
      shift
      ;;
    --help|-h)
      cat <<HELP
Usage:
  bash install.sh [--profile ceo] [--home /path/to/state] [--pack content,research,dev] [--finance] [--no-base]

Examples:
  bash install.sh
  bash install.sh --pack content,research,dev
  bash install.sh --finance
  bash install.sh --pack content,research --finance
HELP
      exit 0
      ;;
    *)
      echo "[error] unknown arg: $1" >&2
      exit 1
      ;;
  esac
done

PROFILE_DIR="${BOOTSTRAP_DIR}/profiles/${YOYOO_PROFILE}"
SHARED_DIR="${BOOTSTRAP_DIR}/profiles/shared"

if [[ ! -d "${PROFILE_DIR}" ]]; then
  echo "[error] profile not found: ${YOYOO_PROFILE}" >&2
  echo "[hint] available profiles: ceo, cto, rd-engineer" >&2
  exit 1
fi

mkdir -p "${YOYOO_HOME}" "${YOYOO_WORKSPACE}" "${YOYOO_WORKSPACE}/memory" "${YOYOO_WORKSPACE}/daily"

copy_if_missing() {
  local src="$1"
  local dst="$2"
  if [[ ! -f "${dst}" ]]; then
    cp "${src}" "${dst}"
    echo "[ok] created $(basename "${dst}")"
  else
    echo "[skip] kept existing $(basename "${dst}")"
  fi
}

copy_if_missing "${PROFILE_DIR}/IDENTITY.md" "${YOYOO_WORKSPACE}/IDENTITY.md"
copy_if_missing "${PROFILE_DIR}/SOUL.md" "${YOYOO_WORKSPACE}/SOUL.md"
copy_if_missing "${PROFILE_DIR}/AGENTS.md" "${YOYOO_WORKSPACE}/AGENTS.md"
copy_if_missing "${PROFILE_DIR}/MEMORY.md" "${YOYOO_WORKSPACE}/MEMORY.md"

if [[ -f "${SHARED_DIR}/TEAM_ROUTING.md" ]]; then
  copy_if_missing "${SHARED_DIR}/TEAM_ROUTING.md" "${YOYOO_WORKSPACE}/TEAM_ROUTING.md"
fi

base_status=0
finance_status=0
packs_status=0

if [[ "${YOYOO_ENABLE_BASE_SKILLS}" == "1" ]]; then
  if YOYOO_HOME="${YOYOO_HOME}" bash "${BOOTSTRAP_DIR}/install_base_skills.sh"; then
    :
  else
    base_status=$?
    echo "[warn] default base skills were not fully installed" >&2
  fi
else
  echo "[skip] default base skills disabled"
fi

if [[ -n "${YOYOO_INSTALL_PACKS}" ]]; then
  if YOYOO_HOME="${YOYOO_HOME}" bash "${BOOTSTRAP_DIR}/install_pack_skills.sh" "${YOYOO_INSTALL_PACKS}"; then
    :
  else
    packs_status=$?
    echo "[warn] requested packs were not fully installed" >&2
  fi
else
  echo "[skip] no extra packs requested"
fi

if [[ "${YOYOO_INSTALL_FINANCE}" == "1" ]]; then
  if YOYOO_HOME="${YOYOO_HOME}" bash "${BOOTSTRAP_DIR}/install_finance_skills.sh"; then
    :
  else
    finance_status=$?
    echo "[warn] finance extension failed to install fully" >&2
  fi
else
  echo "[skip] finance extension not requested"
fi

cat <<SUMMARY

OpenclawStar init finished.
- home: ${YOYOO_HOME}
- workspace: ${YOYOO_WORKSPACE}
- profile: ${YOYOO_PROFILE}
- base skills requested: ${YOYOO_ENABLE_BASE_SKILLS}
- common packs requested: ${YOYOO_INSTALL_PACKS:-none}
- finance extension requested: ${YOYOO_INSTALL_FINANCE}
SUMMARY

if [[ "${base_status}" -ne 0 || "${packs_status}" -ne 0 || "${finance_status}" -ne 0 ]]; then
  cat <<FAIL

Init completed with warnings.
- role files and workspace skeleton are ready
- some skill packs were not fully installed

Next step:
1. check the failing pack name or skill source
2. rerun: bash install.sh --pack <pack-list>
3. then connect model and Feishu separately
FAIL
  exit 1
fi

cat <<SUCCESS

Next step:
1. connect model in your OpenClaw config
2. connect Feishu / other channel
3. run OpenClaw doctor and send a DM smoke test
SUCCESS
