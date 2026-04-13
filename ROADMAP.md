# Roadmap & Vision — telegram-mcp v2

**Status:** Brainstorming  
**Dibuat:** 14 April 2026  
**Author:** Sandikodev

---

## Problem Statement

Semua MCP server Telegram yang ada saat ini punya keterbatasan:

| Repo | Lang | Mode | Docker | Edge | Env Config |
|------|------|------|--------|------|------------|
| sparfenyuk/mcp-telegram | Python | MTProto | ❌ | ❌ | ❌ |
| chaindead/telegram-mcp | Go | MTProto | ❌ | ❌ | ❌ |
| chigwell/telegram-mcp | Python | MTProto | ❌ | ❌ | ❌ |
| DLHellMe/telegram-mcp-server | Python | Scraping | ❌ | ❌ | ❌ |
| qpd-v/mcp-communicator-telegram | Node | Bot API | ❌ | ❌ | ✅ |
| **sandikodev/telegram-mcp (v1)** | **Bun/TS** | **MTProto** | **❌** | **❌** | **❌** |

**Gap yang belum ada:** Satu server yang mendukung kedua mode, env-based config, Docker-ready, dan edge-compatible.

---

## Vision: telegram-mcp v2

> "The last Telegram MCP server you'll ever need — from local dev to production edge, zero friction."

### Dual Mode Architecture

```
TELEGRAM_API_ID + TELEGRAM_API_HASH  →  MTProto Mode (GramJS)
                                         Full access: history, private groups, topics
                                         Requires: one-time auth session

TELEGRAM_BOT_TOKEN                   →  Bot API Mode (native fetch)
                                         Simple: send/receive via bot
                                         Requires: bot token only, zero deps
                                         Edge-ready: no native modules
```

Auto-detect dari environment — user tidak perlu tahu mode mana yang aktif.

---

## Arsitektur v2

```
telegram-mcp/
├── src/
│   ├── index.ts              ← MCP server entry, stdio transport
│   ├── config.ts             ← env detection, mode selection, validation
│   ├── modes/
│   │   ├── mtproto.ts        ← GramJS client wrapper
│   │   └── botapi.ts         ← fetch-based Bot API, zero native deps
│   └── tools/
│       ├── messages.ts       ← get_messages, send_message
│       ├── documents.ts      ← send_document
│       ├── dialogs.ts        ← get_dialogs (MTProto only)
│       └── topics.ts         ← get_topics, send_to_topic (MTProto only)
├── Dockerfile                ← multi-stage, minimal image
├── docker-compose.yml        ← example orchestration
└── .env.example              ← template env vars
```

---

## Config Design

```typescript
// .env.example
# === MTProto Mode (full access) ===
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
TELEGRAM_SESSION=           # auto-generated after first auth

# === Bot API Mode (simple, edge-ready) ===
TELEGRAM_BOT_TOKEN=1234567890:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID=-1001234567890   # default chat (optional)

# === Common ===
TELEGRAM_MODE=auto            # auto | mtproto | botapi
LOG_LEVEL=info
```

---

## Tool Availability per Mode

| Tool | MTProto | Bot API |
|------|---------|---------|
| `telegram_get_messages` | ✅ Full history | ✅ Recent only |
| `telegram_send_message` | ✅ Any chat | ✅ Bot chats only |
| `telegram_send_document` | ✅ Any chat | ✅ Bot chats only |
| `telegram_get_dialogs` | ✅ All dialogs | ❌ Not available |
| `telegram_get_topics` | ✅ Full | ⚠️ Limited |
| `telegram_send_to_topic` | ✅ | ✅ |

---

## Deployment Targets

### Local (stdio)
```json
{
  "mcpServers": {
    "telegram": {
      "command": "bun",
      "args": ["run", "/path/to/telegram-mcp/src/index.ts"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "...",
        "TELEGRAM_CHAT_ID": "..."
      }
    }
  }
}
```

### Docker
```bash
docker run -e TELEGRAM_BOT_TOKEN=... sandikodev/telegram-mcp
```

### Docker Compose
```yaml
services:
  telegram-mcp:
    image: sandikodev/telegram-mcp
    environment:
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      TELEGRAM_CHAT_ID: ${TELEGRAM_CHAT_ID}
    restart: unless-stopped
```

### npx (zero install)
```json
{
  "mcpServers": {
    "telegram": {
      "command": "npx",
      "args": ["-y", "telegram-mcp"],
      "env": { "TELEGRAM_BOT_TOKEN": "..." }
    }
  }
}
```

### Edge (Cloudflare Workers / Deno Deploy)
- Bot API mode only (no native modules)
- HTTP transport instead of stdio
- Deploy via `wrangler deploy` atau `deno deploy`

---

## Competitive Advantage

1. **Zero friction setup** — Bot API mode: satu env var, langsung jalan
2. **Progressive enhancement** — mulai Bot API, upgrade ke MTProto kapan saja
3. **Native Bun** — fastest startup, TypeScript first, no build step
4. **Docker-first** — official image di Docker Hub
5. **Edge-ready** — Bot API mode jalan di Cloudflare Workers
6. **Orchestration-ready** — docker-compose, k8s, Railway, Fly.io
7. **Type-safe** — Zod validation semua tool inputs

---

## Roadmap

### v1.0 (Done ✅)
- MTProto mode via GramJS
- 5 tools: get_messages, send_message, send_document, get_dialogs, get_topics
- stdio transport
- GitHub Pages landing page

