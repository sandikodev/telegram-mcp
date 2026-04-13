import { describe, it, expect } from "bun:test";
import { z } from "zod";

// Mirror schemas from index.ts — kept in sync manually
// If these fail, update index.ts schemas accordingly

const GetMessagesSchema = z.object({
  chat_id: z.union([z.string(), z.number()]),
  topic_id: z.number().optional(),
  limit: z.number().min(1).max(100).default(20),
});

const SendMessageSchema = z.object({
  chat_id: z.union([z.string(), z.number()]),
  topic_id: z.number().optional(),
  text: z.string().min(1).max(4096),
  parse_mode: z.enum(["markdown", "html"]).optional().default("markdown"),
});

const SendDocumentSchema = z.object({
  chat_id: z.union([z.string(), z.number()]),
  topic_id: z.number().optional(),
  file_path: z.string(),
  caption: z.string().optional(),
});

describe("tool schemas", () => {
  describe("GetMessagesSchema", () => {
    it("accepts string chat_id", () => {
      expect(() => GetMessagesSchema.parse({ chat_id: "@mychat" })).not.toThrow();
    });
    it("accepts numeric chat_id", () => {
      expect(() => GetMessagesSchema.parse({ chat_id: -1001234567890 })).not.toThrow();
    });
    it("defaults limit to 20", () => {
      expect(GetMessagesSchema.parse({ chat_id: "x" }).limit).toBe(20);
    });
    it("rejects limit > 100", () => {
      expect(() => GetMessagesSchema.parse({ chat_id: "x", limit: 101 })).toThrow();
    });
    it("rejects missing chat_id", () => {
      expect(() => GetMessagesSchema.parse({})).toThrow();
    });
  });

  describe("SendMessageSchema", () => {
    it("accepts valid input", () => {
      expect(() => SendMessageSchema.parse({ chat_id: "x", text: "hello" })).not.toThrow();
    });
    it("rejects empty text", () => {
      expect(() => SendMessageSchema.parse({ chat_id: "x", text: "" })).toThrow();
    });
    it("rejects text > 4096 chars", () => {
      expect(() => SendMessageSchema.parse({ chat_id: "x", text: "a".repeat(4097) })).toThrow();
    });
    it("rejects invalid parse_mode", () => {
      expect(() => SendMessageSchema.parse({ chat_id: "x", text: "hi", parse_mode: "xml" })).toThrow();
    });
    it("defaults parse_mode to markdown", () => {
      expect(SendMessageSchema.parse({ chat_id: "x", text: "hi" }).parse_mode).toBe("markdown");
    });
    it("accepts optional topic_id", () => {
      expect(() => SendMessageSchema.parse({ chat_id: "x", text: "hi", topic_id: 5 })).not.toThrow();
    });
  });

  describe("SendDocumentSchema", () => {
    it("accepts valid input", () => {
      expect(() => SendDocumentSchema.parse({ chat_id: "x", file_path: "/tmp/file.csv" })).not.toThrow();
    });
    it("rejects missing file_path", () => {
      expect(() => SendDocumentSchema.parse({ chat_id: "x" })).toThrow();
    });
  });
});
