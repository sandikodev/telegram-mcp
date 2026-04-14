/**
 * Telegram MCP Server — stdio transport
 * Modes: MTProto (full access) | Bot API (edge-ready)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { loadConfig } from "./config.js";
import { BotApiClient } from "./botapi.js";
import {
  GetMessagesSchema, SendMessageSchema, SendDocumentSchema,
  GetDialogsSchema, GetTopicsSchema, SearchMessagesSchema, GetChatInfoSchema,
} from "./schemas.js";

const config = loadConfig();

let mtprotoClient: TelegramClient | null = null;
let botApiClient: BotApiClient | null = null;

if (config.mode === "botapi") {
  botApiClient = new BotApiClient(config.botToken!);
  console.error("[telegram-mcp] Bot API mode");
} else {
  mtprotoClient = new TelegramClient(
    new StringSession(config.session ?? ""),
    config.apiId!,
    config.apiHash!,
    { connectionRetries: 3 }
  );
  console.error("[telegram-mcp] MTProto mode");
}

const MTPROTO_ONLY = "MTProto only — set TELEGRAM_API_ID and TELEGRAM_API_HASH.";

const server = new Server(
  { name: "telegram-mcp", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "telegram_get_messages",
      description: config.mode === "botapi"
        ? "Get recent incoming updates (Bot API — not full history, use MTProto for that)"
        : "Read message history from any Telegram chat or forum topic",
      inputSchema: {
        type: "object",
        properties: {
          chat_id:  { type: ["string", "number"], description: "Chat ID or @username" },
          topic_id: { type: "number", description: "Forum topic ID (MTProto only)" },
          limit:    { type: "number", description: "1-100, default 20" },
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
      description: "Send a local file to a Telegram chat or forum topic",
      inputSchema: {
        type: "object",
        properties: {
          chat_id:   { type: ["string", "number"] },
          topic_id:  { type: "number" },
          file_path: { type: "string", description: "Absolute path to file" },
          caption:   { type: "string" },
        },
        required: ["chat_id", "file_path"],
      },
    },
    {
      name: "telegram_get_dialogs",
      description: `List all Telegram chats, groups, and channels. ${MTPROTO_ONLY}`,
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "1-100, default 20" },
        },
      },
    },
    {
      name: "telegram_get_topics",
      description: `List forum topics in a supergroup. ${MTPROTO_ONLY}`,
      inputSchema: {
        type: "object",
        properties: {
          chat_id: { type: ["string", "number"] },
        },
        required: ["chat_id"],
      },
    },
    {
      name: "telegram_search_messages",
      description: `Search messages by keyword in a chat. ${MTPROTO_ONLY}`,
      inputSchema: {
        type: "object",
        properties: {
          chat_id: { type: ["string", "number"] },
          query:   { type: "string" },
          limit:   { type: "number", description: "1-100, default 20" },
        },
        required: ["chat_id", "query"],
      },
    },
    {
      name: "telegram_get_chat_info",
      description: `Get metadata of a chat, group, or channel (id, title, type, members). ${MTPROTO_ONLY}`,
      inputSchema: {
        type: "object",
        properties: {
          chat_id: { type: ["string", "number"] },
        },
        required: ["chat_id"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  const mtprotoOnly = () => ({
    content: [{ type: "text" as const, text: `${name}: ${MTPROTO_ONLY}` }],
    isError: true,
  });

  try {
    if (config.mode === "botapi") {
      const bot = botApiClient!;
      switch (name) {
        case "telegram_get_messages": {
          const { limit } = GetMessagesSchema.parse(args);
          return { content: [{ type: "text", text: JSON.stringify(await bot.getUpdates(limit), null, 2) }] };
        }
        case "telegram_send_message": {
          const { chat_id, topic_id, text, parse_mode } = SendMessageSchema.parse(args);
          return { content: [{ type: "text", text: JSON.stringify(await bot.sendMessage(chat_id, text, topic_id, parse_mode), null, 2) }] };
        }
        case "telegram_send_document": {
          const { chat_id, topic_id, file_path, caption } = SendDocumentSchema.parse(args);
          return { content: [{ type: "text", text: JSON.stringify(await bot.sendDocument(chat_id, file_path, caption, topic_id), null, 2) }] };
        }
        default: return mtprotoOnly();
      }
    }

    const client = mtprotoClient!;
    await client.connect();

    switch (name) {
      case "telegram_get_messages": {
        const { chat_id, topic_id, limit } = GetMessagesSchema.parse(args);
        const msgs = await client.getMessages(chat_id, { limit, ...(topic_id ? { replyTo: topic_id } : {}) });
        return { content: [{ type: "text", text: JSON.stringify(msgs.map(m => ({
          id:        m.id,
          date:      new Date((m.date ?? 0) * 1000).toISOString(),
          from:      (m.sender as any)?.username ?? (m.sender as any)?.firstName ?? "unknown",
          text:      m.text ?? "",
          has_media: !!m.media,
        })), null, 2) }] };
      }
      case "telegram_send_message": {
        const { chat_id, topic_id, text, parse_mode } = SendMessageSchema.parse(args);
        const sent = await client.sendMessage(chat_id, { message: text, parseMode: parse_mode, ...(topic_id ? { replyTo: topic_id } : {}) });
        return { content: [{ type: "text", text: `Sent message id=${sent.id}` }] };
      }
      case "telegram_send_document": {
        const { chat_id, topic_id, file_path, caption } = SendDocumentSchema.parse(args);
        const sent = await client.sendFile(chat_id, { file: file_path, caption, ...(topic_id ? { replyTo: topic_id } : {}) });
        return { content: [{ type: "text", text: `Sent document id=${sent.id}` }] };
      }
      case "telegram_get_dialogs": {
        const { limit } = GetDialogsSchema.parse(args);
        const dialogs = await client.getDialogs({ limit });
        return { content: [{ type: "text", text: JSON.stringify(dialogs.map(d => ({
          id:     d.id?.toString(),
          name:   d.name,
          type:   d.isChannel ? "channel" : d.isGroup ? "group" : "private",
          unread: d.unreadCount,
        })), null, 2) }] };
      }
      case "telegram_get_topics": {
        const { chat_id } = GetTopicsSchema.parse(args);
        const { topics } = await (client as any).invoke({
          _: "channels.getForumTopics",
          channel: await client.getEntity(chat_id),
          offsetDate: 0, offsetId: 0, offsetTopic: 0, limit: 100,
        });
        return { content: [{ type: "text", text: JSON.stringify((topics as any[]).map(t => ({
          id: t.id, title: t.title, closed: t.closed ?? false,
        })), null, 2) }] };
      }
      case "telegram_search_messages": {
        const { chat_id, query, limit } = SearchMessagesSchema.parse(args);
        const msgs = await client.getMessages(chat_id, { search: query, limit });
        return { content: [{ type: "text", text: JSON.stringify(msgs.map(m => ({
          id:        m.id,
          date:      new Date((m.date ?? 0) * 1000).toISOString(),
          from:      (m.sender as any)?.username ?? (m.sender as any)?.firstName ?? "unknown",
          text:      m.text ?? "",
          has_media: !!m.media,
        })), null, 2) }] };
      }
      case "telegram_get_chat_info": {
        const { chat_id } = GetChatInfoSchema.parse(args);
        const e = await client.getEntity(chat_id) as any;
        return { content: [{ type: "text", text: JSON.stringify({
          id:          e.id?.toString(),
          title:       e.title ?? `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim(),
          username:    e.username ?? null,
          type:        e.className,
          members:     e.participantsCount ?? null,
          description: e.about ?? null,
        }, null, 2) }] };
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
