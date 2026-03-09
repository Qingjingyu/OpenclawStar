# Initial Claw Baseline

This file defines the standard day-0 baseline for any new OpenClaw instance.

## Goal
A newborn claw should be:
- pure and stable
- able to chat immediately
- able to search, remember, and execute
- able to send generated files back to the owner
- free of any forced role or business identity by default

## Core Principle
A newborn claw is a clean assistant first, not a pre-baked CEO/CTO/team shell.

Birth first, specialization later.

## Birth Baseline
These are required on day 0.

1. OpenClaw core
- pinned stable version
- isolated state directory
- isolated systemd service
- isolated ports

2. Model
- one confirmed working primary model
- one clear reasoning strength setting
- one explicit timeout

Recommended:
- model: `gmn/gpt-5.4`
- thinkingDefault: `xhigh`
- timeoutSeconds: `600` for heavy owner instance, `180` for light worker instance

3. Feishu channel
- websocket long connection
- verified account config
- pairing approved
- default DM usable

4. QMD memory backend
- memory backend set to `qmd`
- qmd binary installed and callable
- timeout configured

5. Structured memory skeleton
- workspace memory directory exists
- daily memory files can be written
- neutral baseline files exist: `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `MEMORY.md`
- these files must not preset CEO / CTO / article-writer style identities by default

6. Default skill baseline
- install the standard default skill list into the instance itself
- bootstrap script: `install_base_skills.sh`
- default count: `22`

7. File delivery rule
- all newborn claws must include the file-send rule by default
- generated files must be sent to the owner with `message(media=...)`
- replying with only a path or URL is not enough

8. Tool permission baseline
- set `tools.profile` to `full`
- avoid the 2026.3.x "can chat but cannot act" regression

## Default Skill List (22)
This is now the standard default installation set for every new claw.

### Search and information retrieval
1. `search`
2. `multi-search-engine`
3. `agent-browser`
4. `wechat-article-search`
5. `baoyu-url-to-markdown`
6. `find-skills`
7. `ontology`

### Initiative and growth
8. `proactive-agent`
9. `self-improvement`
10. `skill-creator`

### Team collaboration and organization
11. `agent-team-orchestration`
12. `actionbook`
13. `agent-docs`
14. `automation-workflows`

### Safety and trust
15. `security-audit`
16. `trust-verifier`
17. `agents-skill-security-audit`
18. `arc-trust-verifier`
19. `skill-vetter`

### Built-in utility tools
20. `slides`
21. `spreadsheets`

### Domain analysis included in birth package
22. `us-stock-analysis`

## Activation Rule
Default behavior for a new claw:
- create a pure baseline workspace
- do not force role templates into the workspace
- let the owner decide the claw's identity later

If a team later wants CEO / CTO / RD profiles, that is an explicit opt-in, not the birth default.

## Recommended Day-0 Checklist
1. install pinned OpenClaw
2. create isolated state dir / service / ports
3. write model config
4. connect Feishu and approve pairing
5. enable QMD
6. create neutral workspace files
7. run `install_base_skills.sh`
8. ensure the file-send rule exists in `AGENTS.md`
9. set `tools.profile=full`
10. run `openclaw doctor --fix`
11. verify DM ping works
12. verify one search request works
13. verify one memory write works
14. verify one generated file can be sent back to the owner

## What Should NOT Be Default
Do not include these by default unless the claw has a clear mission.

- multi-agent org chart itself
- CEO / CTO / article-writer / developer role identity preset
- Figma-heavy design stack
- domain-specific experimental skills outside the baseline
- any business persona that the owner did not explicitly ask for
