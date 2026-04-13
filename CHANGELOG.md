# Changelog

All notable changes to this project will be documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Env-based config (`TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_SESSION`)
- Bot API mode (fetch-based, zero native deps, edge-ready)
- Dockerfile + Docker Hub publish
- npm publish (`npx telegram-mcp`)
- HTTP transport option

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
