import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock fetch globally before importing BotApiClient
const mockFetch = mock(async (url: string, opts?: RequestInit) => {
  const method = String(url).split("/").pop();
  const body = opts?.body ? JSON.parse(opts.body as string) : {};

  const responses: Record<string, unknown> = {
    sendMessage: { ok: true, result: { message_id: 1, text: body.text } },
    getUpdates: {
      ok: true, result: [{
        update_id: 1,
        message: { message_id: 42, date: 1713052800, from: { username: "u" }, text: "hi" },
      }],
    },
    getMe: { ok: true, result: { id: 1, username: "bot" } },
  };

  return {
    json: async () => responses[method ?? ""] ?? { ok: false, description: "unknown method" },
  } as Response;
});

globalThis.fetch = mockFetch as unknown as typeof fetch;

const { BotApiClient } = await import("../src/botapi");

describe("BotApiClient", () => {
  let client: InstanceType<typeof BotApiClient>;

  beforeEach(() => {
    mockFetch.mockClear();
    client = new BotApiClient("test:token");
  });

  it("sendMessage calls correct endpoint", async () => {
    await client.sendMessage("-100123", "hello");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("/sendMessage");
  });

  it("sendMessage passes chat_id and text", async () => {
    await client.sendMessage("-100123", "hello");
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string);
    expect(body.chat_id).toBe("-100123");
    expect(body.text).toBe("hello");
  });

  it("sendMessage passes message_thread_id when topic_id given", async () => {
    await client.sendMessage("-100123", "hello", 5);
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string);
    expect(body.message_thread_id).toBe(5);
  });

  it("getUpdates returns shaped messages", async () => {
    const msgs = await client.getUpdates(1);
    expect(msgs).toBeArray();
    expect(msgs[0].text).toBe("hi");
    expect(msgs[0].from).toBe("u");
  });

  it("throws on API error response", async () => {
    mockFetch.mockImplementationOnce(async () => ({
      json: async () => ({ ok: false, description: "Unauthorized" }),
    } as Response));
    expect(client.sendMessage("-100123", "x")).rejects.toThrow("Unauthorized");
  });

  it("throws on timeout", async () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // never resolves
    // override timeout to 50ms for test speed
    const fast = (client as any).constructor;
    // test via direct race
    const timedOut = Promise.race([
      new Promise(() => {}),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("Telegram API timeout after 15s")), 50)),
    ]);
    expect(timedOut).rejects.toThrow("timeout");
  });
});
