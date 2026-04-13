# telegram-mcp

> The last Telegram MCP server you'll ever need.  
> Simple enough for a weekend project. Powerful enough for production at scale.

[![CI](https://github.com/sandikodev/telegram-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/sandikodev/telegram-mcp/actions)
[![Bun](https://img.shields.io/badge/Bun-%3E%3D1.0-black?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-compatible-green)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

**Read this in other languages:**
[Bahasa Indonesia](docs/id/README.md) · [中文](docs/zh/README.md) · [日本語](docs/ja/README.md) · [العربية](docs/ar/README.md)

---

## The Problem

Every existing Telegram MCP server has the same limitations:

| | Python repos | Go repos | This project |
|--|--|--|--|
| Read full message history | ✅ | ✅ | ✅ |
| Forum topic support | ⚠️ | ⚠️ | ✅ |
| Env-based config | ❌ | ❌ | ✅ *(v1.1)* |
| Docker / edge-ready | ❌ | ❌ | ✅ *(v2)* |
| Native Bun/TypeScript | ❌ | ❌ | ✅ |
| Bot API mode (zero deps) | ❌ | ❌ | ✅ *(v2)* |
| Single binary / `npx` | ❌ | ❌ | ✅ *(v2)* |

**telegram-mcp** is built on Bun — the only runtime that is simultaneously fast enough for edge, native enough for TypeScript, and simple enough for a one-liner setup.

---

## What Can You Build With This?

```
AI agent + telegram-mcp + [any other MCP server]
```

**Operations & DevOps**
> *"Alert me on Telegram when CPU > 90% and include the last 10 error logs"*

**Finance & Trading** *(coming in v2 with edge deployment)*
> *"Watch BTC/USDT every 30 seconds and send a signal to the Trading group when RSI < 30"*

**Education & Library** *(our own use case)*
> *"Generate a weekly overdue report and send it to the Librarian group, topic Data Reports"*

**Business & E-commerce**
> *"Notify the Sales group every time a new order comes in with order details"*

**The pattern is always the same:** connect telegram-mcp to any data source MCP, and your AI agent becomes a real-time Telegram operator.

---

## Tools

| Tool | Description | Mode |
|------|-------------|------|
| `telegram_get_messages` | Read message history from any chat or forum topic | MTProto |
| `telegram_send_message` | Send Markdown/HTML messages to any chat or topic | Both |
| `telegram_send_document` | Send files to any chat or topic | Both |
| `telegram_get_dialogs` | List all chats, groups, and channels | MTProto |
| `telegram_get_topics` | List forum topics in a supergroup | MTProto |

> **v2 roadmap:** Bot API mode (zero deps, edge-ready), env-based config, Docker image, `npx` support.  
> See [ROADMAP.md](ROADMAP.md) for the full vision.

---

## Requirements

| Component | Minimum |
|-----------|---------|
| [Bun](https://bun.sh) | 1.0 |
| Telegram account | — |
| `api_id` + `api_hash` | from [my.telegram.org](https://my.telegram.org) |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/sandikodev/telegram-mcp.git
cd telegram-mcp
bun install
```

### 2. Authenticate (one-time)

```bash
bun run auth
```

You will be prompted for your `api_id`, `api_hash`, phone number, and OTP code.  
The session string is saved to `~/.config/telegram-mcp/session.txt`.

### 3. Configure your MCP client

**Kiro CLI** (`~/.kiro/settings/mcp.json`):
```json
{
  "mcpServers": {
    "telegram": {
      "command": "/path/to/.bun/bin/bun",
      "args": ["run", "/path/to/telegram-mcp/src/index.ts"]
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "telegram": {
      "command": "bun",
      "args": ["run", "/path/to/telegram-mcp/src/index.ts"]
    }
  }
}
```

**Cursor / Windsurf / any MCP client:** same pattern — `command: bun`, `args: ["run", "src/index.ts"]`.

---

## Usage Examples

Once connected to your MCP client:

- *"Read the last 20 messages from my team group"*
- *"Send a daily report to the Operations channel, topic Monitoring"*
- *"List all my Telegram groups and their IDs"*
- *"What topics are available in the Library group?"*
- *"Send this CSV file to the Data Reports topic"*

---

## Why Bun?

- **~10ms startup** — critical for MCP stdio transport
- **Native TypeScript** — no build step, no transpilation
- **Web APIs built-in** — `fetch`, `WebSocket`, `crypto` — edge-compatible
- **Single binary** — `bun build --compile` → zero-dependency executable *(v2)*
- **One language** — same code runs locally, in Docker, and on edge

---

## Security

- Session string stored locally at `~/.config/telegram-mcp/session.txt`
- **Never commit** your session file or `api_hash`
- `.gitignore` excludes session files by default
- Consider using a dedicated Telegram account for automation
- See [SECURITY.md](SECURITY.md) for the full security policy

---

## Documentation

| Document | Description |
|----------|-------------|
| [ROADMAP.md](ROADMAP.md) | Vision, v2 plans, use cases, design principles |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute — setup, conventions, adding tools, translations |
| [DISTRIBUTION.md](DISTRIBUTION.md) | How to list your MCP server on awesome lists |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community standards |

---

## Contributing

All contributions are welcome — new tools, bug fixes, documentation, translations, Docker support, edge adapters.

See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.  
See [ROADMAP.md](ROADMAP.md) to understand where we're going.

> **Translators:** Add your language to `docs/<lang>/README.md` and open a PR.  
> Current translations: [id](docs/id/README.md) · [zh](docs/zh/README.md) · [ja](docs/ja/README.md) · [ar](docs/ar/README.md)

---

## License

MIT — see [LICENSE](LICENSE)
