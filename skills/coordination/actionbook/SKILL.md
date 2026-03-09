<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EasyClaw — AI 产品导航</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @font-face {
      font-family: 'Smiley Sans';
      src: url('/assets/smiley-sans.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }

    :root {
      --lobster-1: #c44a1e;
      --lobster-2: #d4622e;
      --lobster-3: #c8713a;
      --lobster-4: #d4895a;
      --bg-dark: #0a0a0f;
      --bg-card: #1c1c28;
      --bg-card-hover: #222236;
      --border: rgba(255, 255, 255, 0.1);
      --border-hover: rgba(180, 80, 40, 0.5);
      --text: #f0ede8;
      --text-muted: #9a9590;
    }

    /* 浅色模式变量 */
    [data-theme="light"] {
      --bg-dark: #f5f3ef;
      --bg-card: #ffffff;
      --bg-card-hover: #fff8f5;
      --border: rgba(180, 80, 40, 0.18);
      --border-hover: rgba(180, 80, 40, 0.45);
      --text: #1a1a1a;
      --text-muted: #666058;
    }

    @media (prefers-color-scheme: light) {
      :root:not([data-theme="dark"]) {
        --bg-dark: #f5f3ef;
        --bg-card: #ffffff;
        --bg-card-hover: #fff8f5;
        --border: rgba(180, 80, 40, 0.18);
        --border-hover: rgba(180, 80, 40, 0.45);
        --text: #1a1a1a;
        --text-muted: #666058;
      }
    }

    /* 对比卡片浅色模式适配 */
    [data-theme="light"] .cmp-openclaw {
      background: #eeeeff !important;
      color: #9999bb !important;
    }
    [data-theme="light"] .cmp-openclaw .cmp-label { color: #6666aa !important; }
    [data-theme="light"] .cmp-openclaw .cmp-title { color: #8888aa !important; }
    [data-theme="light"] .cmp-openclaw .cmp-list li { color: #9999bb !important; }
    [data-theme="light"] .cmp-openclaw .cmp-list li span:first-child { color: #9999cc !important; }

    [data-theme="light"] .cmp-easyclaw {
      background: #fff4e8 !important;
      color: #2a1400 !important;
    }
    [data-theme="light"] .cmp-easyclaw .cmp-label { color: #c87a40 !important; }
    [data-theme="light"] .cmp-easyclaw .cmp-title { color: #2a1400 !important; }
    [data-theme="light"] .cmp-easyclaw .cmp-list li { color: #6b3a10 !important; }

    @media (prefers-color-scheme: light) {
      :root:not([data-theme="dark"]) .cmp-openclaw {
        background: #eeeeff !important;
        color: #9999bb !important;
      }
      :root:not([data-theme="dark"]) .cmp-openclaw .cmp-label { color: #6666aa !important; }
      :root:not([data-theme="dark"]) .cmp-openclaw .cmp-title { color: #8888aa !important; }
      :root:not([data-theme="dark"]) .cmp-openclaw .cmp-list li { color: #9999bb !important; }
      :root:not([data-theme="dark"]) .cmp-openclaw .cmp-list li span:first-child { color: #9999cc !important; }

      :root:not([data-theme="dark"]) .cmp-easyclaw {
        background: #fff4e8 !important;
        color: #2a1400 !important;
      }
      :root:not([data-theme="dark"]) .cmp-easyclaw .cmp-label { color: #c87a40 !important; }
      :root:not([data-theme="dark"]) .cmp-easyclaw .cmp-title { color: #2a1400 !important; }
      :root:not([data-theme="dark"]) .cmp-easyclaw .cmp-list li { color: #6b3a10 !important; }
    }

    /* 主题切换按钮 */
    .lang-toggle {
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 4px 9px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .lang-toggle:hover {
      border-color: var(--lobster-3);
      color: var(--lobster-3);
    }

    .theme-toggle {
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 4px 9px;
      border-radius: 99px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .theme-toggle:hover {
      border-color: var(--border-hover);
      color: var(--lobster-3);
      transform: scale(1.05);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body { overflow-x: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
      background: var(--bg-dark);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
    }

    h1, h2, .hero-title, .card-title {
      font-family: 'Smiley Sans', 'ZCOOL KuaiLe', 'LXGW WenKai', 'Noto Sans SC', sans-serif;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 20%, rgba(255, 69, 0, 0.07) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(255, 107, 53, 0.05) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 0%, rgba(255, 140, 66, 0.08) 0%, transparent 40%);
      pointer-events: none;
      z-index: 0;
    }

    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,100,50,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,100,50,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      z-index: 0;
    }

    .container {
      position: relative;
      z-index: 1;
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
    }

    header {
      padding: 20px 0 8px;
      text-align: center;
      position: relative;
    }

    .logo-area {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .logo-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--lobster-1), var(--lobster-3));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 0 20px rgba(255, 69, 0, 0.4);
    }

    .logo-text { text-align: left; }

    .logo-text h1 {
      font-size: 26px;
      font-weight: 800;
      background: linear-gradient(90deg, var(--lobster-1), var(--lobster-4));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.5px;
    }

    .logo-text p {
      font-size: 13px;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    .hero-title {
      font-size: clamp(20px, 3.5vw, 32px);
      font-weight: normal;
      line-height: 1.2;
      margin-bottom: 8px;
      letter-spacing: 0;
    }

    .hero-title .gradient {
      background: linear-gradient(90deg, var(--lobster-1) 0%, var(--lobster-3) 50%, #ffb347 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-features {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      margin: 12px 0 6px;
    }
    .hero-pill {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 99px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: 0.2px;
      white-space: nowrap;
    }
    .hero-sub {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 540px;
      margin: 0 auto 14px;
      line-height: 1.5;
    }

    .divider {
      width: 50px;
      height: 2px;
      background: linear-gradient(90deg, var(--lobster-1), var(--lobster-3));
      border-radius: 2px;
      margin: 0 auto 18px;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
      gap: 16px;
      padding-bottom: 24px;
    }

    @media (min-width: 900px) {
      .cards { grid-template-columns: repeat(2, minmax(300px, 420px)); justify-content: center; }
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 22px 24px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--lobster-1), var(--lobster-3));
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .card:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-hover);
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 0 12px rgba(255, 69, 0, 0.08);
    }

    .card:hover::before { opacity: 1; }

    .card-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 69, 0, 0.12);
      border: 1px solid rgba(255, 69, 0, 0.25);
      color: var(--lobster-3);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 20px;
      margin-bottom: 12px;
      width: fit-content;
    }

    .card-emoji {
      font-size: 28px;
      margin-bottom: 8px;
      display: block;
      filter: drop-shadow(0 0 12px rgba(255,100,50,0.5));
    }

    .card-domain {
      font-size: 13px;
      color: var(--lobster-3);
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .card-title {
      font-size: 22px;
      font-weight: 400;
      font-style: normal;
      margin-bottom: 10px;
      letter-spacing: -0.3px;
      line-height: 1.3;
    }

    .card-desc {
      font-size: 14.5px;
      color: var(--text-muted);
      line-height: 1.8;
      flex: 1;
      margin-bottom: 16px;
    }

    .card-desc strong {
      color: var(--lobster-4);
      font-weight: 600;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }

    .tag {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--text-muted);
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 10px;
    }

    .card-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 11px 22px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.25s ease;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--lobster-1);
      color: #fff;
      box-shadow: none;
    }

    .btn-primary:hover {
      background: var(--lobster-2);
      box-shadow: none;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 100, 50, 0.1);
      border: 1px solid rgba(255, 100, 50, 0.4);
      color: var(--lobster-3);
    }

    .btn-secondary:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,100,50,0.4);
      color: var(--lobster-3);
    }

    /* 生态工具分区 */
    .eco-section { padding-bottom: 28px; }

    .eco-divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    .eco-divider::before, .eco-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    .eco-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .eco-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    @media (max-width: 640px) {
      .eco-cards { grid-template-columns: 1fr; }
      #product-cards { grid-template-columns: 1fr !important; gap: 16px !important; }
      .qr-block { display: none !important; }
      .qr-mobile-trigger { display: block !important; }

      /* 对比卡片手机端 — 横排紧凑版 */
      #compare-section {
        gap: 6px !important;
        margin-bottom: 8px !important;
      }
      #compare-section .cmp-card {
        padding: 10px 12px !important;
      }
      #compare-section .cmp-label {
        display: none !important;
      }
      #compare-section .cmp-title {
        font-size: 14px !important;
        margin-bottom: 6px !important;
      }
      #compare-section .cmp-list {
        gap: 4px !important;
      }
      #compare-section .cmp-list li {
        font-size: 11px !important;
        gap: 5px !important;
      }
      #compare-section .cmp-arrow {
        flex-shrink: 0;
      }
      #compare-section .cmp-arrow > div {
        width: 28px !important;
        height: 28px !important;
      }
    }

    .eco-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.25s ease;
      color: inherit;
      text-decoration: none;
    }
    .eco-card:visited, .eco-card:visited * {
      color: inherit;
    }
    .eco-card:hover {
      border-color: var(--border-hover);
      background: var(--bg-card-hover);
      transform: translateY(-2px);
    }
    .eco-icon {
      font-size: 28px;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      background: rgba(180,80,40,0.08);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .eco-info { flex: 1; min-width: 0; }
    .eco-domain {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: var(--lobster-3);
      margin-bottom: 3px;
    }
    .eco-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 4px;
      font-family: 'DM Serif Display', serif;
    }
    .eco-desc {
      font-size: 12.5px;
      color: var(--text-muted);
      line-height: 1.6;
    }
    .btn-eco {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
      background: rgba(180,80,40,0.08);
      border: 1px solid var(--border);
      color: var(--lobster-3);
      transition: all 0.2s ease;
    }
    .btn-eco:hover {
      background: rgba(180,80,40,0.15);
      border-color: var(--border-hover);
    }

    /* 多Agent配置卡片 */
    .agent-config-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .agent-config-card:hover {
      border-color: var(--border-hover);
      background: var(--bg-card-hover);
      transform: translateY(-2px);
    }
    .agent-config-left { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
    .agent-config-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }
    .btn-copy {
      background: var(--lobster-1);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 9px 18px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-copy:hover { background: var(--lobster-2); }
    .copy-hint {
      font-size: 12px;
      color: #4caf50;
      font-weight: 500;
      display: none;
    }
    .copy-hint.show { display: block; }
    @media (max-width: 640px) {
      .agent-config-card { flex-direction: column; align-items: flex-start; }
      .agent-config-right { align-items: flex-start; }
    }

    footer {
      z-index: 1;
      text-align: center;
      padding: 30px 0 40px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }

    footer p { color: var(--text-muted); font-size: 13px; }
    footer a { color: var(--lobster-3); text-decoration: none; }

    .particle {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      animation: float linear infinite;
      opacity: 0;
    }

    @keyframes float {
      0% { transform: translateY(100vh) scale(0); opacity: 0; }
      10% { opacity: 0.6; }
      90% { opacity: 0.3; }
      100% { transform: translateY(-10vh) scale(1); opacity: 0; }
    }

    @media (max-width: 768px) {
      header { padding: 40px 0 10px; }
      .hero-title { font-size: 28px; }
      .hero-features {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      margin: 12px 0 6px;
    }
    .hero-pill {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 99px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: 0.2px;
      white-space: nowrap;
    }
    .hero-sub { font-size: 15px; }
      .cards { grid-template-columns: 1fr; gap: 20px; }
      .card { padding: 28px 24px; }
      .card-title { font-size: 20px; }
      .btn { padding: 10px 18px; font-size: 13px; }
    }
  .qr-link {
      font-size: 13px;
      text-decoration: none;
      opacity: 0.85;
      color: var(--text-muted);
    }
    .qr-link:hover { opacity: 1; text-decoration: underline; }
    .qr-link-wrap { display: block; }
    body.lang-en .qr-link-wrap { display: none; }

    
    
    /* 手机端三个版本紧凑布局 */
    @media (max-width: 600px) {
      #compare-section { display: none; } .mobile-hide { display: none !important; } }
    @media (max-width: 600px) {
      .cards { grid-template-columns: 1fr !important; gap: 8px !important; }
      .card { padding: 12px !important; }
      .cards .card .card-emoji,
      .cards .card span.card-emoji { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; }
      .card .card-domain { font-size: 10px !important; margin-bottom: 2px !important; }
      .card .card-title { font-size: 15px !important; margin-bottom: 4px !important; }
      .card .card-title small { font-size: 11px !important; }
      .card .card-desc {
        font-size: 12px !important; line-height: 1.5 !important;
        display: -webkit-box; -webkit-line-clamp: 2;
        -webkit-box-orient: vertical; overflow: hidden;
        word-break: break-word; overflow-wrap: break-word; max-width: 100%;
      }
      .card hr { margin: 6px 0 !important; }
      .card .card-tags { gap: 4px !important; flex-wrap: wrap; }
      .card .tag { font-size: 10px !important; padding: 2px 5px !important; }
      .card .card-actions { flex-wrap: wrap; gap: 5px !important; margin-top: 0 !important; }
      .card .card-actions .btn { flex: 1; min-width: 70px; font-size: 11px !important; padding: 6px 6px !important; text-align: center; justify-content: center !important; }
      
      /* 手机端进一步压缩 */
      /* 手机端 hero 标题压缩 */
      .hero { padding: 16px 16px 12px !important; }
      .hero-logo { height: 28px !important; margin-bottom: 8px !important; }
      .hero-title { font-size: 18px !important; line-height: 1.3 !important; margin-bottom: 6px !important; }
      .hero-subtitle { font-size: 11px !important; line-height: 1.4 !important; }

      .card .card-tags { display: none !important; }
      .card .card-desc { -webkit-line-clamp: 3 !important; }
      .card hr:not(:last-of-type) { display: none !important; }
      /* 手机端二维码改为弹出方式 */
      .qr-link-wrap { display: none !important; }
      /* 改用文字触发 */
      .qr-mobile-trigger { display: flex !important; }

    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css" rel="stylesheet">
</head>
<body>

  <div id="particles"></div>

  <div class="container">
    <header>
      <div class="logo-area">
        <img src="/assets/easyclaw-desktop-logo.png" alt="EasyClaw" style="height:40px;width:auto;filter:saturate(0.5);">
        <div class="logo-text">
          <h1>EasyClaw</h1>
          <p>Built on OpenClaw</p>
        </div>
      </div>
      <h2 class="hero-title" id="hero-title">
        选择你的 <span class="gradient">AI 龙虾</span>，开启智能新时代
      </h2>
      <p class="hero-sub" id="hero-sub">全系列 AI 产品，企业云端 · 个人桌面 · 国内外版本全覆盖</p>
      <div class="hero-features">



      </div>
      <div class="divider"></div>
      <div style="position:absolute;top:20px;right:0;display:flex;align-items:center;gap:8px;">
        <button class="theme-toggle" id="themeToggle" title="切换主题">
          <svg id="icon-moon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg id="icon-sun" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </button>
        <button class="lang-toggle" id="langToggle" onclick="toggleLang()">EN</button>
      </div>
    </header>

        <!-- OpenClaw vs EasyClaw 对比模块 -->
    <div id="compare-section" style="margin:0 auto 12px;max-width:720px;padding:16px 16px 0;color-scheme:dark;display:flex;align-items:center;gap:12px;">

      <!-- 左：OpenClaw -->
      <div class="cmp-card cmp-openclaw" style="flex:1;background:#1e1e2e;padding:18px 24px 22px;min-width:0;border-radius:16px;color:#aaaaaa;">
        <div class="cmp-label" style="font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;" data-zh="海外原版框架" data-en="Open-source Framework">海外原版框架</div>
        <div class="cmp-title" style="font-size:20px;font-weight:800;color:#888899;margin-bottom:12px;letter-spacing:-0.5px;">OpenClaw</div>
        <ul class="cmp-list" style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">
          <li style="color:#666677;font-size:14px;display:flex;align-items:center;gap:8px;"><span style="color:#444;">•</span><span data-zh="极客专属框架" data-en="Built for developers &amp; power users">极客专属框架</span></li>
          <li style="color:#666677;font-size:14px;display:flex;align-items:center;gap:8px;"><span style="color:#444;">•</span><span data-zh="需专业知识部署" data-en="Requires technical setup">需专业知识部署</span></li>
          <li style="color:#666677;font-size:14px;display:flex;align-items:center;gap:8px;"><span style="color:#444;">•</span><span data-zh="理念超前 · 门槛高" data-en="Cutting-edge · High barrier to entry">理念超前 · 门槛高</span></li>
        </ul>
      </div>

      <!-- 箭头 -->
      <div class="cmp-arrow" style="flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        <div style="width:36px;height:36px;border-radius:50%;background:#c44a1e;display:flex;align-items:center;justify-content:center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      </div>

      <!-- 右：EasyClaw -->
      <div class="cmp-card cmp-easyclaw" style="flex:1;background:#2a1a0e;padding:18px 24px 22px;min-width:0;border-radius:16px;color:#ffffff;cursor:pointer;transition:background 0.2s;position:relative;overflow:visible;"
           onmouseenter="this.style.background='#361f0e'"
           onmouseleave="this.style.background='#2a1a0e'"
           onclick="document.getElementById('product-cards').scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>window.scrollBy({top:-32,behavior:'smooth'}),400)">
        <!-- 绿色对钩徽章 -->
        <div style="position:absolute;top:-14px;right:-14px;width:36px;height:36px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(34,197,94,0.45);border:2.5px solid #fff;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="cmp-label" style="font-size:11px;color:#c87a40;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;" data-zh="产品化版本" data-en="Consumer Product">产品化版本</div>
        <div class="cmp-title" style="font-size:20px;font-weight:800;color:#ffffff;margin-bottom:12px;letter-spacing:-0.5px;">EasyClaw</div>
        <ul class="cmp-list" style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">
          <li style="color:#f0c090;font-size:14px;display:flex;align-items:center;gap:8px;"><span style="color:#c44a1e;font-weight:700;">✓</span><span data-zh="开箱即用，无需部署" data-en="Ready to use, no setup needed">开箱即用，无需部署</span></li>
          <li style="color:#f0c090;font-size:14px;display:flex;align-items:center;gap:8px;"><span style="color:#c44a1e;font-weight:700;">✓</span><span data-zh="手机控制，一句话上手" data-en="Control via phone, one sentence to start">手机控制，一句话上手</span></li>
          <li style="color:#f0c090;font-size:14px;display:flex;align-items:center;gap:8px;"><span style="color:#c44a1e;font-weight:700;">✓</span><span data-zh="无需任何专业知识" data-en="No technical knowledge required">无需任何专业知识</span></li>
        </ul>
      </div>

    </div>


    <!-- 产品卡片区域 -->
    <section class="section" style="padding-top:16px;">
      <div id="product-cards" style="display:grid;grid-template-columns:repeat(2,minmax(280px,420px));gap:24px;justify-content:center;max-width:900px;margin:0 auto;padding:0 16px;">

        <!-- 企业版 -->
        <div class="card" style="border-radius:16px;padding:28px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="/assets/easyclaw-work-logo.svg" alt="EasyClaw" style="width:40px;height:40px;border-radius:10px;">
            <div>
              <div style="font-size:11px;color:#c44a1e;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;" data-zh="企业版" data-en="Enterprise">企业版</div>
              <div style="font-size:20px;font-weight:800;color:var(--text);line-height:1.2;"><span data-zh="">EasyClaw 企业版</span><span data-en="" style="display:none;">EasyClaw Enterprise</span></div>
            </div>
          </div>
          <p class="card-desc" data-zh="☁️ <strong>无需个人电脑</strong>，龙虾跑在云端，手机控制。基于 <strong>OpenClaw</strong> — 无需命令行，全球顶流模型自由切换，即用即付（充值积分）。" data-en="<strong>No download needed</strong> — your AI agent runs on its own cloud server. Switch between top global models freely. <strong>Pay as you go</strong> with credits." style="font-size:14px;color:var(--text-muted);line-height:1.7;margin:0;">
            ☁️ <strong>无需个人电脑</strong>，龙虾跑在云端，手机控制。基于 <strong>OpenClaw</strong> — 无需命令行，全球顶流模型自由切换，即用即付（充值积分）。
          </p>
          <div class="qr-block" style="text-align:center;padding-top:4px;">
            <img src="/assets/qr-enterprise.png" alt="企业版交流群" style="width:100px;height:100px;border-radius:8px;">
            <div style="font-size:12px;color:var(--text-muted);margin-top:6px;"><span data-zh="">企业版交流群</span><span data-en="" style="display:none;">Enterprise Community</span></div>
          </div>
          <div class="qr-mobile-trigger" style="display:none;padding-top:8px;text-align:center;">
            <a href="javascript:void(0)" onclick="document.getElementById('qr-modal-enterprise').style.display='flex'" style="font-size:13px;color:var(--lobster-3);text-decoration:none;font-weight:500;" data-zh="扫码加交流群 →" data-en="Join Community →">扫码加交流群 →</a>
          </div>
          <div style="margin-top:auto;padding-top:8px;">
            <a href="https://easyclaw.work" target="_blank" style="display:block;width:100%;padding:11px 0;background:var(--accent,#c44a1e);color:#fff;border-radius:9px;text-align:center;font-size:14px;font-weight:600;text-decoration:none;box-sizing:border-box;" data-zh="体验云端&ldquo;养龙虾&rdquo;" data-en="Try Cloud Edition">体验云端"养龙虾"</a>
          </div>
        </div>

        <!-- 个人版 -->
        <div class="card" style="border-radius:16px;padding:28px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="/assets/easyclaw-desktop-logo.png" alt="EasyClaw Desktop" style="width:40px;height:40px;border-radius:10px;">
            <div>
              <div style="font-size:11px;color:#c44a1e;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;" data-zh="个人版" data-en="Personal">个人版</div>
              <div style="font-size:20px;font-weight:800;color:var(--text);line-height:1.2;"><span data-zh="">EasyClaw 个人版</span><span data-en="" style="display:none;">EasyClaw Personal</span></div>
            </div>
          </div>
          <p class="card-desc" style="font-size:14px;color:var(--text-muted);line-height:1.7;margin:0;">
            <span data-zh="">💻 <strong>下载到自己的电脑</strong>，手机控制。基于 <strong>OpenClaw</strong> — 无需命令行，Windows &amp; macOS 全支持。提供国内版和海外版，按需选择。</span>
            <span data-en="" style="display:none;"><strong>Download to your own PC</strong>, control via mobile. Built on <strong>OpenClaw</strong> — no CLI needed. Windows &amp; macOS supported. Choose between China or International edition.</span>
          </p>
          <div class="qr-block" style="text-align:center;padding-top:4px;">
            <img src="/assets/qr-personal-new.png" alt="个人版交流群" style="width:100px;height:100px;border-radius:8px;">
            <div style="font-size:12px;color:var(--text-muted);margin-top:6px;"><span data-zh="">个人版交流群</span><span data-en="" style="display:none;">Personal Community</span></div>
          </div>
          <div class="qr-mobile-trigger" style="display:none;padding-top:8px;text-align:center;">
            <a href="javascript:void(0)" onclick="document.getElementById('qr-modal-personal').style.display='flex'" style="font-size:13px;color:var(--lobster-3);text-decoration:none;font-weight:500;" data-zh="扫码加交流群 →" data-en="Join Community →">扫码加交流群 →</a>
          </div>
          <div style="display:flex;gap:10px;margin-top:auto;padding-top:8px;">
            <button onclick="document.getElementById('personal-modal').style.display='flex'" style="flex:1;padding:11px 0;background:var(--accent,#c44a1e);color:#fff;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;border:none;" data-zh="去官网下载" data-en="Download Now">去官网下载</button>
          </div>
          
        </div>

      </div>
    </section>
    <div class="lang-zh-only" style="max-width:900px;margin:10px auto 0;padding:0 16px;text-align:center;font-size:11px;color:var(--text-muted);line-height:1.7;opacity:0.7;font-weight:600;">
      各版本由不同主体独立运营，账号数据不互通，使用前请阅读各平台用户协议。<a href="javascript:void(0)" onclick="document.getElementById('version-modal').style.display='flex'" style="color:var(--lobster-3);text-decoration:none;margin-left:4px;">了解详情</a>
    </div>

    <!-- Multi-agent modal -->
    <div id="multiagent-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
      <div style="background:#fff;border-radius:16px;padding:28px 24px;max-width:400px;width:calc(100% - 32px);box-shadow:0 8px 40px rgba(0,0,0,0.18);">
        <h3 style="margin:0 0 12px;font-size:17px;color:#1a1a1a;"><span data-zh="">🤖 多龙虾协同</span><span data-en="" style="display:none;">🤖 Multi-Agent Mode</span></h3>
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;"><span data-zh="">多龙虾协同功能需要登录 EasyClaw 企业版账号使用。</span><span data-en="" style="display:none;">Multi-agent mode requires an EasyClaw Enterprise account.</span></p>
        <div style="display:flex;gap:10px;">
          <a href="https://easyclaw.work" target="_blank" style="flex:1;padding:11px 0;background:var(--accent,#c44a1e);color:#fff;border-radius:9px;text-align:center;font-size:14px;font-weight:600;text-decoration:none;"><span data-zh="">前往登录</span><span data-en="" style="display:none;">Go to Login</span></a>
          <button onclick="document.getElementById('multiagent-modal').style.display='none'" style="flex:1;padding:11px 0;border:1.5px solid #e8e0d8;border-radius:9px;background:#fff;color:#333;font-size:14px;cursor:pointer;font-weight:500;"><span data-zh="">取消</span><span data-en="" style="display:none;">Cancel</span></button>
        </div>
      </div>
    </div>

    <!-- 个人版弹窗 -->
    <div id="personal-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
      <div style="background:#fff;border-radius:16px;padding:28px 24px;max-width:480px;width:calc(100% - 32px);box-shadow:0 8px 40px rgba(0,0,0,0.18);position:relative;">
        <button onclick="document.getElementById('personal-modal').style.display='none'" style="position:absolute;top:16px;right:16px;border:none;background:none;font-size:20px;cursor:pointer;color:#999;">×</button>
        <h3 style="margin:0 0 20px;font-size:18px;color:#1a1a1a;font-weight:700;">选择个人版</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <a href="https://easyclaw.cn" target="_blank" class="card-cn" style="display:block;padding:20px 16px;border:1.5px solid #f0ece8;border-radius:12px;text-decoration:none;text-align:center;transition:border-color 0.2s;" onmouseenter="this.style.borderColor='#c44a1e'" onmouseleave="this.style.borderColor='#f0ece8'">
            <div style="font-size:22px;margin-bottom:8px;">🇨🇳</div>
            <div style="font-weight:700;color:#1a1a1a;margin-bottom:4px;">国内版</div>
            <div style="font-size:12px;color:#999;">EasyClaw.cn</div>
          </a>
          <a href="https://easyclaw.com" target="_blank" style="display:block;padding:20px 16px;border:1.5px solid #f0ece8;border-radius:12px;text-decoration:none;text-align:center;transition:border-color 0.2s;" onmouseenter="this.style.borderColor='#c44a1e'" onmouseleave="this.style.borderColor='#f0ece8'">
            <div style="font-size:22px;margin-bottom:8px;">🌍</div>
            <div style="font-weight:700;color:#1a1a1a;margin-bottom:4px;">海外版</div>
            <div style="font-size:12px;color:#999;">EasyClaw.com</div>
          </a>
        </div>
      </div>
    </div>

    <!-- 版本区别弹窗 -->
<div id="version-diff-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
  <div style="background:#fff;border-radius:16px;padding:24px 20px;max-width:760px;width:calc(100% - 32px);box-shadow:0 8px 40px rgba(0,0,0,0.18);max-height:90vh;display:flex;flex-direction:column;">
    <h3 style="margin:0 0 14px;font-size:17px;color:#1a1a1a;flex-shrink:0;">三个版本有什么区别？</h3>

    <!-- PC：三列横向表格 -->
    <div class="vdiff-pc" style="overflow-y:auto;flex:1;min-height:0;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#f9f6f2;">
            <th style="padding:8px 10px;text-align:left;color:#999;font-weight:500;width:22%;border-bottom:1px solid #e8e4df;"></th>
            <th style="padding:8px 10px;text-align:center;border-bottom:1px solid #e8e4df;">☁️ 企业版<br><span style="font-size:11px;color:#999;font-weight:400;">EasyClaw.work</span></th>
            <th style="padding:8px 10px;text-align:center;border-bottom:1px solid #e8e4df;">🇨🇳 个人版（国内）<br><span style="font-size:11px;color:#999;font-weight:400;">EasyClaw.cn</span></th>
            <th style="padding:8px 10px;text-align:center;border-bottom:1px solid #e8e4df;">🌍 个人版（海外）<br><span style="font-size:11px;color:#999;font-weight:400;">EasyClaw.com</span></th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 10px;color:#666;font-weight:500;">使用方式</td><td style="padding:6px 10px;text-align:center;">免下载</td><td style="padding:6px 10px;text-align:center;">下载安装</td><td style="padding:6px 10px;text-align:center;">下载安装</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 10px;color:#666;font-weight:500;">AI 模型</td><td style="padding:6px 10px;text-align:center;">全球顶流模型</td><td style="padding:6px 10px;text-align:center;">国内主流合规模型</td><td style="padding:6px 10px;text-align:center;">全球顶流模型</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 10px;color:#666;font-weight:500;">适合人群</td><td style="padding:6px 10px;text-align:center;">企业 / 境外个人</td><td style="padding:6px 10px;text-align:center;">中国大陆用户</td><td style="padding:6px 10px;text-align:center;">境外个人</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 10px;color:#666;font-weight:500;">账号体系</td><td style="padding:6px 10px;text-align:center;">独立</td><td style="padding:6px 10px;text-align:center;">独立</td><td style="padding:6px 10px;text-align:center;">独立</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 10px;color:#666;font-weight:500;">「龙虾」控制方式</td><td style="padding:6px 10px;text-align:center;">浏览器 + 主流聊天App</td><td style="padding:6px 10px;text-align:center;">电脑/手机端App + 主流聊天App</td><td style="padding:6px 10px;text-align:center;">电脑/手机端App + 主流聊天App</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 10px;color:#666;font-weight:500;">「龙虾」环境</td><td style="padding:6px 10px;text-align:center;">🖥️ 龙虾有独立云电脑</td><td style="padding:6px 10px;text-align:center;">💻 与用户共享电脑</td><td style="padding:6px 10px;text-align:center;">💻 与用户共享电脑</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 10px;color:#666;font-weight:500;">「龙虾」性能</td><td style="padding:6px 10px;text-align:center;">云服务器，弹性扩容</td><td style="padding:6px 10px;text-align:center;">使用您的电脑性能</td><td style="padding:6px 10px;text-align:center;">使用您的电脑性能</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 10px;color:#666;font-weight:500;">OpenClaw 框架</td><td style="padding:6px 10px;text-align:center;">✅ 完全兼容</td><td style="padding:6px 10px;text-align:center;">✅ 完全兼容</td><td style="padding:6px 10px;text-align:center;">✅ 完全兼容</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 10px;color:#666;font-weight:500;">操作系统</td><td style="padding:6px 10px;text-align:center;">Ubuntu (有Chrome浏览器)</td><td style="padding:6px 10px;text-align:center;">共享您的电脑系统</td><td style="padding:6px 10px;text-align:center;">共享您的电脑系统</td></tr>
          <tr><td style="padding:6px 10px;color:#666;font-weight:500;">计费方式</td><td style="padding:6px 10px;text-align:center;">即用即付（充值积分）</td><td style="padding:6px 10px;text-align:center;">订阅制 + 附加购买积分</td><td style="padding:6px 10px;text-align:center;">订阅制 + 附加购买积分</td></tr>
        </tbody>
      </table>
      <p style="font-size:12px;color:#999;line-height:1.7;margin:10px 0 0;padding:10px 12px;background:#f9f6f2;border-radius:8px;">⚠️ 账号、充值记录、数据在三个版本之间相互独立，不能共享或转移，请按需选择。</p>
    </div>

    <!-- 手机：Tab 切换 -->
    <div class="vdiff-mobile" style="display:none;flex:1;min-height:0;flex-direction:column;">
      <div style="display:flex;gap:6px;margin-bottom:10px;flex-shrink:0;">
        <button onclick="switchVersionTab(0)" id="vtab-0" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid var(--accent,#c44a1e);background:var(--accent,#c44a1e);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">☁️ 云端</button>
        <button onclick="switchVersionTab(1)" id="vtab-1" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid #e0dbd5;background:#f9f6f2;color:#555;font-size:13px;cursor:pointer;">🇨🇳 国内</button>
        <button onclick="switchVersionTab(2)" id="vtab-2" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid #e0dbd5;background:#f9f6f2;color:#555;font-size:13px;cursor:pointer;">🌍 海外</button>
      </div>
      <div style="overflow-y:auto;flex:1;">
        <div id="vcontent-0">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;width:42%;">使用方式</td><td style="padding:6px 6px;">免下载</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">AI 模型</td><td style="padding:6px 6px;">全球顶流模型</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">适合人群</td><td style="padding:6px 6px;">企业 / 境外个人</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">账号体系</td><td style="padding:6px 6px;">独立</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」控制</td><td style="padding:6px 6px;">浏览器 + 主流聊天App</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">「龙虾」环境</td><td style="padding:6px 6px;">🖥️ 独立云电脑</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」性能</td><td style="padding:6px 6px;">云服务器，弹性扩容</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">OpenClaw</td><td style="padding:6px 6px;">✅ 完全兼容</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">操作系统</td><td style="padding:6px 6px;">Ubuntu (有Chrome浏览器)</td></tr>
            <tr><td style="padding:6px 6px;color:#999;">计费方式</td><td style="padding:6px 6px;">即用即付（充值积分）</td></tr>
          </table>
        </div>
        <div id="vcontent-1" style="display:none;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;width:42%;">使用方式</td><td style="padding:6px 6px;">下载安装</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">AI 模型</td><td style="padding:6px 6px;">国内主流合规模型</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">适合人群</td><td style="padding:6px 6px;">中国大陆用户</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">账号体系</td><td style="padding:6px 6px;">独立</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」控制</td><td style="padding:6px 6px;">电脑/手机App + 聊天App</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">「龙虾」环境</td><td style="padding:6px 6px;">💻 与用户共享电脑</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」性能</td><td style="padding:6px 6px;">使用您的电脑性能</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">OpenClaw</td><td style="padding:6px 6px;">✅ 完全兼容</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">操作系统</td><td style="padding:6px 6px;">共享您的电脑系统</td></tr>
            <tr><td style="padding:6px 6px;color:#999;">计费方式</td><td style="padding:6px 6px;">订阅制 + 附加购买积分</td></tr>
          </table>
        </div>
        <div id="vcontent-2" style="display:none;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;width:42%;">使用方式</td><td style="padding:6px 6px;">下载安装</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">AI 模型</td><td style="padding:6px 6px;">全球顶流模型</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">适合人群</td><td style="padding:6px 6px;">境外个人</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">账号体系</td><td style="padding:6px 6px;">独立</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」控制</td><td style="padding:6px 6px;">电脑/手机App + 聊天App</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">「龙虾」环境</td><td style="padding:6px 6px;">💻 与用户共享电脑</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」性能</td><td style="padding:6px 6px;">使用您的电脑性能</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">OpenClaw</td><td style="padding:6px 6px;">✅ 完全兼容</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">操作系统</td><td style="padding:6px 6px;">共享您的电脑系统</td></tr>
            <tr><td style="padding:6px 6px;color:#999;">计费方式</td><td style="padding:6px 6px;">订阅制 + 附加购买积分</td></tr>
          </table>
        </div>
        <p style="font-size:12px;color:#999;line-height:1.7;margin:10px 0 0;padding:10px 12px;background:#f9f6f2;border-radius:8px;">⚠️ 账号、充值记录、数据在三个版本之间相互独立，不能共享或转移，请按需选择。</p>
      </div>
    </div>

    <button onclick="document.getElementById('version-diff-modal').style.display='none'" style="margin-top:14px;width:100%;padding:10px;border:none;border-radius:8px;background:#f0ece8;color:#333;font-size:14px;cursor:pointer;font-weight:500;flex-shrink:0;">我知道了</button>
  </div>
</div>
<style>
  @media (min-width: 600px) {
    .vdiff-pc { display: block !important; }
    .vdiff-mobile { display: none !important; }
  }
  @media (max-width: 599px) {
    .vdiff-pc { display: none !important; }
    .vdiff-mobile { display: flex !important; }
  }
</style>
<script>
function switchVersionTab(idx) {
  for (var i = 0; i < 3; i++) {
    var tab = document.getElementById('vtab-' + i);
    var content = document.getElementById('vcontent-' + i);
    if (i === idx) {
      tab.style.background = 'var(--accent, #c44a1e)';
      tab.style.color = '#fff';
      tab.style.borderColor = 'var(--accent, #c44a1e)';
      content.style.display = '';
    } else {
      tab.style.background = '#f9f6f2';
      tab.style.color = '#555';
      tab.style.borderColor = '#e0dbd5';
      content.style.display = 'none';
    }
  }
}
</script>


<!-- 版本运营主体弹窗 -->
<div id="version-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
  <div style="background:#fff;border-radius:16px;padding:32px 28px;max-width:420px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,0.18);position:relative;">
    <h3 style="margin:0 0 18px;font-size:17px;color:#1a1a1a;">各版本运营主体</h3>
    <p style="font-size:13px;color:#666;line-height:1.7;margin:0 0 18px;padding:12px;background:#f9f6f2;border-radius:8px;">请仔细阅读目标网站的用户使用条款、隐私协议、充值协议等内容，因不同运营主体或地区法律法规的要求，相关条款可能有所不同。<strong>您在这些不同版本之间的账号、充值、权益、数据无法共享，敬请留意。</strong></p>
    <div style="display:flex;flex-direction:column;gap:14px;font-size:14px;color:#333;line-height:1.7;">
      <div>
        <strong>☁️ EasyClaw.work 企业版</strong><br>
        <span style="color:#666;">由 Dream Ahead Pte. Ltd. 运营</span>
      </div>
      <div>
        <strong>🇨🇳 EasyClaw.cn（国内）个人版</strong><br>
        <span style="color:#666;">由 北京灵豹智能科技有限公司 运营</span>
      </div>
      <div>
        <strong>🌍 EasyClaw.com（海外）个人版</strong><br>
        <span style="color:#666;">由 DocuAgile Pte. Ltd. 运营</span>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:24px;">
      <button onclick="document.getElementById('version-modal').style.display='none';document.getElementById('version-diff-modal').style.display='flex'" style="flex:1;padding:10px;border:1px solid #e0dbd5;border-radius:8px;background:#fff;color:var(--accent,#c44a1e);font-size:14px;cursor:pointer;font-weight:500;">📊 了解版本区别</button>
      <button onclick="document.getElementById('version-modal').style.display='none'" style="flex:1;padding:10px;border:none;border-radius:8px;background:#f0ece8;color:#333;font-size:14px;cursor:pointer;font-weight:500;">我知道了</button>
    </div>
  </div>
</div>


    

    <!-- Multi-agent modal -->
    <div id="multiagent-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
      <div style="background:#fff;border-radius:16px;padding:28px 24px;max-width:400px;width:calc(100% - 32px);box-shadow:0 8px 40px rgba(0,0,0,0.18);">
        <h3 style="margin:0 0 12px;font-size:17px;color:#1a1a1a;"><span data-zh="">🤖 多龙虾协同</span><span data-en="" style="display:none;">🤖 Multi-Agent Mode</span></h3>
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;"><span data-zh="">多龙虾协同功能需要登录 EasyClaw 企业版账号使用。</span><span data-en="" style="display:none;">Multi-agent mode requires an EasyClaw Enterprise account.</span></p>
        <div style="display:flex;gap:10px;">
          <a href="https://easyclaw.work" target="_blank" style="flex:1;padding:11px 0;background:var(--accent,#c44a1e);color:#fff;border-radius:9px;text-align:center;font-size:14px;font-weight:600;text-decoration:none;"><span data-zh="">前往登录</span><span data-en="" style="display:none;">Go to Login</span></a>
          <button onclick="document.getElementById('multiagent-modal').style.display='none'" style="flex:1;padding:11px 0;border:1.5px solid #e8e0d8;border-radius:9px;background:#fff;color:#333;font-size:14px;cursor:pointer;font-weight:500;"><span data-zh="">取消</span><span data-en="" style="display:none;">Cancel</span></button>
        </div>
      </div>
    </div>

    <!-- 个人版弹窗 -->
    <div id="personal-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
      <div style="background:#fff;border-radius:16px;padding:28px 24px;max-width:480px;width:calc(100% - 32px);box-shadow:0 8px 40px rgba(0,0,0,0.18);position:relative;">
        <button onclick="document.getElementById('personal-modal').style.display='none'" style="position:absolute;top:16px;right:16px;border:none;background:none;font-size:20px;cursor:pointer;color:#999;">×</button>
        <h3 style="margin:0 0 20px;font-size:18px;color:#1a1a1a;font-weight:700;">选择个人版</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <a href="https://easyclaw.cn" target="_blank" class="card-cn" style="display:block;padding:20px 16px;border:1.5px solid #f0ece8;border-radius:12px;text-decoration:none;text-align:center;transition:border-color 0.2s;" onmouseenter="this.style.borderColor='#c44a1e'" onmouseleave="this.style.borderColor='#f0ece8'">
            <div style="font-size:22px;margin-bottom:8px;">🇨🇳</div>
            <div style="font-weight:700;color:#1a1a1a;margin-bottom:4px;">国内版</div>
            <div style="font-size:12px;color:#999;">EasyClaw.cn</div>
          </a>
          <a href="https://easyclaw.com" target="_blank" style="display:block;padding:20px 16px;border:1.5px solid #f0ece8;border-radius:12px;text-decoration:none;text-align:center;transition:border-color 0.2s;" onmouseenter="this.style.borderColor='#c44a1e'" onmouseleave="this.style.borderColor='#f0ece8'">
            <div style="font-size:22px;margin-bottom:8px;">🌍</div>
            <div style="font-weight:700;color:#1a1a1a;margin-bottom:4px;">海外版</div>
            <div style="font-size:12px;color:#999;">EasyClaw.com</div>
          </a>
        </div>
      </div>
    </div>

    <!-- 版本区别弹窗 -->
<div id="version-diff-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
  <div style="background:#fff;border-radius:16px;padding:24px 20px;max-width:760px;width:calc(100% - 32px);box-shadow:0 8px 40px rgba(0,0,0,0.18);max-height:90vh;display:flex;flex-direction:column;">
    <h3 style="margin:0 0 14px;font-size:17px;color:#1a1a1a;flex-shrink:0;">三个版本有什么区别？</h3>

    <!-- PC：三列横向表格 -->
    <div class="vdiff-pc" style="overflow-y:auto;flex:1;min-height:0;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#f9f6f2;">
            <th style="padding:8px 10px;text-align:left;color:#999;font-weight:500;width:22%;border-bottom:1px solid #e8e4df;"></th>
            <th style="padding:8px 10px;text-align:center;border-bottom:1px solid #e8e4df;">☁️ 企业版<br><span style="font-size:11px;color:#999;font-weight:400;">EasyClaw.work</span></th>
            <th style="padding:8px 10px;text-align:center;border-bottom:1px solid #e8e4df;">🇨🇳 个人版（国内）<br><span style="font-size:11px;color:#999;font-weight:400;">EasyClaw.cn</span></th>
            <th style="padding:8px 10px;text-align:center;border-bottom:1px solid #e8e4df;">🌍 个人版（海外）<br><span style="font-size:11px;color:#999;font-weight:400;">EasyClaw.com</span></th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 10px;color:#666;font-weight:500;">使用方式</td><td style="padding:6px 10px;text-align:center;">免下载</td><td style="padding:6px 10px;text-align:center;">下载安装</td><td style="padding:6px 10px;text-align:center;">下载安装</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 10px;color:#666;font-weight:500;">AI 模型</td><td style="padding:6px 10px;text-align:center;">全球顶流模型</td><td style="padding:6px 10px;text-align:center;">国内主流合规模型</td><td style="padding:6px 10px;text-align:center;">全球顶流模型</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 10px;color:#666;font-weight:500;">适合人群</td><td style="padding:6px 10px;text-align:center;">企业 / 境外个人</td><td style="padding:6px 10px;text-align:center;">中国大陆用户</td><td style="padding:6px 10px;text-align:center;">境外个人</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 10px;color:#666;font-weight:500;">账号体系</td><td style="padding:6px 10px;text-align:center;">独立</td><td style="padding:6px 10px;text-align:center;">独立</td><td style="padding:6px 10px;text-align:center;">独立</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 10px;color:#666;font-weight:500;">「龙虾」控制方式</td><td style="padding:6px 10px;text-align:center;">浏览器 + 主流聊天App</td><td style="padding:6px 10px;text-align:center;">电脑/手机端App + 主流聊天App</td><td style="padding:6px 10px;text-align:center;">电脑/手机端App + 主流聊天App</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 10px;color:#666;font-weight:500;">「龙虾」环境</td><td style="padding:6px 10px;text-align:center;">🖥️ 龙虾有独立云电脑</td><td style="padding:6px 10px;text-align:center;">💻 与用户共享电脑</td><td style="padding:6px 10px;text-align:center;">💻 与用户共享电脑</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 10px;color:#666;font-weight:500;">「龙虾」性能</td><td style="padding:6px 10px;text-align:center;">云服务器，弹性扩容</td><td style="padding:6px 10px;text-align:center;">使用您的电脑性能</td><td style="padding:6px 10px;text-align:center;">使用您的电脑性能</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 10px;color:#666;font-weight:500;">OpenClaw 框架</td><td style="padding:6px 10px;text-align:center;">✅ 完全兼容</td><td style="padding:6px 10px;text-align:center;">✅ 完全兼容</td><td style="padding:6px 10px;text-align:center;">✅ 完全兼容</td></tr>
          <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 10px;color:#666;font-weight:500;">操作系统</td><td style="padding:6px 10px;text-align:center;">Ubuntu (有Chrome浏览器)</td><td style="padding:6px 10px;text-align:center;">共享您的电脑系统</td><td style="padding:6px 10px;text-align:center;">共享您的电脑系统</td></tr>
          <tr><td style="padding:6px 10px;color:#666;font-weight:500;">计费方式</td><td style="padding:6px 10px;text-align:center;">即用即付（充值积分）</td><td style="padding:6px 10px;text-align:center;">订阅制 + 附加购买积分</td><td style="padding:6px 10px;text-align:center;">订阅制 + 附加购买积分</td></tr>
        </tbody>
      </table>
      <p style="font-size:12px;color:#999;line-height:1.7;margin:10px 0 0;padding:10px 12px;background:#f9f6f2;border-radius:8px;">⚠️ 账号、充值记录、数据在三个版本之间相互独立，不能共享或转移，请按需选择。</p>
    </div>

    <!-- 手机：Tab 切换 -->
    <div class="vdiff-mobile" style="display:none;flex:1;min-height:0;flex-direction:column;">
      <div style="display:flex;gap:6px;margin-bottom:10px;flex-shrink:0;">
        <button onclick="switchVersionTab(0)" id="vtab-0" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid var(--accent,#c44a1e);background:var(--accent,#c44a1e);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">☁️ 云端</button>
        <button onclick="switchVersionTab(1)" id="vtab-1" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid #e0dbd5;background:#f9f6f2;color:#555;font-size:13px;cursor:pointer;">🇨🇳 国内</button>
        <button onclick="switchVersionTab(2)" id="vtab-2" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid #e0dbd5;background:#f9f6f2;color:#555;font-size:13px;cursor:pointer;">🌍 海外</button>
      </div>
      <div style="overflow-y:auto;flex:1;">
        <div id="vcontent-0">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;width:42%;">使用方式</td><td style="padding:6px 6px;">免下载</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">AI 模型</td><td style="padding:6px 6px;">全球顶流模型</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">适合人群</td><td style="padding:6px 6px;">企业 / 境外个人</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">账号体系</td><td style="padding:6px 6px;">独立</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」控制</td><td style="padding:6px 6px;">浏览器 + 主流聊天App</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">「龙虾」环境</td><td style="padding:6px 6px;">🖥️ 独立云电脑</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」性能</td><td style="padding:6px 6px;">云服务器，弹性扩容</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">OpenClaw</td><td style="padding:6px 6px;">✅ 完全兼容</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">操作系统</td><td style="padding:6px 6px;">Ubuntu (有Chrome浏览器)</td></tr>
            <tr><td style="padding:6px 6px;color:#999;">计费方式</td><td style="padding:6px 6px;">即用即付（充值积分）</td></tr>
          </table>
        </div>
        <div id="vcontent-1" style="display:none;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;width:42%;">使用方式</td><td style="padding:6px 6px;">下载安装</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">AI 模型</td><td style="padding:6px 6px;">国内主流合规模型</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">适合人群</td><td style="padding:6px 6px;">中国大陆用户</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">账号体系</td><td style="padding:6px 6px;">独立</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」控制</td><td style="padding:6px 6px;">电脑/手机App + 聊天App</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">「龙虾」环境</td><td style="padding:6px 6px;">💻 与用户共享电脑</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」性能</td><td style="padding:6px 6px;">使用您的电脑性能</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">OpenClaw</td><td style="padding:6px 6px;">✅ 完全兼容</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">操作系统</td><td style="padding:6px 6px;">共享您的电脑系统</td></tr>
            <tr><td style="padding:6px 6px;color:#999;">计费方式</td><td style="padding:6px 6px;">订阅制 + 附加购买积分</td></tr>
          </table>
        </div>
        <div id="vcontent-2" style="display:none;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;width:42%;">使用方式</td><td style="padding:6px 6px;">下载安装</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">AI 模型</td><td style="padding:6px 6px;">全球顶流模型</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">适合人群</td><td style="padding:6px 6px;">境外个人</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">账号体系</td><td style="padding:6px 6px;">独立</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」控制</td><td style="padding:6px 6px;">电脑/手机App + 聊天App</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">「龙虾」环境</td><td style="padding:6px 6px;">💻 与用户共享电脑</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">「龙虾」性能</td><td style="padding:6px 6px;">使用您的电脑性能</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;background:#fdfcfb;"><td style="padding:6px 6px;color:#999;">OpenClaw</td><td style="padding:6px 6px;">✅ 完全兼容</td></tr>
            <tr style="border-bottom:1px solid #f0ece8;"><td style="padding:6px 6px;color:#999;">操作系统</td><td style="padding:6px 6px;">共享您的电脑系统</td></tr>
            <tr><td style="padding:6px 6px;color:#999;">计费方式</td><td style="padding:6px 6px;">订阅制 + 附加购买积分</td></tr>
          </table>
        </div>
        <p style="font-size:12px;color:#999;line-height:1.7;margin:10px 0 0;padding:10px 12px;background:#f9f6f2;border-radius:8px;">⚠️ 账号、充值记录、数据在三个版本之间相互独立，不能共享或转移，请按需选择。</p>
      </div>
    </div>

    <button onclick="document.getElementById('version-diff-modal').style.display='none'" style="margin-top:14px;width:100%;padding:10px;border:none;border-radius:8px;background:#f0ece8;color:#333;font-size:14px;cursor:pointer;font-weight:500;flex-shrink:0;">我知道了</button>
  </div>
</div>
<style>
  @media (min-width: 600px) {
    .vdiff-pc { display: block !important; }
    .vdiff-mobile { display: none !important; }
  }
  @media (max-width: 599px) {
    .vdiff-pc { display: none !important; }
    .vdiff-mobile { display: flex !important; }
  }
</style>
<script>
function switchVersionTab(idx) {
  for (var i = 0; i < 3; i++) {
    var tab = document.getElementById('vtab-' + i);
    var content = document.getElementById('vcontent-' + i);
    if (i === idx) {
      tab.style.background = 'var(--accent, #c44a1e)';
      tab.style.color = '#fff';
      tab.style.borderColor = 'var(--accent, #c44a1e)';
      content.style.display = '';
    } else {
      tab.style.background = '#f9f6f2';
      tab.style.color = '#555';
      tab.style.borderColor = '#e0dbd5';
      content.style.display = 'none';
    }
  }
}
</script>


<!-- 版本运营主体弹窗 -->
<div id="version-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
  <div style="background:#fff;border-radius:16px;padding:32px 28px;max-width:420px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,0.18);position:relative;">
    <h3 style="margin:0 0 18px;font-size:17px;color:#1a1a1a;">各版本运营主体</h3>
    <p style="font-size:13px;color:#666;line-height:1.7;margin:0 0 18px;padding:12px;background:#f9f6f2;border-radius:8px;">请仔细阅读目标网站的用户使用条款、隐私协议、充值协议等内容，因不同运营主体或地区法律法规的要求，相关条款可能有所不同。<strong>您在这些不同版本之间的账号、充值、权益、数据无法共享，敬请留意。</strong></p>
    <div style="display:flex;flex-direction:column;gap:14px;font-size:14px;color:#333;line-height:1.7;">
      <div>
        <strong>☁️ EasyClaw.work 企业版</strong><br>
        <span style="color:#666;">由 Dream Ahead Pte. Ltd. 运营</span>
      </div>
      <div>
        <strong>🇨🇳 EasyClaw.cn（国内）个人版</strong><br>
        <span style="color:#666;">由 北京灵豹智能科技有限公司 运营</span>
      </div>
      <div>
        <strong>🌍 EasyClaw.com（海外）个人版</strong><br>
        <span style="color:#666;">由 DocuAgile Pte. Ltd. 运营</span>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:24px;">
      <button onclick="document.getElementById('version-modal').style.display='none';document.getElementById('version-diff-modal').style.display='flex'" style="flex:1;padding:10px;border:1px solid #e0dbd5;border-radius:8px;background:#fff;color:var(--accent,#c44a1e);font-size:14px;cursor:pointer;font-weight:500;">📊 了解版本区别</button>
      <button onclick="document.getElementById('version-modal').style.display='none'" style="flex:1;padding:10px;border:none;border-radius:8px;background:#f0ece8;color:#333;font-size:14px;cursor:pointer;font-weight:500;">我知道了</button>
    </div>
  </div>
</div>


    <!-- 生态工具分区 -->
    <div class="eco-section" style="max-width:900px;margin:0 auto;padding:0 16px;margin-top:48px;">
      <div class="eco-divider">
        <span class="eco-label" data-zh="配套生态工具" data-en="Ecosystem Tools">配套生态工具</span>
      </div>
      <div class="eco-cards">


        <a href="https://clawpost.me" target="_blank" class="eco-card" style="text-decoration:none;">
          <div class="eco-icon"><img src="/assets/mail-logo.svg" alt="ClawPost" style="width:28px;height:28px;"></div>
          <div class="eco-info">
            <div class="eco-domain">clawpost.me</div>
            <div class="eco-title">ClawPost</div>
            <div class="eco-desc" data-zh="龙虾的专属邮局 — Bot 通信协议标准" data-en="Email server for AI agents — Bot communication standard">龙虾的专属邮局 — Bot 通信协议标准</div>
          </div>
        </a>

        <a href="https://claw123.ai" target="_blank" class="eco-card" style="text-decoration:none;">
          <div class="eco-icon"><img src="/assets/easyclaw-logo.svg" alt="Claw123" style="width:28px;height:28px;"></div>
          <div class="eco-info">
            <div class="eco-domain">claw123.ai</div>
            <div class="eco-title">Claw123</div>
            <div class="eco-desc" data-zh="3000+ 精选 AI 技能，一键复制安装" data-en="3000+ curated AI skills, one-click install">3000+ 精选 AI 技能，一键复制安装</div>
          </div>
        </a>

        <a href="https://easyclaw.link/" target="_blank" class="eco-card" style="text-decoration:none;">
          <div class="eco-icon"><img src="/assets/easyclaw-link-logo.png" alt="EasyClaw Link" style="width:28px;height:28px;border-radius:6px;"></div>
          <div class="eco-info">
            <div class="eco-domain">easyclaw.link</div>
            <div class="eco-title">EasyClaw Link</div>
            <div class="eco-desc" data-zh="龙虾医生 · 智能问诊，随时在线" data-en="AI Doctor — smart consultation, always online">龙虾医生 · 智能问诊，随时在线</div>
          </div>
        </a>

        <a href="https://deepvcode.com" target="_blank" class="eco-card" style="text-decoration:none;">
          <div class="eco-icon"><img src="/assets/dvcode-deepvlab-logo.png" alt="DeepV Code" style="width:28px;height:28px;border-radius:6px;"></div>
          <div class="eco-info">
            <div class="eco-domain">deepvcode.com</div>
            <div class="eco-title">DeepV Code</div>
            <div class="eco-desc" data-zh="AI 生图 · 代码生成，极速出品" data-en="AI image & code generation — blazing fast">AI 生图 · 代码生成，极速出品</div>
          </div>
        </a>

      </div>
    </div>



  </div><!-- /.container -->

  <footer>
    <p><span data-zh="">Made with 🐱 by <a href="https://easyclaw.link/zh/doctor" target="_blank" style="color:var(--lobster-3);text-decoration:none;">团团猫Bot</a> @ EasyClaw · 2026</span><span data-en="" style="display:none;">Made with 🐱 by <a href="https://easyclaw.link/zh/doctor" target="_blank" style="color:var(--lobster-3);text-decoration:none;">Tuantuan Bot</a> @ EasyClaw · 2026</span></p>
  </footer>

  <script>
    // 粒子效果
    const container = document.getElementById('particles');
    const colors = ['#ff4500','#ff6b35','#ff8c42','#c44a1e','#ff7043'];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${Math.random()*15+10}s;animation-delay:${Math.random()*10}s;`;
      container.appendChild(p);
    }

    // 主题切换
    const themeToggle = document.getElementById('themeToggle');
    const moonIcon = document.getElementById('icon-moon');
    const sunIcon = document.getElementById('icon-sun');
    let isDark = !window.matchMedia('(prefers-color-scheme: light)').matches;
    function setTheme(dark) {
      isDark = dark;
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      moonIcon.style.display = dark ? '' : 'none';
      sunIcon.style.display = dark ? 'none' : '';
    }
    themeToggle.addEventListener('click', () => setTheme(!isDark));

    // 语言切换
    let isEn = false;
    function applyLang() {
      document.querySelectorAll('[data-zh]').forEach(el => {
        const isSpan = el.tagName === 'SPAN';
        const zhVal = el.getAttribute('data-zh');
        const enVal = el.getAttribute('data-en');
        if (isSpan) {
          // data-zh="" / data-en="" 空属性 → show/hide 切换
          if (zhVal === '' || enVal === '') {
            el.style.display = isEn ? 'none' : '';
          }
          // data-zh="文字" → 替换内容
          else {
            if (isEn && enVal) el.innerHTML = enVal;
            else if (!isEn && zhVal) el.innerHTML = zhVal;
          }
        } else {
          // 非SPAN：只有在切换语言时才替换 innerHTML，不替换原始中文
          if (isEn && enVal) el.innerHTML = enVal;
          else if (!isEn && zhVal) el.innerHTML = zhVal;
        }
      });
      document.querySelectorAll('[data-en]').forEach(el => {
        if (el.tagName === 'SPAN') {
          const enVal = el.getAttribute('data-en');
          if (enVal === '') el.style.display = isEn ? '' : 'none';
        }
      });
      // hero title & sub
      const titles = {
        zh: { title: '选择你的 <span class="gradient">AI 龙虾</span>，开启智能新时代', sub: '全系列 AI 产品，企业版 · 个人版，一站覆盖' },
        en: { title: 'Your <span class="gradient">AI Agent</span>, Reimagined', sub: 'Full product lineup — Enterprise · Personal, all in one place' }
      };
      const t = isEn ? titles.en : titles.zh;
      const ht = document.getElementById('hero-title');
      const hs = document.getElementById('hero-sub');
      if (ht) ht.innerHTML = t.title;
      if (hs) hs.textContent = t.sub;
      // lang-zh-only
      document.querySelectorAll('.lang-zh-only').forEach(el => { el.style.display = isEn ? 'none' : ''; });
      // card-cn 在英文模式隐藏
      document.querySelectorAll('.card-cn').forEach(el => { el.style.display = isEn ? 'none' : ''; });
      document.getElementById('langToggle').textContent = isEn ? '中' : 'EN';
      document.body.className = isEn ? 'lang-en' : '';
    }
    function toggleLang() { isEn = !isEn; applyLang(); }
    applyLang();
  </script>

  <!-- 企业版QR弹窗 -->
  <div id="qr-modal-enterprise" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center;" onclick="this.style.display='none'">
    <div style="background:#fff;border-radius:16px;padding:28px 24px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.2);">
      <img src="/assets/qr-enterprise.png" style="width:180px;height:180px;border-radius:8px;display:block;margin:0 auto 12px;">
      <div style="font-size:14px;color:#333;font-weight:600;">企业版交流群</div>
      <div style="font-size:12px;color:#999;margin-top:4px;">点击任意处关闭</div>
    </div>
  </div>

  <!-- 个人版QR弹窗 -->
  <div id="qr-modal-personal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center;" onclick="this.style.display='none'">
    <div style="background:#fff;border-radius:16px;padding:28px 24px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.2);">
      <img src="/assets/qr-personal-new.png" style="width:180px;height:180px;border-radius:8px;display:block;margin:0 auto 12px;">
      <div style="font-size:14px;color:#333;font-weight:600;">个人版交流群</div>
      <div style="font-size:12px;color:#999;margin-top:4px;">点击任意处关闭</div>
    </div>
  </div>

</body>
</html>
