#!/usr/bin/env bash
set -euo pipefail

DEFAULT_BIRTH_SKILLS=(
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
  agents-skill-security-audit
  arc-trust-verifier
  skill-vetter
  slides
  spreadsheets
  us-stock-analysis
)

PACK_content=(
  bilibili-youtube-watcher
  youtube-ultimate
  x-fetcher
  twitter-reader
)

PACK_research=(
  brave-search
  crawl-for-ai
  ddg-web-search
  firecrawl-search
  ghostfetch
  reddit-api
  tavily-search
  web-search-exa
)

PACK_connectors=(
  agent-reach
)

PACK_memory=(
  yoyoo-memory
  yoyoo-knowledge
)

PACK_dev=(
  backend-patterns
  frontend-patterns
  coding-standards
  systematic-debugging
  tdd-workflow
  github-ops
)

PACK_ops=(
  yoyoo-debug
  yoyoo-workflow
  cloudflare-troubleshooting
)

PACK_design=(
  design-system-patterns
  figma
  figma-implement-design
  figma-pixel-replica
  screenshot
  ui-designer
  ui-ux-pro-max
)

PACK_documents=(
  markdown-tools
  pdf-creator
  ppt-creator
  meeting-minutes-taker
  transcript-fixer
  mermaid-tools
)

PACK_evaluation=(
  eval-harness
  promptfoo-evaluation
  fact-checker
  qa-expert
  verification-before-completion
  security-review
)

PACK_finance=(
  us-stock-analysis
)

print_array_lines() {
  local item=""
  for item in "$@"; do
    printf '%s\n' "$item"
  done
}

get_pack_skills() {
  local pack="$1"
  case "$pack" in
    content) print_array_lines "${PACK_content[@]}" ;;
    research) print_array_lines "${PACK_research[@]}" ;;
    connectors) print_array_lines "${PACK_connectors[@]}" ;;
    memory) print_array_lines "${PACK_memory[@]}" ;;
    dev) print_array_lines "${PACK_dev[@]}" ;;
    ops) print_array_lines "${PACK_ops[@]}" ;;
    design) print_array_lines "${PACK_design[@]}" ;;
    documents) print_array_lines "${PACK_documents[@]}" ;;
    evaluation) print_array_lines "${PACK_evaluation[@]}" ;;
    finance) print_array_lines "${PACK_finance[@]}" ;;
    *) return 1 ;;
  esac
}

list_pack_names() {
  printf '%s\n' \
    content \
    research \
    connectors \
    memory \
    dev \
    ops \
    design \
    documents \
    evaluation \
    finance
}
