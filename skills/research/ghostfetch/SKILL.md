---
name: ghostfetch
description: CLI web search and page fetcher for LLM agents. Search DuckDuckGo/Brave/Bing/Google, fetch pages as markdown, and extract links — single binary, no browser required.
metadata:
  openclaw:
    emoji: "👻"
    requires:
      bins: ["ghostfetch"]
---

# Ghostfetch

Web search and page fetcher for AI agents. Single binary, no browser needed. Fetches pages with browser-like TLS fingerprints for reliable access.

Use for: web searches, fetching page content as markdown, extracting links, and gathering information from the web.

## Commands

### Search the web

```bash
ghostfetch "your search query"                    # Search DuckDuckGo (default)
ghostfetch "query" -e brave                       # Search with Brave
ghostfetch "query" -e google                      # Search with Google
ghostfetch "query" -e bing                        # Search with Bing
ghostfetch "query" -n 5                           # Limit to 5 results
ghostfetch "query" --json                         # JSON output with metadata
```

Search engines: `duckduckgo` (default), `brave`, `bing`, `google`

### Fetch pages

```bash
ghostfetch fetch https://example.com              # Fetch page (raw HTML)
ghostfetch fetch https://example.com -m           # Fetch as markdown (reader mode — preferred)
ghostfetch fetch https://example.com --markdown-full  # Full page as markdown (not just main content)
ghostfetch fetch https://example.com --json       # JSON with body, status, headers, cookies
ghostfetch fetch https://example.com --raw        # Raw HTML without processing
ghostfetch fetch url1 url2 url3 -p 3              # Fetch multiple URLs in parallel
ghostfetch fetch https://example.com -o page.md -m  # Save markdown to file
```

**Always use `-m` (markdown mode)** when reading page content — it extracts the main content and converts to clean markdown, saving tokens vs raw HTML.

### Extract links

```bash
ghostfetch links https://example.com              # Extract all links from page
ghostfetch links https://example.com -f "github"  # Filter links by regex pattern
ghostfetch links https://example.com --json       # JSON output
```

## Flags Reference

| Flag | Short | Default | What it does |
|------|-------|---------|-------------|
| `--engine` | `-e` | duckduckgo | Search engine to use |
| `--results` | `-n` | 10 | Number of search results |
| `--markdown` | `-m` | false | Convert to markdown (reader mode) |
| `--markdown-full` | | false | Full page markdown (not just main content) |
| `--json` | `-j` | false | JSON output with metadata |
| `--raw` | | false | Raw HTML output |
| `--output` | `-o` | | Write output to file |
| `--max-parallel` | `-p` | 5 | Max parallel fetches |
| `--filter` | `-f` | | Filter links by regex |
| `--timeout` | `-t` | 30s | Request timeout |
| `--header` | `-H` | | Custom HTTP header (repeatable) |
| `--method` | `-X` | GET | HTTP method |
| `--data` | `-d` | | Request body (for POST) |
| `--browser` | `-b` | chrome | Browser fingerprint: chrome, firefox |
| `--cookie-jar` | `-c` | | Cookie file path |
| `--no-cookies` | | false | Disable cookie persistence |
| `--follow` | `-L` | true | Follow redirects |
| `--verbose` | `-v` | false | Print request/response details |

## Decision Guide

| I want to... | Use this |
|--------------|----------|
| Search the web | `ghostfetch "query"` |
| Search with specific engine | `ghostfetch "query" -e brave` |
| Read a web page | `ghostfetch fetch <url> -m` |
| Read multiple pages at once | `ghostfetch fetch url1 url2 url3 -m -p 3` |
| Find links on a page | `ghostfetch links <url>` |
| Find specific links | `ghostfetch links <url> -f "pattern"` |
| Get structured data | `ghostfetch fetch <url> --json` |
| Save page to file | `ghostfetch fetch <url> -m -o output.md` |
| POST data to an endpoint | `ghostfetch fetch <url> -X POST -d '{"key":"val"}'` |

## Examples

### Research a topic
```bash
ghostfetch "rust async runtime comparison 2026" -n 5
ghostfetch fetch https://tokio.rs -m
```

### Scrape structured data
```bash
ghostfetch fetch https://api.example.com/data --json
```

### Find all GitHub links on a page
```bash
ghostfetch links https://awesome-list.com -f "github.com"
```

### Fetch with custom headers
```bash
ghostfetch fetch https://api.example.com -H "Authorization: Bearer token123"
```

## Installation

The `ghostfetch` binary must be in your PATH. Build from source:

```bash
git clone https://github.com/neothelobster/ghostfetch.git
cd ghostfetch
go build -o ghostfetch .
cp ghostfetch ~/.openclaw/workspace/tools/
```

Requires Go 1.21+ to build. No runtime dependencies.

## Security

- No data is stored except optional cookie jars (disabled with `--no-cookies`)
- All network requests go directly from your machine — no proxy or third-party service
- Custom headers (including auth tokens) are only sent to the specified URL
- The `-o` flag writes fetched content to a local file — only use with trusted URLs
- Do not pass secrets (API keys, tokens) via `-H` or `-d` to untrusted endpoints
- The setup script clones from GitHub at a pinned commit with verification — inspect the source at https://github.com/neothelobster/ghostfetch before building
