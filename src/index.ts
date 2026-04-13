/**
 * Telegram MCP Server
 * Stack: Bun + GramJS (MTProto) + Zod + @modelcontextprotocol/sdk
 *
 * Modes:
 *   MTProto — set TELEGRAM_API_ID + TELEGRAM_API_HASH (full access)
 *   Bot API — set TELEGRAM_BOT_TOKEN (simple, edge-ready)
 *
 * Tools:
 *   telegram_get_messages   — read message history (MTProto) / recent updates (Bot API)
 *   telegram_send_message   — send message to chat/topic
 *   telegram_send_document  — send file to chat/topic
 *   telegram_get_dialogs    — list all chats/groups (MTProto only)
 *   telegram_get_topics     — list forum topics (MTProto only)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { BotApiClient } from "./botapi.js";

// ---------------------------------------------------------------------------
// Config & client init
// ---------------------------------------------------------------------------

const config = loadConfig();

let mtprotoClient: TelegramClient | null = null;
let botApiClient: BotApiClient | null = null;

if (config.mode === "botapi") {
  botApiClient = new BotApiClient(config.botToken!);
  console.error(`[telegram-mcp] Bot API mode`);
} else {
  mtprotoClient = new TelegramClient(
    new StringSession(config.session ?? ""),
    config.apiId!,
    config.apiHash!,
    { connectionRetries: 3 }
  );
  console.error(`[telegram-mcp] MTProto mode`);
}

// ---------------------------------------------------------------------------
// Tool schemas
// ---------------------------------------------------------------------------

const GetMessagesSchema = z.object({
  chat_id:  z.union([z.string(), z.number()]).describe("Chat ID or username"),
  topic_id: z.number().optional().describe("Forum topic/thread ID"),
  limit:    z.number().min(1).max(100).default(20),
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

const GetDialogsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
});

const GetTopicsSchema = z.object({
  chat_id: z.union([z.string(), z.number()]),
});

const SearchMessagesSchema = z.object({
  chat_id: z.union([z.string(), z.number()]),
  query:   z.string().min(1),
  limit:   z.number().min(1).max(100).default(20),
});

const GetChatInfoSchema = z.object({
  chat_id: z.union([z.string(), z.number()]),
});

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new Server(
  { name: "telegram-mcp", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "telegram_get_messages",
      description: config.mode === "botapi"
        ? "Get recent Telegram updates (Bot API mode — history not available)"
        : "Read message history from any Telegram chat or forum topic",
      inputSchema: {
        type: "object",
        properties: {
          chat_id:  { type: ["string","number"], description: "Chat ID or @username" },
          topic_id: { type: "number", description: "Forum topic ID (MTProto only)" },
          limit:    { type: "number", description: "Number of messages (1-100, default 20)" },
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
          chat_id:    { type: ["string","number"] },
          topic_id:   { type: "number" },
          text:       { type: "string" },
          parse_mode: { type: "string", enum: ["markdown","html"] },
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
          chat_id:   { type: ["string","number"] },
          topic_id:  { type: "number" },
          file_path: { type: "string", description: "Absolute path to file" },
          caption:   { type: "string" },
        },
        required: ["chat_id", "file_path"],
      },
    },
    {
      name: "telegram_get_dialogs",
      description: "List all Telegram chats, groups, and channels (MTProto only)",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of dialogs (default 20)" },
        },
      },
    },
    {
      name: "telegram_get_topics",
      description: "List forum topics in a supergroup (MTProto only)",
      inputSchema: {
        type: "object",
        properties: {
          chat_id: { type: ["string","number"] },
        },
        required: ["chat_id"],
      },
    },
    {
      name: "telegram_search_messages",
      description: "Search messages by keyword in a chat (MTProto only)",
      inputSchema: {
        type: "object",
        properties: {
          chat_id: { type: ["string","number"] },
          query:   { type: "string", description: "Search keyword" },
          limit:   { type: "number", description: "Number of results (1-100, default 20)" },
        },
        required: ["chat_id", "query"],
      },
    },
    {
      name: "telegram_get_chat_info",
      description: "Get metadata of a chat, group, or channel",
      inputSchema: {
        type: "object",
        properties: {
          chat_id: { type: ["string","number"] },
        },
        required: ["chat_id"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  try {
    // ── Bot API mode ──────────────────────────────────────────────────────
    if (config.mode === "botapi") {
      const bot = botApiClient!;

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
        case "telegram_get_dialogs":
        case "telegram_get_topics":
        case "telegram_search_messages":
        case "telegram_get_chat_info":
          return { content: [{ type: "text", text: `${name} is only available in MTProto mode. Set TELEGRAM_API_ID and TELEGRAM_API_HASH.` }], isError: true };
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    }

    // ── MTProto mode ──────────────────────────────────────────────────────
    const client = mtprotoClient!;
    await client.connect();

    switch (name) {
      case "telegram_get_messages": {
        const { chat_id, topic_id, limit } = GetMessagesSchema.parse(args);
        const messages = await client.getMessages(chat_id, {
          limit,
          ...(topic_id ? { replyTo: topic_id } : {}),
        });
        const result = messages.map((m) => ({
          id:        m.id,
          date:      new Date((m.date ?? 0) * 1000).toISOString(),
          from:      (m.sender as any)?.username ?? (m.sender as any)?.firstName ?? "unknown",
          text:      m.text ?? "",
          has_media: !!m.media,
        }));
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "telegram_send_message": {
        const { chat_id, topic_id, text, parse_mode } = SendMessageSchema.parse(args);
        const sent = await client.sendMessage(chat_id, {
          message: text,
          parseMode: parse_mode,
          ...(topic_id ? { replyTo: topic_id } : {}),
        });
        return { content: [{ type: "text", text: `Sent message id=${sent.id}` }] };
      }

      case "telegram_send_document": {
        const { chat_id, topic_id, file_path, caption } = SendDocumentSchema.parse(args);
        const sent = await client.sendFile(chat_id, {
          file: file_path,
          caption,
          ...(topic_id ? { replyTo: topic_id } : {}),
        });
        return { content: [{ type: "text", text: `Sent document id=${sent.id}` }] };
      }

      case "telegram_get_dialogs": {
        const { limit } = GetDialogsSchema.parse(args);
        const dialogs = await client.getDialogs({ limit });
        const result = dialogs.map((d) => ({
          id:     d.id?.toString(),
          name:   d.name,
          type:   d.isChannel ? "channel" : d.isGroup ? "group" : "private",
          unread: d.unreadCount,
        }));
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "telegram_get_topics": {
        const { chat_id } = GetTopicsSchema.parse(args);
        const { topics } = await (client as any).invoke({
          _: "channels.getForumTopics",
          channel: await client.getEntity(chat_id),
          offsetDate: 0, offsetId: 0, offsetTopic: 0, limit: 100,
        });
        const result = (topics as any[]).map((t) => ({
          id:     t.id,
          title:  t.title,
          closed: t.closed ?? false,
        }));
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "telegram_search_messages": {
        const { chat_id, query, limit } = SearchMessagesSchema.parse(args);
        const messages = await client.getMessages(chat_id, { search: query, limit });
        const result = messages.map((m) => ({
          id:        m.id,
          date:      new Date((m.date ?? 0) * 1000).toISOString(),
          from:      (m.sender as any)?.username ?? (m.sender as any)?.firstName ?? "unknown",
          text:      m.text ?? "",
          has_media: !!m.media,
        }));
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "telegram_get_chat_info": {
        const { chat_id } = GetChatInfoSchema.parse(args);
        const entity = await client.getEntity(chat_id) as any;
        const result = {
          id:          entity.id?.toString(),
          title:       entity.title ?? `${entity.firstName ?? ""} ${entity.lastName ?? ""}`.trim(),
          username:    entity.username ?? null,
          type:        entity.className,
          members:     entity.participantsCount ?? null,
          description: entity.about ?? null,
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err: any) {
    return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[telegram-mcp] Server running");
