#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=bootstrap/install_skills_lib.sh
source "${SCRIPT_DIR}/install_skills_lib.sh"
# shellcheck source=bootstrap/skill_packs.sh
source "${SCRIPT_DIR}/skill_packs.sh"

install_skill_list default "${DEFAULT_BIRTH_SKILLS[@]}"
