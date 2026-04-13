/**
 * MCP integration test runner
 * Spawns the MCP server as a subprocess, communicates via stdio JSON-RPC,
 * and asserts tool responses against the mock Bot API.
 */

import { spawn } from "child_process";

const MCP_BIN = process.env.MCP_BIN ?? "bun";
const MCP_ARGS = (process.env.MCP_ARGS ?? "run src/index.ts").split(" ");
const MOCK_URL = process.env.MOCK_BOTAPI_URL ?? "http://localhost:8080";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "test:token";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`, detail ?? "");
    failed++;
  }
}

// ---------------------------------------------------------------------------
// MCP stdio client
// ---------------------------------------------------------------------------

class McpClient {
  private proc: ReturnType<typeof spawn>;
  private buf = "";
  private pending = new Map<number, (r: unknown) => void>();
  private id = 0;

  constructor() {
    this.proc = spawn(MCP_BIN, MCP_ARGS, {
      env: {
        ...process.env,
        TELEGRAM_BOT_TOKEN: BOT_TOKEN,
        TELEGRAM_API_BASE: MOCK_URL,  // picked up by BotApiClient
      },
      stdio: ["pipe", "pipe", "inherit"],
    });

    this.proc.stdout!.on("data", (chunk: Buffer) => {
      this.buf += chunk.toString();
      const lines = this.buf.split("\n");
      this.buf = lines.pop()!;
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line) as { id?: number; result?: unknown; error?: unknown };
          if (msg.id !== undefined) this.pending.get(msg.id)?.(msg);
        } catch { /* ignore non-JSON */ }
      }
    });
  }

  call(method: string, params: unknown): Promise<{ result?: unknown; error?: unknown }> {
    return new Promise((resolve) => {
      const id = ++this.id;
      this.pending.set(id, (r) => { this.pending.delete(id); resolve(r as never); });
      const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
      this.proc.stdin!.write(msg);
    });
  }

  kill() { this.proc.kill(); }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function clearSent() {
  await fetch(`${MOCK_URL}/_test/sent`, { method: "DELETE" });
}

async function getSent(): Promise<{ method: string; body: unknown }[]> {
  const r = await fetch(`${MOCK_URL}/_test/sent`);
  return r.json() as Promise<never>;
}

async function waitForMock(retries = 20): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try { await fetch(`${MOCK_URL}/_test/sent`); return; } catch { /* retry */ }
    await Bun.sleep(200);
  }
  throw new Error("Mock Bot API did not become ready");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function run() {
  console.log("⏳ Waiting for mock Bot API...");
  await waitForMock();

  console.log("⏳ Starting MCP server...");
  const mcp = new McpClient();
  await Bun.sleep(1500); // wait for server init

  // ── 1. list_tools ────────────────────────────────────────────────────────
  console.log("\n📋 tools/list");
  const listRes = await mcp.call("tools/list", {}) as { result?: { tools: { name: string }[] } };
  const tools = listRes.result?.tools?.map((t) => t.name) ?? [];
  assert("returns 7 tools", tools.length === 7, tools);
  assert("includes telegram_send_message",    tools.includes("telegram_send_message"));
  assert("includes telegram_get_messages",    tools.includes("telegram_get_messages"));
  assert("includes telegram_send_document",   tools.includes("telegram_send_document"));
  assert("includes telegram_get_dialogs",     tools.includes("telegram_get_dialogs"));
  assert("includes telegram_get_topics",      tools.includes("telegram_get_topics"));
  assert("includes telegram_search_messages", tools.includes("telegram_search_messages"));
  assert("includes telegram_get_chat_info",   tools.includes("telegram_get_chat_info"));

  // ── 2. telegram_get_messages ─────────────────────────────────────────────
  console.log("\n📨 telegram_get_messages");
  const getMsgRes = await mcp.call("tools/call", {
    name: "telegram_get_messages",
    arguments: { chat_id: "-1001234567890", limit: 5 },
  }) as { result?: { content: { text: string }[] } };
  const msgs = JSON.parse(getMsgRes.result?.content?.[0]?.text ?? "[]") as unknown[];
  assert("returns array", Array.isArray(msgs));
  assert("has message with text", (msgs[0] as { text?: string })?.text === "Hello from mock");

  // ── 3. telegram_send_message ─────────────────────────────────────────────
  console.log("\n📤 telegram_send_message");
  await clearSent();
  const sendRes = await mcp.call("tools/call", {
    name: "telegram_send_message",
    arguments: { chat_id: "-1001234567890", text: "Test message" },
  }) as { result?: { content: { text: string }[]; isError?: boolean } };
  assert("no error", !sendRes.result?.isError, sendRes.result);
  const sent1 = await getSent();
  assert("called sendMessage on mock", sent1.some((s) => s.method === "sendMessage"));
  assert("correct text", (sent1[0]?.body as { text?: string })?.text === "Test message");

  // ── 4. telegram_send_message with topic_id ───────────────────────────────
  console.log("\n📤 telegram_send_message (with topic)");
  await clearSent();
  await mcp.call("tools/call", {
    name: "telegram_send_message",
    arguments: { chat_id: "-1001234567890", topic_id: 5, text: "Topic message" },
  });
  const sent2 = await getSent();
  assert("passes message_thread_id", (sent2[0]?.body as { message_thread_id?: number })?.message_thread_id === 5);

  // ── 5. Zod validation — missing required field ───────────────────────────
  console.log("\n🛡️  Zod validation");
  const badRes = await mcp.call("tools/call", {
    name: "telegram_send_message",
    arguments: { chat_id: "-1001234567890" }, // missing text
  }) as { result?: { isError?: boolean } };
  assert("returns isError on invalid input", badRes.result?.isError === true);

  // ── 6. MTProto-only tools in Bot API mode ────────────────────────────────
  console.log("\n🚫 MTProto-only tools (Bot API mode)");
  const dialogsRes = await mcp.call("tools/call", {
    name: "telegram_get_dialogs",
    arguments: { limit: 5 },
  }) as { result?: { isError?: boolean } };
  assert("get_dialogs returns isError in Bot API mode", dialogsRes.result?.isError === true);

  const topicsRes = await mcp.call("tools/call", {
    name: "telegram_get_topics",
    arguments: { chat_id: "-1001234567890" },
  }) as { result?: { isError?: boolean } };
  assert("get_topics returns isError in Bot API mode", topicsRes.result?.isError === true);

  const searchRes = await mcp.call("tools/call", {
    name: "telegram_search_messages",
    arguments: { chat_id: "-1001234567890", query: "hello" },
  }) as { result?: { isError?: boolean } };
  assert("search_messages returns isError in Bot API mode", searchRes.result?.isError === true);

  const chatInfoRes = await mcp.call("tools/call", {
    name: "telegram_get_chat_info",
    arguments: { chat_id: "-1001234567890" },
  }) as { result?: { isError?: boolean } };
  assert("get_chat_info returns isError in Bot API mode", chatInfoRes.result?.isError === true);

  // ── Done ─────────────────────────────────────────────────────────────────
  mcp.kill();
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => { console.error(err); process.exit(1); });
