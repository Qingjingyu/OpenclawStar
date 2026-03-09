#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACTIVATE_SCRIPT="${SCRIPT_DIR}/activate_employee.sh"
ACCEPTANCE_SCRIPT="${SCRIPT_DIR}/acceptance_check.sh"
TEAM_POLICY_TEMPLATE="${SCRIPT_DIR}/profiles/shared/TEAM_ROUTING.md"

YOYOO_TEAM_SHARED_MEMORY="${YOYOO_TEAM_SHARED_MEMORY:-1}"
YOYOO_TEAM_SHARED_USER="${YOYOO_TEAM_SHARED_USER:-1}"
YOYOO_RUN_ACCEPTANCE="${YOYOO_RUN_ACCEPTANCE:-1}"

if [[ ! -x "${ACTIVATE_SCRIPT}" ]]; then
  echo "activate script not found or not executable: ${ACTIVATE_SCRIPT}" >&2
  exit 1
fi

if [[ -z "${MINIMAX_API_KEY:-}" ]]; then
  echo "MINIMAX_API_KEY is required" >&2
  exit 1
fi

run_activate() {
  local role="$1"
  local employee_key="$2"
  local home="$3"
  local port="$4"
  local profile="$5"
  local unit="$6"
  local expect_feishu="$7"

  echo ""
  echo "[Yoyoo] Activating role=${role} key=${employee_key} home=${home} port=${port}"
  MINIMAX_API_KEY="${MINIMAX_API_KEY}" \
  YOYOO_ROLE="${role}" \
  YOYOO_EMPLOYEE_KEY="${employee_key}" \
  YOYOO_HOME="${home}" \
  OPENCLAW_PORT="${port}" \
  YOYOO_PROFILE="${profile}" \
  OPENCLAW_SYSTEMD_UNIT="${unit}" \
  YOYOO_EXPECT_FEISHU="${expect_feishu}" \
  YOYOO_ALLOW_SHARED_INSTANCE=0 \
  bash "${ACTIVATE_SCRIPT}"
}

install_team_policy() {
  local ceo_workspace="$1"
  local cto_workspace="$2"

  if [[ ! -f "${TEAM_POLICY_TEMPLATE}" ]]; then
    echo "[Yoyoo] team policy template missing, skip: ${TEAM_POLICY_TEMPLATE}" >&2
    return 0
  fi

  mkdir -p "${ceo_workspace}" "${cto_workspace}"
  if [[ ! -f "${ceo_workspace}/TEAM_ROUTING.md" ]]; then
    cp -f "${TEAM_POLICY_TEMPLATE}" "${ceo_workspace}/TEAM_ROUTING.md"
  fi
  ln -sfn "${ceo_workspace}/TEAM_ROUTING.md" "${cto_workspace}/TEAM_ROUTING.md"
}

