# MCP Server Distribution Guide

Panduan untuk mendistribusikan MCP server ke berbagai platform agar ditemukan oleh komunitas.

---

## Status telegram-mcp

| Platform | Status | Link |
|----------|--------|------|
| GitHub Pages | ✅ Live | https://sandikodev.github.io/telegram-mcp |
| punkpeye/awesome-mcp-servers | ⏳ PR #4672 | https://github.com/punkpeye/awesome-mcp-servers/pull/4672 |
| modelcontextprotocol/servers | ⏳ PR #3939 | https://github.com/modelcontextprotocol/servers/pull/3939 |
| mcp.so | ❌ Manual | https://mcp.so/submit |
| npm registry | ❌ Belum | - |

---

## 1. Awesome Lists (PR ke GitHub)

### punkpeye/awesome-mcp-servers ⭐ Paling Populer
- **URL:** https://github.com/punkpeye/awesome-mcp-servers
- **Format entry:**
  ```
  - [user/repo](https://github.com/user/repo) 📇 🏠 🍎 🪟 🐧 - Deskripsi singkat.
  ```
- **Emoji flags:**
  - 📇 TypeScript, 🐍 Python, 🏎️ Go, 🦀 Rust
  - 🏠 Local, ☁️ Cloud
  - 🍎 macOS, 🪟 Windows, 🐧 Linux
- **Cara submit:** Fork → tambah entry alphabetical → PR
- **Review time:** 1-3 hari

### modelcontextprotocol/servers (Official)
- **URL:** https://github.com/modelcontextprotocol/servers
- **Section:** Community Servers (README.md baris ~1342)
- **Format entry:**
  ```
  - **[Nama](https://github.com/user/repo)** - Deskripsi.
  ```
- **Cara submit:** Fork → tambah entry alphabetical di section Community Servers → PR
- **Review time:** 3-7 hari (lebih ketat)

### appcypher/awesome-mcp-servers
- **URL:** https://github.com/appcypher/awesome-mcp-servers
- Format sama dengan punkpeye

---

## 2. Direktori Web

### mcp.so
- **URL:** https://mcp.so/submit
- Submit via form — isi nama, URL repo, deskripsi, kategori
- Gratis, langsung live setelah review

### Glama.ai MCP Directory
- **URL:** https://glama.ai/mcp/servers
- Submit via: https://glama.ai/mcp/servers/submit
- Setelah listed, dapat badge score yang bisa dipasang di README:
  ```markdown
  [![MCP Score](https://glama.ai/mcp/servers/user/repo/badges/score.svg)](https://glama.ai/mcp/servers/user/repo)
  ```

---

## 3. npm Registry (untuk server berbasis Node/Bun)

Publish sebagai package agar bisa diinstall via `npx`:

```bash
# package.json
{
  "name": "telegram-mcp",
  "bin": { "telegram-mcp": "./src/index.ts" },
  "publishConfig": { "access": "public" }
}

# Publish
npm publish
```

Setelah publish, user bisa pakai:
```json
{
  "mcpServers": {
    "telegram": {
      "command": "npx",
      "args": ["-y", "telegram-mcp"]
    }
  }
}
```

---

## 4. Komunitas & Social

### Reddit
- **r/ClaudeAI** — post "I built a Telegram MCP server"
- **r/LocalLLaMA** — fokus ke aspek teknis MTProto vs Bot API
- **r/artificial** — lebih general

### Discord
- **Anthropic Discord** — channel #mcp-servers atau #show-and-tell
- **Kiro Discord** (kalau ada)
- **AI Engineer Discord** — https://discord.gg/aie

### X/Twitter
Hashtag yang efektif: `#MCP #ClaudeAI #AIAgents #Telegram #BunJS`

Template post:
```
🚀 Built telegram-mcp — full Telegram access for AI agents via MTProto

Unlike Bot API, this lets your AI:
✅ Read full message history
✅ Access private groups
✅ Manage forum topics
✅ Send files

Built with Bun + GramJS + Zod

github.com/sandikodev/telegram-mcp

#MCP #ClaudeAI #AIAgents #Telegram
```

### Hacker News
- Post "Show HN: telegram-mcp — Full Telegram access for AI agents via MTProto"
- Timing terbaik: Selasa-Kamis pagi waktu US (malam WIB)
- URL: https://news.ycombinator.com/submit

---

## 5. GitHub Optimization

### Topics yang harus ada di repo
```
mcp, telegram, model-context-protocol, bun, typescript, gramjs,
ai-tools, ai-agent, mtproto, llm-tools
```

Set via:
```bash
gh api repos/sandikodev/telegram-mcp/topics \
  --method PUT \
  -f "names[]=mcp" \
  -f "names[]=telegram" \
  # ... dst
```

### README badges yang menarik perhatian
```markdown
[![Stars](https://img.shields.io/github/stars/sandikodev/telegram-mcp?style=social)](...)
[![MCP Score](https://glama.ai/mcp/servers/sandikodev/telegram-mcp/badges/score.svg)](...)
```

---

## 6. Checklist Sebelum Submit

- [ ] README lengkap dengan setup guide
- [ ] GitHub Pages / landing page
- [ ] License file (MIT)
- [ ] CONTRIBUTING.md
- [ ] Topics/tags di-set
- [ ] Deskripsi repo diisi
- [ ] Homepage URL diisi di repo settings
