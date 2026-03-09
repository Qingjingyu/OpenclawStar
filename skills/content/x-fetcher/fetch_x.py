#!/usr/bin/env python3
"""
X Fetcher (built-in for Yoyoo)
Reference: https://github.com/Jane-xiaoer/x-fetcher

Usage:
  python fetch_x.py "https://x.com/username/status/1234567890"
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import json
import os
import pathlib
import re
import sys
import time
from typing import Any
from urllib.parse import quote_plus, unquote

import requests

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
RECENT_QUERY_MARKERS = ("今天", "今日", "最新", "最近", "today", "latest", "recent", "now")
LOW_VALUE_PATTERNS = (
    r"\b0x[a-f0-9]{8,}\b",
    r"\$[a-z0-9_-]{2,}",
    r"web3\.okx\.com|pump\.fun|airdrop",
)
RAPIDAPI_KEY_STATE_FILE = pathlib.Path(
    os.path.expanduser(os.getenv("RAPIDAPI_KEY_STATE_FILE", "~/.openclaw/state/x_fetcher_rapidapi_state.json"))
)
RAPIDAPI_HARD_FAIL_COOLDOWN_SECONDS = int(os.getenv("RAPIDAPI_HARD_FAIL_COOLDOWN_SECONDS", "21600"))
RAPIDAPI_SOFT_FAIL_COOLDOWN_SECONDS = int(os.getenv("RAPIDAPI_SOFT_FAIL_COOLDOWN_SECONDS", "300"))


def rapidapi_key_id(api_key: str) -> str:
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()[:16]


def load_rapidapi_key_state() -> dict[str, Any]:
    try:
        if not RAPIDAPI_KEY_STATE_FILE.exists():
            return {"version": 1, "keys": {}}
        data = json.loads(RAPIDAPI_KEY_STATE_FILE.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            return {"version": 1, "keys": {}}
        keys = data.get("keys")
        if not isinstance(keys, dict):
            data["keys"] = {}
        data.setdefault("version", 1)
        return data
    except Exception:  # noqa: BLE001
        return {"version": 1, "keys": {}}


def save_rapidapi_key_state(state: dict[str, Any]) -> None:
    try:
        RAPIDAPI_KEY_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        RAPIDAPI_KEY_STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as exc:  # noqa: BLE001
        print(f"[x-fetcher] failed to save key state: {exc}", file=sys.stderr)


def mark_rapidapi_key_result(api_key: str, result: str) -> None:
    """
    Result values:
      - ok
      - hard_fail (429/401/403)
      - soft_fail (non-200/timeout/parse errors)
    """
    now = int(time.time())
    state = load_rapidapi_key_state()
    keys = state.setdefault("keys", {})
    kid = rapidapi_key_id(api_key)
    rec = keys.setdefault(
        kid,
        {
            "fail_streak": 0,
            "success_count": 0,
            "cooldown_until": 0,
            "last_result": "",
            "last_ts": 0,
        },
    )

    if result == "ok":
        rec["fail_streak"] = 0
        rec["success_count"] = int(rec.get("success_count", 0)) + 1
        rec["cooldown_until"] = 0
    elif result == "hard_fail":
        rec["fail_streak"] = int(rec.get("fail_streak", 0)) + 1
        rec["cooldown_until"] = now + RAPIDAPI_HARD_FAIL_COOLDOWN_SECONDS
    else:
        rec["fail_streak"] = int(rec.get("fail_streak", 0)) + 1
        current_cooldown = int(rec.get("cooldown_until", 0))
        rec["cooldown_until"] = max(current_cooldown, now + RAPIDAPI_SOFT_FAIL_COOLDOWN_SECONDS)

    rec["last_result"] = result
    rec["last_ts"] = now
    save_rapidapi_key_state(state)


def sort_rapidapi_keys_by_health(keys: list[str]) -> list[str]:
    if not keys:
        return []
    now = int(time.time())
    state = load_rapidapi_key_state()
    bucket = state.get("keys", {})

    def score(api_key: str, idx: int) -> tuple[int, int, int, int]:
        rec = bucket.get(rapidapi_key_id(api_key), {})
        cooldown_until = int(rec.get("cooldown_until", 0))
        fail_streak = int(rec.get("fail_streak", 0))
        success_count = int(rec.get("success_count", 0))
        in_cooldown = 1 if cooldown_until > now else 0
        return (in_cooldown, fail_streak, -success_count, idx)

    ranked = sorted([(k, i) for i, k in enumerate(keys)], key=lambda item: score(item[0], item[1]))
    return [k for k, _ in ranked]


def extract_tweet_id(url: str) -> str | None:
    patterns = [
        r"(?:x\.com|twitter\.com)/\w+/status/(\d+)",
        r"(?:x\.com|twitter\.com)/\w+/statuses/(\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def is_status_url(text: str) -> bool:
    return extract_tweet_id(text) is not None


def extract_username(url: str) -> str | None:
    match = re.search(r"(?:x\.com|twitter\.com)/([A-Za-z0-9_]+)/status(?:es)?/\d+", url)
    if match:
        return match.group(1)
    return None


def search_x_urls_via_ddg(query: str, limit: int = 5) -> list[str]:
    q = f"site:x.com {query}"
    url = f"https://lite.duckduckgo.com/lite/?q={quote_plus(q)}"
    try:
        resp = requests.get(url, headers={"User-Agent": UA}, timeout=20)
        if resp.status_code != 200:
            return []
        body = resp.text
    except Exception as exc:  # noqa: BLE001
        print(f"[x-fetcher] ddg search error: {exc}", file=sys.stderr)
        return []

    urls: list[str] = []

    # 1) DDG redirect links with uddg encoded target
    for enc in re.findall(r'href="https?://duckduckgo\.com/l/\?[^"]*?uddg=([^"&]+)', body):
        target = unquote(html.unescape(enc))
        if is_status_url(target) and target not in urls:
            urls.append(target)
            if len(urls) >= limit:
                return urls

    # 2) Direct links in page text as fallback
    for direct in re.findall(r"https?://(?:x\.com|twitter\.com)/[A-Za-z0-9_]+/status/\d+", body):
        if direct not in urls:
            urls.append(direct)
            if len(urls) >= limit:
                break

    return urls


def extract_status_urls_from_payload(payload: Any) -> list[str]:
    urls: list[str] = []
    status_re = re.compile(r"https?://(?:x\.com|twitter\.com)/[A-Za-z0-9_]+/status/\d+")

    def add_url(url: str) -> None:
        if is_status_url(url) and url not in urls:
            urls.append(url)

    # Fast path: regex scan from serialized payload.
    try:
        serialized = json.dumps(payload, ensure_ascii=False)
        for match in status_re.findall(serialized):
            add_url(match)
    except Exception:  # noqa: BLE001
        pass

    # Structured path: build URL from rest_id + username.
    stack: list[Any] = [payload]
    while stack:
        current = stack.pop()
        if isinstance(current, dict):
            rest_id = current.get("rest_id")
            username = (
                current.get("core", {})
                .get("user_results", {})
                .get("result", {})
                .get("legacy", {})
                .get("screen_name")
            )
            if rest_id and username:
                add_url(f"https://x.com/{username}/status/{rest_id}")
            for value in current.values():
                stack.append(value)
        elif isinstance(current, list):
            stack.extend(current)

    return urls


def search_x_urls_via_rapidapi(query: str, limit: int = 5) -> list[str]:
    host = os.getenv("RAPIDAPI_HOST", "twitter241.p.rapidapi.com").strip() or "twitter241.p.rapidapi.com"
    keys = get_rapidapi_keys()
    if not keys:
        return []

    urls: list[str] = []
    endpoints = ["/search-v2", "/search"]
    search_types = ["Top", "Latest"]

    for key_idx, key in enumerate(keys, start=1):
        for endpoint in endpoints:
            for search_type in search_types:
                try:
                    resp = requests.get(
                        f"https://{host}{endpoint}",
                        params={"query": query, "type": search_type},
                        headers=rapidapi_headers(key, host),
                        timeout=25,
                    )
                    if resp.status_code == 429:
                        mark_rapidapi_key_result(key, "hard_fail")
                        print(
                            f"[x-fetcher] rapidapi search quota exceeded (key#{key_idx})",
                            file=sys.stderr,
                        )
                        break
                    if resp.status_code in (401, 403):
                        mark_rapidapi_key_result(key, "hard_fail")
                        break
                    if resp.status_code != 200:
                        mark_rapidapi_key_result(key, "soft_fail")
                        continue

                    payload = resp.json()
                    mark_rapidapi_key_result(key, "ok")
                    candidates = extract_status_urls_from_payload(payload)
                    for item in candidates:
                        if item not in urls:
                            urls.append(item)
                            if len(urls) >= limit:
                                return urls
                except Exception as exc:  # noqa: BLE001
                    mark_rapidapi_key_result(key, "soft_fail")
                    print(f"[x-fetcher] rapidapi search error (key#{key_idx}): {exc}", file=sys.stderr)
                    continue
    return urls


def append_unique(items: list[str], value: str) -> None:
    if value and value not in items:
        items.append(value)


def build_query_candidates(query: str, max_candidates: int = 12) -> list[str]:
    base = re.sub(r"\s+", " ", query).strip()
    if not base:
        return []

    candidates: list[str] = []
    append_unique(candidates, base)

    # Common typo correction.
    append_unique(candidates, re.sub(r"opencalw", "openclaw", base, flags=re.IGNORECASE))

    expansion_rules: list[tuple[str, list[str]]] = [
        (r"(?i)\bopenclaw\b|opencalw|小龙虾", ["openclaw", "OpenClaw", "小龙虾 OpenClaw"]),
        (r"氢能|氢能源|氢气|绿氢", ["氢能", "氢能源", "green hydrogen", "hydrogen energy"]),
        (r"新能源|清洁能源|可再生能源", ["新能源", "清洁能源", "renewable energy"]),
        (r"(?i)\bai\b|人工智能|智能体|agent", ["AI", "人工智能", "AI agent"]),
    ]

    for pattern, aliases in expansion_rules:
        if re.search(pattern, base):
            for alias in aliases:
                append_unique(candidates, re.sub(pattern, alias, base, count=1))
                append_unique(candidates, alias)
                if " " not in alias:
                    append_unique(candidates, f"#{alias}")
                if len(candidates) >= max_candidates:
                    return candidates

    return candidates[:max_candidates]


def wants_recent_window(query: str) -> bool:
    q = query.lower()
    return any(marker in q for marker in RECENT_QUERY_MARKERS)


def parse_created_at(value: Any) -> dt.datetime | None:
    if not value:
        return None
    text = str(value).strip()
    if not text:
        return None

    # ISO 8601, e.g. 2026-02-23T13:07:46.000Z
    try:
        parsed = dt.datetime.fromisoformat(text.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed.astimezone(dt.timezone.utc)
    except ValueError:
        pass

    # RFC-like, e.g. Mon Mar 02 11:24:51 +0000 2026
    try:
        parsed = dt.datetime.strptime(text, "%a %b %d %H:%M:%S %z %Y")
        return parsed.astimezone(dt.timezone.utc)
    except ValueError:
        return None


def filter_results_recent(results: list[dict[str, Any]], hours: int = 24) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=hours)
    fresh: list[dict[str, Any]] = []
    stale: list[dict[str, Any]] = []

    for item in results:
        created_at = parse_created_at(item.get("created_at"))
        if created_at and created_at >= cutoff:
            fresh.append(item)
        else:
            stale.append(item)
    return fresh, stale


def build_relevance_terms(query_candidates: list[str]) -> list[str]:
    stopwords = {
        "今天",
        "今日",
        "最新",
        "最近",
        "动态",
        "新闻",
        "进展",
        "技术",
        "new",
        "latest",
        "today",
        "recent",
    }
    terms: list[str] = []
    for query in query_candidates:
        for token in re.split(r"[\s,，、/|]+", query.lower()):
            token = token.strip()
            if not token or token in stopwords or len(token) < 2:
                continue
            append_unique(terms, token)
    return terms


def needs_strict_relevance(query: str) -> bool:
    return bool(re.search(r"(?i)openclaw|opencalw|小龙虾|氢能|氢能源|新能源|renewable|hydrogen|\bai\b|人工智能", query))


def relevance_score(item: dict[str, Any], terms: list[str]) -> int:
    text = " ".join(
        [
            str(item.get("title", "")),
            str(item.get("preview", "")),
            str(item.get("text", "")),
            str(item.get("full_text", "")),
            str(item.get("author", "")),
            str(item.get("username", "")),
        ]
    ).lower()
    score = 0
    for term in terms:
        if term in text:
            score += 2 if len(term) >= 4 else 1
    for pattern in LOW_VALUE_PATTERNS:
        if re.search(pattern, text):
            score -= 2
    return score


def rerank_results_by_relevance(
    results: list[dict[str, Any]], query_candidates: list[str], strict: bool = False
) -> list[dict[str, Any]]:
    terms = build_relevance_terms(query_candidates)
    if not terms:
        return results
    scored = [(relevance_score(item, terms), item) for item in results]
    scored.sort(key=lambda row: row[0], reverse=True)
    positive = [item for score, item in scored if score > 0]
    if positive:
        return positive
    if strict:
        return []
    return [item for _, item in scored]


def search_tweets(query: str, limit: int = 5) -> dict[str, Any]:
    query_candidates = build_query_candidates(query)
    if not query_candidates:
        return {"success": False, "mode": "search", "query": query, "error": "关键词为空", "results": []}

    urls: list[str] = []
    for q in query_candidates:
        for u in search_x_urls_via_rapidapi(q, limit=limit * 2):
            if u not in urls:
                urls.append(u)
        if len(urls) >= limit * 2:
            break

    if not urls:
        for q in query_candidates:
            for u in search_x_urls_via_ddg(q, limit=limit * 2):
                if u not in urls:
                    urls.append(u)
            if len(urls) >= limit * 2:
                break
    if not urls:
        return {
            "success": False,
            "mode": "search",
            "query": query,
            "error": "未找到可用的 X 帖子链接（RapidAPI 与 DDG 均失败）",
            "results": [],
        }

    results: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    for url in urls:
        fetched = fetch_tweet(url)
        if fetched.get("success"):
            item = fetched.get("content", {})
            if isinstance(item, dict):
                if not item.get("url"):
                    item["url"] = url
                item["fetch_source"] = fetched.get("source", "")
            results.append(item)
            if len(results) >= limit:
                break
        else:
            failures.append({"url": url, "error": str(fetched.get("error", "抓取失败"))})

    if not results:
        return {
            "success": False,
            "mode": "search",
            "query": query,
            "error": "找到链接但全部抓取失败",
            "candidate_urls": urls[:limit],
            "failures": failures[:limit],
            "results": [],
        }

    strict_relevance = needs_strict_relevance(query)
    results = rerank_results_by_relevance(results, query_candidates, strict=strict_relevance)
    if not results:
        return {
            "success": False,
            "mode": "search",
            "query": query,
            "query_candidates": query_candidates,
            "error": "未找到高相关内容（已自动过滤低相关结果）",
            "candidate_urls": urls[: limit * 2],
            "results": [],
        }

    freshness: str | None = None
    note: str | None = None
    if wants_recent_window(query):
        fresh, stale = filter_results_recent(results, hours=24)
        if fresh:
            results = fresh
            freshness = "last_24h"
        else:
            # Keep service useful even when no same-day content is available.
            results = stale
            freshness = "fallback_all_time"
            note = "24小时内未命中，已返回最近可用结果"

    if len(results) > limit:
        results = results[:limit]

    return {
        "success": True,
        "mode": "search",
        "query": query,
        "query_candidates": query_candidates,
        "freshness": freshness,
        "note": note,
        "count": len(results),
        "results": results,
        "candidate_urls": urls[: limit * 2],
    }


def get_rapidapi_keys() -> list[str]:
    # Priority: single key first, then comma-separated pool.
    keys: list[str] = []
    single = os.getenv("RAPIDAPI_KEY", "").strip()
    if single:
        keys.append(single)
    pool = os.getenv("RAPIDAPI_KEYS", "").strip()
    if pool:
        for item in pool.split(","):
            key = item.strip()
            if key and key not in keys:
                keys.append(key)
    return sort_rapidapi_keys_by_health(keys)


def rapidapi_headers(api_key: str, host: str) -> dict[str, str]:
    return {
        "X-RapidAPI-Key": api_key,
        "X-RapidAPI-Host": host,
        "User-Agent": UA,
    }


def deep_find_first_key(data: Any, target_key: str) -> Any:
    if isinstance(data, dict):
        if target_key in data and data[target_key] not in (None, ""):
            return data[target_key]
        for value in data.values():
            found = deep_find_first_key(value, target_key)
            if found not in (None, ""):
                return found
    elif isinstance(data, list):
        for item in data:
            found = deep_find_first_key(item, target_key)
            if found not in (None, ""):
                return found
    return None


def get_rapidapi_user_id(username: str, api_key: str, host: str) -> str | None:
    endpoint_candidates = ["/user-by-screen-name", "/user"]
    params_candidates = [{"screen_name": username}, {"username": username}]

    for endpoint in endpoint_candidates:
        for params in params_candidates:
            try:
                resp = requests.get(
                    f"https://{host}{endpoint}",
                    params=params,
                    headers=rapidapi_headers(api_key, host),
                    timeout=20,
                )
                if resp.status_code == 429:
                    mark_rapidapi_key_result(api_key, "hard_fail")
                    print("[x-fetcher] rapidapi quota exceeded on user lookup", file=sys.stderr)
                    return None
                if resp.status_code in (401, 403):
                    mark_rapidapi_key_result(api_key, "hard_fail")
                    continue
                if resp.status_code != 200:
                    mark_rapidapi_key_result(api_key, "soft_fail")
                    continue
                payload = resp.json()
                mark_rapidapi_key_result(api_key, "ok")
                user_id = (
                    payload.get("result", {})
                    .get("data", {})
                    .get("user", {})
                    .get("result", {})
                    .get("rest_id")
                    or payload.get("data", {}).get("result", {}).get("rest_id")
                    or payload.get("response", {}).get("data", {}).get("result", {}).get("rest_id")
                    or deep_find_first_key(payload, "rest_id")
                )
                if user_id:
                    return str(user_id)
            except Exception as exc:  # noqa: BLE001
                mark_rapidapi_key_result(api_key, "soft_fail")
                print(f"[x-fetcher] rapidapi user lookup error: {exc}", file=sys.stderr)
                continue
    return None


def extract_tweet_objects_from_timeline(payload: dict[str, Any]) -> list[dict[str, Any]]:
    instructions = (
        payload.get("result", {})
        .get("timeline_response", {})
        .get("timeline", {})
        .get("instructions", [])
    )
    if not instructions:
        instructions = payload.get("response", {}).get("data", {}).get("result", {}).get("timeline_response", {}).get(
            "timeline", {}
        ).get("instructions", [])

    tweets: list[dict[str, Any]] = []
    for instruction in instructions:
        entries = instruction.get("entries", [])
        for entry in entries:
            item = entry.get("content", {}).get("itemContent", {})
            tweet = item.get("tweet_results", {}).get("result")
            if isinstance(tweet, dict):
                # Some responses wrap tweet under TweetWithVisibilityResults
                if "tweet" in tweet and isinstance(tweet.get("tweet"), dict):
                    tweets.append(tweet["tweet"])
                else:
                    tweets.append(tweet)

    # Fallback: scan full payload in case timeline shape changed
    if not tweets:
        stack: list[Any] = [payload]
        while stack:
            current = stack.pop()
            if isinstance(current, dict):
                if "rest_id" in current and ("legacy" in current or "core" in current):
                    tweets.append(current)
                for value in current.values():
                    stack.append(value)
            elif isinstance(current, list):
                stack.extend(current)
    return tweets


def find_best_video_url(video_info: dict[str, Any] | None) -> str | None:
    if not video_info:
        return None
    variants = video_info.get("variants", [])
    mp4_variants = [v for v in variants if v.get("content_type") == "video/mp4" and v.get("url")]
    if not mp4_variants:
        return None
    mp4_variants.sort(key=lambda v: int(v.get("bitrate", 0)), reverse=True)
    return mp4_variants[0].get("url")


def parse_rapidapi_media(tweet: dict[str, Any]) -> tuple[list[str], list[dict[str, Any]]]:
    media_urls: list[str] = []
    media_items: list[dict[str, Any]] = []
    ext_media = tweet.get("legacy", {}).get("extended_entities", {}).get("media", [])
    for media in ext_media:
        mtype = media.get("type")
        if mtype == "photo":
            url = media.get("media_url_https")
            if url:
                media_urls.append(url)
                media_items.append({"type": "image", "url": url})
        elif mtype in {"video", "animated_gif"}:
            best = find_best_video_url(media.get("video_info"))
            if best:
                media_urls.append(best)
                media_items.append(
                    {
                        "type": "video",
                        "url": best,
                        "duration_millis": media.get("video_info", {}).get("duration_millis"),
                    }
                )
    # Fallback to entities.media if extended_entities is missing
    if not media_urls:
        for media in tweet.get("legacy", {}).get("entities", {}).get("media", []):
            url = media.get("media_url_https")
            if url:
                media_urls.append(url)
                media_items.append({"type": "image", "url": url})
    return media_urls, media_items


def fetch_via_rapidapi(url: str, tweet_id: str) -> dict[str, Any] | None:
    username = extract_username(url)
    if not username:
        return None

    host = os.getenv("RAPIDAPI_HOST", "twitter241.p.rapidapi.com").strip() or "twitter241.p.rapidapi.com"
    keys = get_rapidapi_keys()
    if not keys:
        return None

    for idx, key in enumerate(keys, start=1):
        user_id = get_rapidapi_user_id(username, key, host)
        if not user_id:
            continue

        try:
            resp = requests.get(
                f"https://{host}/user-tweets",
                params={"user": user_id, "count": 40},
                headers=rapidapi_headers(key, host),
                timeout=20,
            )
            if resp.status_code == 200:
                mark_rapidapi_key_result(key, "ok")
            elif resp.status_code in (429, 401, 403):
                mark_rapidapi_key_result(key, "hard_fail")
            else:
                mark_rapidapi_key_result(key, "soft_fail")
            if resp.status_code != 200:
                print(
                    f"[x-fetcher] rapidapi user-tweets non-200 (key#{idx}, status={resp.status_code})",
                    file=sys.stderr,
                )
                continue
            payload = resp.json()
            tweets = extract_tweet_objects_from_timeline(payload)
            for tweet in tweets:
                current_id = str(tweet.get("rest_id", ""))
                if current_id == tweet_id:
                    media, media_items = parse_rapidapi_media(tweet)
                    user_legacy = tweet.get("core", {}).get("user_results", {}).get("result", {}).get("legacy", {})
                    legacy = tweet.get("legacy", {})
                    return {
                        "rest_id": current_id,
                        "full_text": legacy.get("full_text", ""),
                        "created_at": legacy.get("created_at", ""),
                        "views": tweet.get("views", {}).get("count", 0),
                        "retweet_count": legacy.get("retweet_count", 0),
                        "favorite_count": legacy.get("favorite_count", 0),
                        "reply_count": legacy.get("reply_count", 0),
                        "author_name": user_legacy.get("name", ""),
                        "author_username": user_legacy.get("screen_name", username),
                        "author_avatar": user_legacy.get("profile_image_url_https", ""),
                        "media": media,
                        "media_items": media_items,
                    }
        except Exception as exc:  # noqa: BLE001
            mark_rapidapi_key_result(key, "soft_fail")
            print(f"[x-fetcher] rapidapi user-tweets error (key#{idx}): {exc}", file=sys.stderr)
            continue
    return None


def fetch_via_fxtwitter(url: str) -> dict[str, Any] | None:
    api_url = re.sub(r"(x\.com|twitter\.com)", "api.fxtwitter.com", url)
    try:
        resp = requests.get(api_url, headers={"User-Agent": UA}, timeout=20)
        if resp.status_code == 200:
            return resp.json()
    except Exception as exc:  # noqa: BLE001
        print(f"[x-fetcher] fxtwitter error: {exc}", file=sys.stderr)
    return None


def fetch_via_syndication(tweet_id: str) -> dict[str, Any] | None:
    url = f"https://cdn.syndication.twimg.com/tweet-result?id={tweet_id}&token=0"
    try:
        resp = requests.get(url, headers={"User-Agent": UA}, timeout=15)
        if resp.status_code == 200:
            return resp.json()
    except Exception as exc:  # noqa: BLE001
        print(f"[x-fetcher] syndication error: {exc}", file=sys.stderr)
    return None


def extract_article_content(article: dict[str, Any] | None) -> str | None:
    if not article:
        return None
    content_blocks = article.get("content", {}).get("blocks", [])
    paragraphs: list[str] = []
    for block in content_blocks:
        text = str(block.get("text", "")).strip()
        block_type = str(block.get("type", "unstyled"))
        if not text:
            continue
        if block_type == "header-one":
            paragraphs.append(f"# {text}")
        elif block_type == "header-two":
            paragraphs.append(f"## {text}")
        elif block_type == "header-three":
            paragraphs.append(f"### {text}")
        elif block_type == "blockquote":
            paragraphs.append(f"> {text}")
        elif block_type == "unordered-list-item":
            paragraphs.append(f"- {text}")
        elif block_type == "ordered-list-item":
            paragraphs.append(f"1. {text}")
        else:
            paragraphs.append(text)
    return "\n\n".join(paragraphs)


def format_output(data: dict[str, Any], source: str) -> dict[str, Any]:
    result: dict[str, Any] = {
        "source": source,
        "success": True,
        "type": "tweet",
        "content": {},
    }

    if source == "fxtwitter":
        tweet = data.get("tweet", {})
        article = tweet.get("article")

        if article:
            result["type"] = "article"
            result["content"] = {
                "title": article.get("title", ""),
                "preview": article.get("preview_text", ""),
                "full_text": extract_article_content(article),
                "cover_image": article.get("cover_media", {}).get("media_info", {}).get("original_img_url"),
                "author": tweet.get("author", {}).get("name", ""),
                "username": tweet.get("author", {}).get("screen_name", ""),
                "created_at": article.get("created_at", ""),
                "modified_at": article.get("modified_at", ""),
                "likes": tweet.get("likes", 0),
                "retweets": tweet.get("retweets", 0),
                "views": tweet.get("views", 0),
                "bookmarks": tweet.get("bookmarks", 0),
            }
        else:
            result["content"] = {
                "text": tweet.get("text", ""),
                "author": tweet.get("author", {}).get("name", ""),
                "username": tweet.get("author", {}).get("screen_name", ""),
                "created_at": tweet.get("created_at", ""),
                "likes": tweet.get("likes", 0),
                "retweets": tweet.get("retweets", 0),
                "views": tweet.get("views", 0),
                "media": [
                    m.get("url")
                    for m in tweet.get("media", {}).get("all", [])
                    if m.get("url")
                ],
                "replies": tweet.get("replies", 0),
            }

    elif source == "syndication":
        result["content"] = {
            "text": data.get("text", ""),
            "author": data.get("user", {}).get("name", ""),
            "username": data.get("user", {}).get("screen_name", ""),
            "created_at": data.get("created_at", ""),
            "likes": data.get("favorite_count", 0),
            "retweets": data.get("retweet_count", 0),
            "media": [
                m.get("media_url_https")
                for m in data.get("mediaDetails", [])
                if m.get("media_url_https")
            ],
        }

    elif source == "rapidapi":
        result["content"] = {
            "id": data.get("rest_id", ""),
            "text": data.get("full_text", ""),
            "author": data.get("author_name", ""),
            "username": data.get("author_username", ""),
            "author_avatar": data.get("author_avatar", ""),
            "created_at": data.get("created_at", ""),
            "likes": data.get("favorite_count", 0),
            "retweets": data.get("retweet_count", 0),
            "views": data.get("views", 0),
            "replies": data.get("reply_count", 0),
            "media": data.get("media", []),
            "media_items": data.get("media_items", []),
            "url": f"https://x.com/{data.get('author_username', '')}/status/{data.get('rest_id', '')}",
        }

    return result


def fetch_tweet(url: str) -> dict[str, Any]:
    tweet_id = extract_tweet_id(url)
    if not tweet_id:
        return {"success": False, "error": "无法从 URL 提取 tweet ID"}

    data = fetch_via_fxtwitter(url)
    if data and data.get("tweet"):
        return format_output(data, "fxtwitter")

    data = fetch_via_syndication(tweet_id)
    if data and data.get("text"):
        return format_output(data, "syndication")

    data = fetch_via_rapidapi(url, tweet_id)
    if data and data.get("full_text"):
        return format_output(data, "rapidapi")

    return {"success": False, "error": "所有抓取方式均失败"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="抓取 X(Twitter) 内容")
    parser.add_argument("input", nargs="?", help="X/Twitter 帖子 URL，或关键词（自动识别）")
    parser.add_argument("--search", help="关键词搜索模式（按关键词检索 X 帖子）")
    parser.add_argument("-n", "--limit", type=int, default=5, help="搜索模式返回数量（默认 5）")
    parser.add_argument("--compact", action="store_true", help="输出紧凑 JSON")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.search:
        result = search_tweets(args.search, max(1, args.limit))
    elif args.input:
        if is_status_url(args.input):
            result = fetch_tweet(args.input)
        else:
            # 兼容无 --search 的关键词输入
            result = search_tweets(args.input, max(1, args.limit))
    else:
        result = {"success": False, "error": "请提供 URL 或使用 --search 关键词模式"}

    if args.compact:
        print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("success") else 1


if __name__ == "__main__":
    raise SystemExit(main())
