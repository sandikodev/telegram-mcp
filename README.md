# telegram-mcp

> A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for Telegram — read message history, send messages, manage forum topics, and more. Built with **Bun**, **GramJS** (MTProto), and **Zod**.

[![Bun](https://img.shields.io/badge/Bun-%3E%3D1.0-black?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-compatible-green)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

## Why?

The official Telegram Bot API is limited — it cannot read message history, list dialogs, or access forum topics retroactively. This MCP server uses the **MTProto client API** (via GramJS) with your own Telegram account, giving AI agents full access to your Telegram workspace.

## Tools

| Tool | Description |
|------|-------------|
| `telegram_get_messages` | Read message history from any chat or forum topic |
| `telegram_send_message` | Send a message to any chat or forum topic |
| `telegram_send_document` | Send a file to any chat or forum topic |
| `telegram_get_dialogs` | List all chats, groups, and channels |
| `telegram_get_topics` | List forum topics in a supergroup |

## Requirements

- [Bun](https://bun.sh) >= 1.0
- Telegram account
- `api_id` and `api_hash` from [my.telegram.org](https://my.telegram.org)

## Setup

### 1. Clone & install

```bash
git clone https://github.com/sandikodev/telegram-mcp.git
cd telegram-mcp
bun install
```

### 2. Authenticate

```bash
bun run auth
```

This will prompt for your `api_id`, `api_hash`, phone number, and OTP. The session is saved to `~/.config/telegram-mcp/session.txt`.

### 3. Add to your MCP client

**Kiro CLI** (`~/.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "telegram": {
      "command": "/path/to/.bun/bin/bun",
      "args": ["run", "/path/to/telegram-mcp/src/index.ts"],
      "env": {}
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

Once connected to your MCP client, you can ask:

- *"Read the last 20 messages from the SMAUII OPS Center group, topic Alert & Insiden"*
- *"Send a message to chat -1001234567890, topic 14: 'Server is back online'"*
- *"List all my Telegram groups"*
- *"What topics are available in the Pustakawan Digital group?"*

## Security

- Session string is stored locally at `~/.config/telegram-mcp/session.txt`
- Never commit your session file or `api_hash` to version control
- The `.gitignore` excludes session files by default
- Use a dedicated Telegram account for automation if possible

## Development

```bash
# Run with hot reload
bun run dev

# Type check
bun run --check src/index.ts
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
