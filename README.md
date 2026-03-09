# OpenclawStar

A clean starter repo for building new OpenClaw instances from a stable baseline.

## What is included
- `install.sh`: one-click newborn claw initializer
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
- stable bootstrap scripts
- workspace skeleton
- role profile files
- default recommended skill baseline
- file-send rule

## Extension packs
Current optional extension packs:
- finance: `us-stock-analysis`

## One-click init
```bash
# create a clean newborn claw workspace
export YOYOO_HOME=/root/.openclaw-f
export YOYOO_PROFILE=ceo
bash install.sh
```

With optional finance extension:
```bash
export YOYOO_HOME=/root/.openclaw-f
export YOYOO_PROFILE=ceo
export YOYOO_INSTALL_FINANCE=1
bash install.sh
```

What `install.sh` does:
- creates the workspace directories
- copies the selected role template
- installs the default base skills
- optionally installs the finance extension pack
- keeps existing profile files if they already exist

## Important reality check
`install.sh` can build the newborn skeleton by itself.

But the default skill installer still needs actual skill sources to exist on the machine, or be available from your skill registry. So this repo is:
- enough to standardize the setup flow
- not enough to magically invent every third-party skill source

In plain words:
- this repo gives you the recipe
- your machine still needs the ingredients

## Notes
- Do not commit real API keys, pairing records, chat history, or runtime state.
- This repo stores reproducible capability templates, not live instance data.
- `install.sh` prepares the newborn claw skeleton. Model config and channel config still need to be connected separately.
