---
name: x-fetcher
description: |
  抓取 X(Twitter) 帖子内容（普通推文 + 长文）并输出结构化 JSON。
  触发条件：
  - 需要读取 X 链接内容
  - 需要按关键词搜索 X/Twitter 最新动态（例如“今天推特上有没有 xxx 新技术”）
  - 需要把推文转为可分析数据
  - 需要抓取点赞/转发/浏览等指标
allowed-tools: Bash,read,write
---

# X Fetcher

内置来源：
- 项目参考：`https://github.com/Jane-xiaoer/x-fetcher`

## 用法

```bash
python ~/.openclaw/skills/x-fetcher/fetch_x.py "https://x.com/elonmusk/status/1866208218588203247"
```

关键词搜索（新增）：

```bash
python ~/.openclaw/skills/x-fetcher/fetch_x.py --search "openclaw 新技术" -n 5
```

也支持不写 `--search`，直接输入关键词：

```bash
python ~/.openclaw/skills/x-fetcher/fetch_x.py "openclaw 新技术" -n 5
```

紧凑输出：

```bash
python ~/.openclaw/skills/x-fetcher/fetch_x.py "<x_url>" --compact
```

## 输出内容

- `type=tweet/article`
- `text/full_text`
- `author/username`
- `likes/retweets/views/bookmarks`
- `media`

## 机制

1. 优先走 `api.fxtwitter.com`（支持 X Article）
2. 失败时回退 `cdn.syndication.twimg.com`
3. 前两者失败后，再回退 `twitter241.p.rapidapi.com`（需要配置 Key）
4. 关键词搜索模式优先走 RapidAPI `search-v2/search`（`query + type=Top/Latest`）找链接，失败再回退 DDG，再逐条抓取结构化内容
5. 关键词会自动做智能扩展（例如 `opencalw -> openclaw`，以及 AI/新能源/氢能相关同义词与 `#话题` 扩展）
6. 当问题包含“今天/最新/today/latest”等词时，默认优先返回近 24 小时内容（无命中则回退为最近可用结果）
7. 搜索结果会做相关性排序，并对明显低价值刷屏内容做降权
8. 对 OpenClaw/AI/新能源/氢能等专业查询启用严格相关性过滤：低相关内容会被丢弃

## RapidAPI 回退配置（可选）

若要启用第三层回退，可配置以下环境变量：

```bash
export RAPIDAPI_HOST=twitter241.p.rapidapi.com
export RAPIDAPI_KEY=你的单个key
```

或配置多 Key 自动轮转（推荐）：

```bash
export RAPIDAPI_KEYS=key1,key2,key3
```

## 注意事项

- 依赖第三方接口，可用性会随外部服务波动。
- 私密账号内容无法抓取。
- 对“先查一下今天 X/推特有什么动态”这类请求，先执行本技能；不要先让用户配 Cookie。