wire_ceo_cto_shared_memory() {
  local ceo_home="${YOYOO_CEO_HOME:-/root/.openclaw}"
  local cto_home="${YOYOO_CTO_HOME:-/root/.openclaw-cto}"
  local ceo_workspace="${ceo_home}/workspace"
  local cto_workspace="${cto_home}/workspace"
  local ts

  if [[ "${YOYOO_TEAM_SHARED_MEMORY}" != "1" ]]; then
    echo "[Yoyoo] YOYOO_TEAM_SHARED_MEMORY=${YOYOO_TEAM_SHARED_MEMORY}, skip CEO/CTO shared-memory wiring."
    return 0
  fi

  mkdir -p "${ceo_workspace}/memory" "${cto_workspace}"
  install_team_policy "${ceo_workspace}" "${cto_workspace}"

  if [[ ! -f "${ceo_workspace}/MEMORY.md" ]]; then
    cat > "${ceo_workspace}/MEMORY.md" <<'EOF'
# MEMORY.md - Yoyoo Team Shared Memory

- This memory is shared by CEO and CTO in team mode.
EOF
  fi

  ts="$(date +%Y%m%d_%H%M%S)"
  if [[ -e "${cto_workspace}/MEMORY.md" && ! -L "${cto_workspace}/MEMORY.md" ]]; then
    mv "${cto_workspace}/MEMORY.md" "${cto_workspace}/MEMORY.md.bak.${ts}"
  fi
  ln -sfn "${ceo_workspace}/MEMORY.md" "${cto_workspace}/MEMORY.md"

  if [[ -e "${cto_workspace}/memory" && ! -L "${cto_workspace}/memory" ]]; then
    mv "${cto_workspace}/memory" "${cto_workspace}/memory.bak.${ts}"
  fi
  ln -sfn "${ceo_workspace}/memory" "${cto_workspace}/memory"

  if [[ "${YOYOO_TEAM_SHARED_USER}" == "1" ]]; then
    if [[ -e "${cto_workspace}/USER.md" && ! -L "${cto_workspace}/USER.md" ]]; then
      mv "${cto_workspace}/USER.md" "${cto_workspace}/USER.md.bak.${ts}"
    fi
    if [[ -f "${ceo_workspace}/USER.md" ]]; then
      ln -sfn "${ceo_workspace}/USER.md" "${cto_workspace}/USER.md"
    fi
  fi

  echo "[Yoyoo] CEO/CTO shared-memory wiring complete."
}

# CEO: dialogue/acceptance
run_activate \
  "ceo" \
  "${YOYOO_CEO_KEY:-ceo}" \
  "${YOYOO_CEO_HOME:-/root/.openclaw}" \
  "${YOYOO_CEO_PORT:-18789}" \
  "${YOYOO_CEO_PROFILE:-yoyoo-ceo}" \
  "${YOYOO_CEO_UNIT:-openclaw-gateway.service}" \
  "${YOYOO_CEO_EXPECT_FEISHU:-1}"

# CTO: execution owner
run_activate \
  "cto" \
  "${YOYOO_CTO_KEY:-cto}" \
  "${YOYOO_CTO_HOME:-/root/.openclaw-cto}" \
  "${YOYOO_CTO_PORT:-18794}" \
  "${YOYOO_CTO_PROFILE:-yoyoo-cto}" \
  "${YOYOO_CTO_UNIT:-openclaw-gateway-cto.service}" \
  "${YOYOO_CTO_EXPECT_FEISHU:-0}"

wire_ceo_cto_shared_memory

# RD Sandbox: isolated experimental employee (no production routing by default)
run_activate \
  "rd-engineer" \
  "${YOYOO_RD_SANDBOX_KEY:-rd-sandbox}" \
  "${YOYOO_RD_SANDBOX_HOME:-/srv/yoyoo/rd-sandbox/state}" \
  "${YOYOO_RD_SANDBOX_PORT:-18793}" \
  "${YOYOO_RD_SANDBOX_PROFILE:-yoyoo-rd-sandbox}" \
  "${YOYOO_RD_SANDBOX_UNIT:-openclaw-gateway-rd-sandbox.service}" \
  "${YOYOO_RD_SANDBOX_EXPECT_FEISHU:-0}"

if [[ "${YOYOO_RUN_ACCEPTANCE}" == "1" ]] && [[ -x "${ACCEPTANCE_SCRIPT}" ]]; then
  echo ""
  echo "[Yoyoo] Running acceptance check for ceo + cto + rd-engineer"
  SCAN_ROLES="ceo cto rd-engineer" bash "${ACCEPTANCE_SCRIPT}"
fi

echo ""
echo "[Yoyoo] Done. Check service status:"
echo "  systemctl status ${YOYOO_CEO_UNIT:-openclaw-gateway.service} --no-pager"
echo "  systemctl status ${YOYOO_CTO_UNIT:-openclaw-gateway-cto.service} --no-pager"
echo "  systemctl status ${YOYOO_RD_SANDBOX_UNIT:-openclaw-gateway-rd-sandbox.service} --no-pager"

