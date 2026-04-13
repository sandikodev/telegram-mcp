# Contributing

## Setup

```bash
git clone https://github.com/sandikodev/telegram-mcp.git
cd telegram-mcp
bun install
bun run auth   # one-time login
bun run dev    # start with hot reload
```

## Adding a New Tool

1. Add the Zod schema in `src/index.ts`
2. Add the tool definition in `ListToolsRequestSchema` handler
3. Add the case in `CallToolRequestSchema` handler
4. Update README tool table

## Conventions

- TypeScript strict mode
- Zod for all input validation — never trust raw `args`
- All GramJS calls inside try/catch — return `isError: true` on failure
- Tool names: `telegram_<verb>_<noun>`

## PR Process

1. Fork → branch from `main`
2. Make changes
3. Submit PR with description of what and why
