import { describe, it, expect } from "bun:test";
import {
  GetMessagesSchema, SendMessageSchema, SendDocumentSchema,
  SearchMessagesSchema, GetChatInfoSchema,
} from "../src/schemas";

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

  describe("SearchMessagesSchema", () => {
    it("accepts valid input", () => {
      expect(() => SearchMessagesSchema.parse({ chat_id: "x", query: "hello" })).not.toThrow();
    });
    it("rejects empty query", () => {
      expect(() => SearchMessagesSchema.parse({ chat_id: "x", query: "" })).toThrow();
    });
    it("defaults limit to 20", () => {
      expect(SearchMessagesSchema.parse({ chat_id: "x", query: "hi" }).limit).toBe(20);
    });
  });

  describe("GetChatInfoSchema", () => {
    it("accepts string chat_id", () => {
      expect(() => GetChatInfoSchema.parse({ chat_id: "@group" })).not.toThrow();
    });
    it("rejects missing chat_id", () => {
      expect(() => GetChatInfoSchema.parse({})).toThrow();
    });
  });
});
