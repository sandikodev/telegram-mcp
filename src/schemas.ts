import { z } from "zod";

const ChatId = z.union([z.string(), z.number()]);

export const GetMessagesSchema = z.object({
  chat_id:  ChatId.describe("Chat ID or @username"),
  topic_id: z.number().optional().describe("Forum topic/thread ID"),
  limit:    z.number().min(1).max(100).default(20),
});

export const SendMessageSchema = z.object({
  chat_id:    ChatId,
  topic_id:   z.number().optional(),
  text:       z.string().min(1).max(4096),
  parse_mode: z.enum(["markdown", "html"]).optional().default("markdown"),
});

export const SendDocumentSchema = z.object({
  chat_id:   ChatId,
  topic_id:  z.number().optional(),
  file_path: z.string(),
  caption:   z.string().optional(),
});

export const GetDialogsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
});

export const GetTopicsSchema = z.object({
  chat_id: ChatId,
});

export const SearchMessagesSchema = z.object({
  chat_id: ChatId,
  query:   z.string().min(1),
  limit:   z.number().min(1).max(100).default(20),
});

export const GetChatInfoSchema = z.object({
  chat_id: ChatId,
});
