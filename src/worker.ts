/**
 * Cloudflare Workers entry point — Bot API mode only (no native modules)
 *
 * Deploy: wrangler deploy
 * MCP endpoint: POST /mcp
 *
 * Required env vars (set via wrangler secret):
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_CHAT_ID  (optional)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BotApiClient } from "./botapi.js";

// ---------------------------------------------------------------------------
// Schemas (Bot API tools only)
// ---------------------------------------------------------------------------

const GetMessagesSchema = z.object({
  chat_id: z.union([z.string(), z.number()]),
  limit:   z.number().min(1).max(100).default(20),
});

const SendMessageSchema = z.object({
  chat_id:    z.union([z.string(), z.number()]),
  topic_id:   z.number().optional(),
  text:       z.string().min(1).max(4096),
  parse_mode: z.enum(["markdown", "html"]).optional().default("markdown"),
});

const SendDocumentSchema = z.object({
  chat_id:   z.union([z.string(), z.number()]),
  topic_id:  z.number().optional(),
  file_path: z.string(),
  caption:   z.string().optional(),
});

// ---------------------------------------------------------------------------
// Build MCP server (stateless — new instance per request)
// ---------------------------------------------------------------------------

function buildServer(bot: BotApiClient): Server {
  const server = new Server(
    { name: "telegram-mcp", version: "2.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "telegram_get_messages",
        description: "Get recent Telegram updates (Bot API mode)",
        inputSchema: {
          type: "object",
          properties: {
            chat_id: { type: ["string", "number"] },
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
      {
        name: "telegram_send_document",
        description: "Send a file to a Telegram chat or forum topic",
        inputSchema: {
          type: "object",
          properties: {
            chat_id:   { type: ["string", "number"] },
            topic_id:  { type: "number" },
            file_path: { type: "string" },
            caption:   { type: "string" },
          },
          required: ["chat_id", "file_path"],
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
          const result = await bot.getUpdates(limit);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        case "telegram_send_message": {
          const { chat_id, topic_id, text, parse_mode } = SendMessageSchema.parse(args);
          const result = await bot.sendMessage(chat_id, text, topic_id, parse_mode);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        case "telegram_send_document": {
          const { chat_id, topic_id, file_path, caption } = SendDocumentSchema.parse(args);
          const result = await bot.sendDocument(chat_id, file_path, caption, topic_id);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
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
// Cloudflare Workers fetch handler
// ---------------------------------------------------------------------------

const handler = {
  async fetch(request: Request, env: { TELEGRAM_BOT_TOKEN: string; TELEGRAM_API_BASE?: string }): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== "/mcp") {
      return new Response("telegram-mcp worker — POST /mcp", { status: 200 });
    }

    if (!env.TELEGRAM_BOT_TOKEN) {
      return new Response("TELEGRAM_BOT_TOKEN not configured", { status: 500 });
    }

    // Stateless: new transport + server per request (CF Workers has no persistent state)
    const bot = new BotApiClient(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_API_BASE);
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const server = buildServer(bot);

    await server.connect(transport);
    return transport.handleRequest(request);
  },
};

export default handler;

// Local dev / Docker test: serve via Bun.serve
if (typeof Bun !== "undefined" && process.env.TELEGRAM_BOT_TOKEN) {
  const port = parseInt(process.env.PORT ?? "8787");
  const env = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
    TELEGRAM_API_BASE: process.env.TELEGRAM_API_BASE,
  };
  Bun.serve({
    port,
    fetch: (req) => handler.fetch(req, env),
  });
  console.error(`[telegram-mcp worker] Listening on :${port}`);
}
