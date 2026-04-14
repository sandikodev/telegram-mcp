/**
 * Cloudflare Workers entry point — Bot API mode, HTTP transport
 *
 * Deploy: wrangler deploy
 * MCP endpoint: POST /mcp
 *
 * Tools available (Bot API, edge-compatible):
 *   telegram_get_messages, telegram_send_message
 *
 * Note: telegram_send_document is not available on edge (no filesystem access)
 *
 * Required secret: wrangler secret put TELEGRAM_BOT_TOKEN
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { BotApiClient } from "./botapi.js";
import { GetMessagesSchema, SendMessageSchema } from "./schemas.js";

function buildServer(bot: BotApiClient): Server {
  const server = new Server(
    { name: "telegram-mcp", version: "2.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "telegram_get_messages",
        description: "Get recent incoming updates (Bot API — not full history)",
        inputSchema: {
          type: "object",
          properties: {
            chat_id: { type: ["string", "number"], description: "Chat ID or @username" },
            limit:   { type: "number", description: "1-100, default 20" },
          },
          required: ["chat_id"],
        },
      },
      {
        name: "telegram_send_message",
        description: "Send a message to a Telegram chat or forum topic",
        inputSchema: {
          type: "object",
          properties: {
            chat_id:    { type: ["string", "number"] },
            topic_id:   { type: "number" },
            text:       { type: "string" },
            parse_mode: { type: "string", enum: ["markdown", "html"] },
          },
          required: ["chat_id", "text"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    try {
      switch (name) {
        case "telegram_get_messages": {
          const { limit } = GetMessagesSchema.parse(args);
          return { content: [{ type: "text", text: JSON.stringify(await bot.getUpdates(limit), null, 2) }] };
        }
        case "telegram_send_message": {
          const { chat_id, topic_id, text, parse_mode } = SendMessageSchema.parse(args);
          return { content: [{ type: "text", text: JSON.stringify(await bot.sendMessage(chat_id, text, topic_id, parse_mode), null, 2) }] };
        }
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  });

  return server;
}

// ---------------------------------------------------------------------------
// CF Workers export
// ---------------------------------------------------------------------------

const workerHandler = {
  async fetch(request: Request, env: { TELEGRAM_BOT_TOKEN: string; TELEGRAM_API_BASE?: string }): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname !== "/mcp") {
      return new Response("telegram-mcp worker — POST /mcp", { status: 200 });
    }
    if (!env.TELEGRAM_BOT_TOKEN) {
      return new Response("TELEGRAM_BOT_TOKEN not configured", { status: 500 });
    }

    const bot = new BotApiClient(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_API_BASE);
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await buildServer(bot).connect(transport);
    return transport.handleRequest(request);
  },
};

export default workerHandler;

// Local dev / Docker test
if (typeof Bun !== "undefined" && process.env.TELEGRAM_BOT_TOKEN) {
  const port = parseInt(process.env.PORT ?? "8787");
  const _env = { TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!, TELEGRAM_API_BASE: process.env.TELEGRAM_API_BASE };
  Bun.serve({ port, fetch: (req) => workerHandler.fetch(req, _env) });
  console.error(`[telegram-mcp worker] Listening on :${port}`);
}
