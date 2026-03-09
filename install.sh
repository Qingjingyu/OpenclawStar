#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOOTSTRAP_DIR="${ROOT_DIR}/bootstrap"

YOYOO_HOME="${YOYOO_HOME:-${HOME}/.openclaw}"
YOYOO_WORKSPACE="${YOYOO_WORKSPACE:-${YOYOO_HOME}/workspace}"
YOYOO_PROFILE="${YOYOO_PROFILE:-ceo}"
YOYOO_ENABLE_BASE_SKILLS="${YOYOO_ENABLE_BASE_SKILLS:-1}"
YOYOO_INSTALL_FINANCE="${YOYOO_INSTALL_FINANCE:-0}"

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

if [[ "${YOYOO_ENABLE_BASE_SKILLS}" == "1" ]]; then
  if YOYOO_HOME="${YOYOO_HOME}" bash "${BOOTSTRAP_DIR}/install_base_skills.sh"; then
    :
  else
    base_status=$?
    echo "[warn] default base skills were not fully installed" >&2
    echo "[hint] this repo ships the installer, but some skill sources must already exist on your machine or skill registry" >&2
  fi
else
  echo "[skip] default base skills disabled"
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
- finance extension requested: ${YOYOO_INSTALL_FINANCE}
SUMMARY

if [[ "${base_status}" -ne 0 || "${finance_status}" -ne 0 ]]; then
  cat <<FAIL

Init completed with warnings.
- role files and workspace skeleton are ready
- some skill packs were not fully installed

Next step:
1. sync the missing skill sources onto this machine
2. rerun: bash install.sh
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
