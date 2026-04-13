# telegram-mcp

> A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for Telegram.  
> Read history, send messages, manage forum topics — powered by **Bun**, **GramJS** (MTProto), and **Zod**.

[![Tests](https://github.com/sandikodev/telegram-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/sandikodev/telegram-mcp/actions)
[![Bun](https://img.shields.io/badge/Bun-%3E%3D1.0-black?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-compatible-green)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

**Read this in other languages:**
[Bahasa Indonesia](docs/id/README.md) · [中文](docs/zh/README.md) · [日本語](docs/ja/README.md) · [العربية](docs/ar/README.md)

---

## Why telegram-mcp?

The Telegram Bot API is limited — it cannot read message history, access private groups retroactively, or manage forum topics fully. This server uses the **MTProto client API** (via GramJS) with your own Telegram account, giving AI agents complete access to your Telegram workspace.

## Tools

| Tool | Description | Mode |
|------|-------------|------|
| `telegram_get_messages` | Read message history from any chat or forum topic | MTProto |
| `telegram_send_message` | Send Markdown/HTML messages to any chat or topic | Both |
| `telegram_send_document` | Send files to any chat or topic | Both |
| `telegram_get_dialogs` | List all chats, groups, and channels | MTProto |
| `telegram_get_topics` | List forum topics in a supergroup | MTProto |

## Requirements

| Component | Minimum Version |
|-----------|----------------|
| [Bun](https://bun.sh) | 1.0 |
| Telegram account | — |
| `api_id` + `api_hash` | from [my.telegram.org](https://my.telegram.org) |

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

## Usage Examples

Once connected to your MCP client:

- *"Read the last 20 messages from my team group"*
- *"Send a daily report to the Operations channel, topic Monitoring"*
- *"List all my Telegram groups and their IDs"*
- *"What topics are available in the Library group?"*
- *"Send this CSV file to the Data Reports topic"*

## Security

- Session string stored locally at `~/.config/telegram-mcp/session.txt`
- **Never commit** your session file or `api_hash`
- `.gitignore` excludes session files by default
- Consider using a dedicated Telegram account for automation

## Documentation

| Document | Description |
|----------|-------------|
| [ROADMAP.md](ROADMAP.md) | Vision, v2 plans, use cases |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [DISTRIBUTION.md](DISTRIBUTION.md) | How to list your MCP server |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [SECURITY.md](SECURITY.md) | Security policy |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community standards |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions welcome — new tools, bug fixes, documentation, translations.

## License

MIT — see [LICENSE](LICENSE)
