# Contributing to telegram-mcp

Thank you for your interest in contributing! This document explains how to get started, what we're looking for, and how to submit your work.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Adding a New Tool](#adding-a-new-tool)
- [Coding Conventions](#coding-conventions)
- [Testing](#testing)
- [Submitting a PR](#submitting-a-pr)
- [Translating Documentation](#translating-documentation)
- [Reporting Bugs](#reporting-bugs)

---

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating.

---

## Ways to Contribute

- 🐛 **Bug fixes** — fix issues in existing tools
- ✨ **New tools** — add new Telegram capabilities
- 📖 **Documentation** — improve or translate docs
- 🧪 **Tests** — add test coverage
- 🐳 **Infrastructure** — Docker, CI/CD improvements
- 💡 **Ideas** — open an issue to discuss

---

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Telegram account with `api_id` and `api_hash` from [my.telegram.org](https://my.telegram.org)

### Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/telegram-mcp.git
cd telegram-mcp

# 2. Install dependencies
bun install

# 3. Authenticate (one-time)
bun run auth

# 4. Start with hot reload
bun run dev

# 5. Type check
bun run --check src/index.ts
```

---

## Project Structure

```
telegram-mcp/
├── src/
│   ├── schemas.ts      ← Zod schemas + shared types (single source of truth)
│   ├── config.ts       ← env detection, mode selection, session loading
│   ├── botapi.ts       ← Bot API client (pure fetch, edge-compatible)
│   ├── index.ts        ← stdio MCP server (MTProto + Bot API, 7 tools)
│   ├── worker.ts       ← HTTP MCP server for Cloudflare Workers (Bot API, 2 tools)
│   └── auth.ts         ← one-time MTProto authentication script
├── tests/
│   ├── config.test.ts      ← unit tests: config/mode detection
│   ├── schemas.test.ts     ← unit tests: Zod validation
│   ├── botapi.test.ts      ← unit tests: BotApiClient
│   ├── runner.ts           ← integration test runner (stdio + HTTP)
│   └── mock-botapi/
│       └── index.ts        ← fake Telegram Bot API server (Hono)
├── bin/
│   └── telegram-mcp.js ← npx entry point
├── docs/               ← Translated documentation
│   ├── id/README.md    ← Bahasa Indonesia
│   ├── zh/README.md    ← 中文
│   ├── ja/README.md    ← 日本語
│   └── ar/README.md    ← العربية
├── .github/
│   ├── workflows/ci.yml            ← typecheck + lint
│   ├── ISSUE_TEMPLATE/             ← bug report, feature request
│   └── pull_request_template.md
├── Dockerfile
├── docker-compose.test.yml ← integration test environment
├── wrangler.toml           ← Cloudflare Workers config
├── .env.example
├── ARCHITECTURE.md     ← system diagrams and data flow
├── ROADMAP.md
├── CONTRIBUTING.md     ← this file
├── CHANGELOG.md
├── SECURITY.md
└── CODE_OF_CONDUCT.md
```

---

## Adding a New Tool

### 1. Define the Zod schema

In `src/schemas.ts`, add and export a schema:

```typescript
export const MyNewToolSchema = z.object({
  chat_id:  ChatId,
  my_param: z.string().describe("Description of this parameter"),
});
```

### 2. Register the tool in `ListToolsRequestSchema` handler

```typescript
{
  name: "telegram_my_new_tool",
  description: "What this tool does",
  inputSchema: {
    type: "object",
    properties: {
      chat_id: { type: ["string", "number"], description: "Chat ID or @username" },
      my_param: { type: "string", description: "Description" },
    },
    required: ["chat_id", "my_param"],
  },
},
```

### 3. Implement in `CallToolRequestSchema` handler

```typescript
case "telegram_my_new_tool": {
  const { chat_id, my_param } = MyNewToolSchema.parse(args);
  await client.connect();
  // ... implementation
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}
```

### 4. Update README.md tools table

Add a row to the Tools table in `README.md`.

### 5. Update CHANGELOG.md

Add an entry under `[Unreleased]`.

---

## Coding Conventions

- **TypeScript strict mode** — all parameters and return types must be typed
- **Zod for all inputs** — never trust raw `args` from MCP
- **Error handling** — all GramJS calls inside try/catch, return `isError: true` on failure
- **Tool naming** — `telegram_<verb>_<noun>` (e.g., `telegram_get_messages`)
- **No hardcoded credentials** — use environment variables or config files
- **Comments** — explain *why*, not *what*

---

## Testing

```bash
# Unit tests (fast, no network, runs on pre-commit)
bun test

# Integration tests (Docker required)
bun run test:integration

# Cleanup integration test containers
bun run test:integration:clean
```

Unit tests cover: config mode detection, Zod schema validation, BotApiClient HTTP calls and error handling.

Integration tests cover: full MCP tool flow via stdio, worker HTTP transport, mock Bot API server.

---

## Submitting a PR

1. **Fork** the repository
2. **Create a branch** from `main`: `git checkout -b feat/my-feature`
3. **Make your changes**
4. **Test manually** (see above)
5. **Update documentation** (README, CHANGELOG)
6. **Submit a PR** with a clear description

### PR Title Format

```
feat: add telegram_search_messages tool
fix: handle empty dialogs response
docs: add Japanese translation
chore: update dependencies
```

---

## Translating Documentation

We welcome translations! To add a new language:

1. Create a folder: `docs/<language-code>/` (e.g., `docs/fr/` for French)
2. Copy `README.md` to `docs/<language-code>/README.md`
3. Translate the content
4. Add a link in the main `README.md` under "Read this in other languages"
5. Submit a PR

**Current translations:**

| Language | File | Maintainer |
|----------|------|------------|
| Bahasa Indonesia | [docs/id/README.md](docs/id/README.md) | Sandikodev |
| 中文 | [docs/zh/README.md](docs/zh/README.md) | — |
| 日本語 | [docs/ja/README.md](docs/ja/README.md) | — |
| العربية | [docs/ar/README.md](docs/ar/README.md) | — |

---

## Reporting Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml).

Please include:
- Bun version (`bun --version`)
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages (if any)