### v1.1 (Next)
- [ ] Env-based config (`TELEGRAM_API_ID`, `TELEGRAM_API_HASH`)
- [ ] Remove interactive auth — session via env var `TELEGRAM_SESSION`
- [ ] Dockerfile + Docker Hub publish
- [ ] `.env.example`

### v2.0 (Future)
- [ ] Bot API mode (fetch-based, zero deps)
- [ ] Auto mode detection
- [ ] HTTP transport option (untuk edge)
- [ ] npm publish (`npx telegram-mcp`)
- [ ] Cloudflare Workers support (Bot API mode)
- [ ] Tool availability matrix per mode

### v2.x (Community)
- [ ] Webhook support
- [ ] Message formatting helpers
- [ ] Rate limiting built-in
- [ ] Metrics/observability

---

## Why Bun over Node/Deno?

- **Startup time:** Bun ~10ms vs Node ~100ms — penting untuk MCP stdio
- **TypeScript native:** tidak perlu ts-node atau transpile
- **Built-in bundler:** bisa bundle ke single file untuk distribution
- **Deno compatibility:** Bun mendukung sebagian besar Deno APIs
- **Edge:** Bun bisa di-deploy ke edge via Cloudflare Workers (dengan adapter)

---

## Notes

- Bot API mode tidak butuh GramJS — pure `fetch()`, bisa jalan di Deno/CF Workers
- MTProto session bisa di-serialize ke string dan disimpan di env var
- Untuk orchestration, session string di-inject via `TELEGRAM_SESSION` env
- Tidak perlu interactive auth di production — session di-generate sekali di dev

---

## Inspirasi & Referensi

### chigwell/telegram-mcp
Repo yang paling lengkap fiturnya saat ini — tapi ditulis dalam Python.
Fitur yang menginspirasi:
- Paginated message reading
- Dialog management lengkap
- Read status tracking
- Structured message retrieval

Kelemahan: Python runtime, tidak edge-ready, tidak ada Docker support, tidak ada env-based config.

**Misi kita:** Bawa semua fitur itu ke Bun/TypeScript yang edge-ready.

---

## Visi Jangka Panjang — "The Universal Telegram MCP"

Bayangkan satu codebase yang bisa di-deploy di mana saja dan dipakai untuk apa saja:

### Use Cases yang Mungkin

**Financial & Trading**
```
AI agent + telegram-mcp + market data MCP
→ Watcher pasar modal/saham real-time
→ Alert forex/crypto non-stop di edge
→ Bot sinyal trading yang kirim ke grup Telegram
→ Portfolio tracker yang update setiap detik
```

**DevOps & Monitoring**
```
AI agent + telegram-mcp + server monitoring MCP
→ Alert insiden langsung ke grup ops
→ Auto-report deployment status
→ Log anomaly detection → Telegram notification
```

**Education & Library (use case kita sekarang)**
```
AI agent + telegram-mcp + SLiMS MCP
→ Laporan audit data perpustakaan otomatis
→ Notifikasi overdue ke grup pustakawan
→ Tiket tindak lanjut terstruktur
```

**E-commerce & Business**
```
AI agent + telegram-mcp + order management MCP
→ Notifikasi order real-time ke grup sales
→ Customer support via Telegram
→ Inventory alert otomatis
```

### Kenapa Ini Bisa Terjadi dengan Arsitektur Kita

```
Simple setup (Bot API mode):
  TELEGRAM_BOT_TOKEN=... → langsung jalan, zero config

Edge deployment (CF Workers):
  Bot API mode → pure fetch() → jalan di edge, latency <10ms

Full power (MTProto mode):
  TELEGRAM_API_ID + TELEGRAM_API_HASH → akses penuh, history, topics

Orchestration (Docker/k8s):
  docker run -e TELEGRAM_BOT_TOKEN=... sandikodev/telegram-mcp
  → scale horizontal, deploy di mana saja
```

### Prinsip Desain

> **"Simple by default, powerful when needed."**

- User biasa: satu env var, langsung jalan
- Developer: pilih mode, konfigurasi sesuai kebutuhan
- Enterprise: Docker, k8s, edge, semua tersedia
- Tidak ada yang dipaksa pakai fitur yang tidak mereka butuhkan

### Kenapa Bun/TypeScript adalah Pilihan Tepat

- **Satu bahasa** untuk semua target: local, Docker, edge, serverless
- **Startup <10ms** — kritis untuk MCP stdio dan edge functions
- **Native TypeScript** — tidak perlu build step, langsung run
- **Bun.serve()** — HTTP server built-in untuk HTTP transport
- **Web APIs** — `fetch`, `WebSocket`, `crypto` — semua ada, edge-compatible
- **Bundle ke single file** — `bun build --compile` → satu binary, zero deps

### Kontribusi yang Diharapkan dari Komunitas

Karena ini open source dan satu codebase:
- Tambah tool baru tanpa break existing tools
- Tambah mode baru (misal: Telegram Premium features)
- Tambah transport baru (HTTP, WebSocket, SSE)
- Integrasi dengan MCP server lain (composable)
- Adapter untuk platform baru (Deno, CF Workers, Bun edge)

---

## Penutup

Proyek ini bukan sekadar "another Telegram MCP server."

Ini adalah fondasi untuk ekosistem AI agent yang bisa berkomunikasi via Telegram — dari perpustakaan sekolah di Yogyakarta sampai trading desk di Wall Street, dari monitoring server sederhana sampai sistem alert finansial real-time di edge.

Semua dari satu codebase. Semua maintainable bersama. Semua dengan prinsip yang sama: **simple by default, powerful when needed.**
