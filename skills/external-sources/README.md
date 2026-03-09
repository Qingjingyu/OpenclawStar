# External Skill Sources

Use these sources when the skill you need is not yet curated into this repo.

## Priority order
1. This repo's `skills/` folder
2. `cmcm.bot/skills`
3. local installed skill directories already on the machine
4. official / community search tools

## Known useful sources
- `https://cmcm.bot/skills/<skill-name>.md`
  - best for quick retrieval of a known skill page
  - examples:
    - `https://cmcm.bot/skills/search.md`
    - `https://cmcm.bot/skills/us-stock-analysis.md`

## Search strategy
- if you know the skill name, try the direct page first
- if you do not know the skill name, use `find-skills`
- if the skill still cannot be found, search community sources and then curate it into this repo after validation

## Curation rule
Only add a skill into this repo when at least one is true:
- it is part of the newborn default package
- it is a repeated high-value domain skill
- it fills a capability gap we use often

## Safety rule
Do not blindly install unknown skills into production claws.
Validate at least:
- source
- purpose
- whether it needs key/cookie/account
- whether it can execute commands or access external systems


## Typical requirement patterns
- free / low-friction:
  - `ddg-web-search`
  - `ghostfetch`
  - `twitter-reader`
  - parts of `youtube-ultimate`
- often needs API key:
  - `brave-search`
  - `tavily-search`
  - `firecrawl-search`
  - `web-search-exa`
- often needs cookie / account / channel setup:
  - `x-fetcher`
  - `agent-reach`
- often needs local runtime service:
  - `crawl-for-ai`


## Third-wave curated areas
- `memory`: remember users, store knowledge, improve retrieval
- `dev`: build software, debug issues, enforce code quality
- `ops`: run workflows, troubleshoot systems, handle infrastructure incidents
