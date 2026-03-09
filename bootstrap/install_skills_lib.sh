#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=bootstrap/skill_sources.sh
source "${SCRIPT_DIR}/skill_sources.sh"

YOYOO_HOME="${YOYOO_HOME:-/root/.openclaw}"
TARGET_DIR="${YOYOO_HOME}/skills"
mkdir -p "${TARGET_DIR}"

fetch_remote_skill() {
  local name="$1"
  local url=""
  url="$(get_remote_skill_url "${name}")"

  if [[ -z "${url}" ]]; then
    echo "[warn] no remote source configured for ${name}" >&2
    return 1
  fi

  python3 - <<'PY' "$TARGET_DIR" "$name"
from pathlib import Path
import shutil, sys
root = Path(sys.argv[1])
name = sys.argv[2]
dst = root / name
if dst.exists():
    shutil.rmtree(dst)
dst.mkdir(parents=True, exist_ok=True)
PY

  curl -L --fail --max-time 30 -fsSL "${url}" -o "${TARGET_DIR}/${name}/SKILL.md"
  echo "[ok] ${name} <= ${url}"
}

install_one_skill() {
  local name="$1"
  local src=""
  if src="$(find_local_skill_source "${name}")"; then
    python3 - <<'PY' "$src" "$TARGET_DIR" "$name"
from pathlib import Path
import shutil, sys
src = Path(sys.argv[1])
target_root = Path(sys.argv[2])
name = sys.argv[3]
dst = target_root / name
if dst.exists():
    shutil.rmtree(dst)
shutil.copytree(src, dst)
PY
    echo "[ok] ${name} <= ${src}"
    return 0
  fi

  fetch_remote_skill "${name}"
}

install_skill_list() {
  local label="$1"
  shift
  local failures=0
  local count=0
  local skill=""

  for skill in "$@"; do
    count=$((count + 1))
    if ! install_one_skill "${skill}"; then
      failures=$((failures + 1))
    fi
  done

  echo "installed_${label}_skills=${count}"
  echo "failed_${label}_skills=${failures}"
  if [[ "${failures}" -gt 0 ]]; then
    return 1
  fi
}
