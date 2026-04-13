# Changelog

All notable changes to this project will be documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- HTTP transport option
- Cloudflare Workers support (Bot API mode)

---

## [2.0.0] — 2026-04-14

### Added
- `telegram_search_messages` — search messages by keyword in any chat (MTProto only)
- `telegram_get_chat_info` — get metadata of a chat/group/channel (id, title, username, type, members, description)

### Changed
- Total tools: 5 → 7
- Bumped version to 2.0.0

---

## [1.1.0] — 2026-04-14

### Added
- `TELEGRAM_SESSION` env var — session string via env, no file dependency (Docker-friendly)
- `Dockerfile` — multi-stage Alpine image (`oven/bun:1-alpine`)
- `.env.example` — template for all env vars
- `bin/telegram-mcp.js` — `npx telegram-mcp` support
- npm publish setup (`bin`, `files`, `keywords`, `repository` in package.json)

### Changed
- Session loading logic consolidated in `config.ts` (removed duplication from `index.ts`)
- Session priority: `TELEGRAM_SESSION` env → `~/.config/telegram-mcp/session.txt` → empty
- Removed unused `hono` dependency
- Bumped version to 1.1.0

---

## [1.0.0] — 2026-04-14

### Added
- Initial release
- 5 MCP tools via MTProto (GramJS):
  - `telegram_get_messages` — read message history from any chat or forum topic
  - `telegram_send_message` — send Markdown/HTML messages
  - `telegram_send_document` — send files
  - `telegram_get_dialogs` — list all chats, groups, channels
  - `telegram_get_topics` — list forum topics in a supergroup
- One-time authentication script (`bun run auth`)
- Zod validation for all tool inputs
- stdio MCP transport
- GitHub Pages landing page (https://sandikodev.github.io/telegram-mcp)
- ROADMAP.md, CONTRIBUTING.md, DISTRIBUTION.md
- Multilingual documentation structure (id, zh, ja, ar)
- SECURITY.md, CODE_OF_CONDUCT.md, CHANGELOG.md
