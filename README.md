# OpenclawStar

A clean starter repo for building new OpenClaw instances from a stable baseline.

## What is included
- `bootstrap/INITIAL_CLAW_BASELINE.md`: day-0 newborn claw standard
- `bootstrap/install_base_skills.sh`: default skill baseline installer
- `bootstrap/install_finance_skills.sh`: optional finance extension pack
- `bootstrap/profiles/`: role profile templates
- `docs/`: decision notes for the current baseline

## Baseline idea
A newborn claw should first have four things:
- talk
- search
- remember
- execute

Everything else is an extension pack, not a birth requirement.

## Default package
The default newborn package includes:
- stable OpenClaw bootstrap scripts
- model/timeout guidance
- Feishu access path
- QMD memory guidance
- default recommended skill baseline
- file-send rule

## Extension packs
Current optional extension packs:
- finance: `us-stock-analysis`

## Quick use
```bash
# default baseline
export YOYOO_HOME=/root/.openclaw
bash bootstrap/install_base_skills.sh

# optional finance extension
export YOYOO_HOME=/root/.openclaw
bash bootstrap/install_finance_skills.sh
```

## Notes
- Do not commit real API keys, pairing records, chat history, or runtime state.
- This repo stores reproducible capability templates, not live instance data.
