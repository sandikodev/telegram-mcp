/**
 * Mock Telegram Bot API server
 * Emulates https://api.telegram.org/bot<token>/<method>
 * Used for integration testing without real Telegram credentials
 */

import { Hono } from "hono";

const app = new Hono();

// Shared state for test assertions
const sent: { method: string; body: unknown }[] = [];

const ok = (result: unknown) => ({ ok: true, result });

app.post("/bot:token/getMe", (c) =>
  c.json(ok({ id: 123456789, is_bot: true, first_name: "TestBot", username: "testbot" }))
);

app.post("/bot:token/getUpdates", (c) =>
  c.json(ok([
    {
      update_id: 1,
      message: {
        message_id: 42,
        date: 1713052800,
        from: { id: 1, username: "testuser", first_name: "Test" },
        text: "Hello from mock",
        chat: { id: -1001234567890, type: "supergroup" },
      },
    },
  ]))
);

app.post("/bot:token/sendMessage", async (c) => {
  const body = await c.req.json();
  sent.push({ method: "sendMessage", body });
  return c.json(ok({
    message_id: 100,
    date: 1713052800,
    chat: { id: body.chat_id, type: "supergroup" },
    text: body.text,
  }));
});

app.post("/bot:token/sendDocument", async (c) => {
  sent.push({ method: "sendDocument", body: "(multipart)" });
  return c.json(ok({ message_id: 101, date: 1713052800 }));
});

// Expose sent log for test runner assertions
app.get("/_test/sent", (c) => c.json(sent));
app.delete("/_test/sent", (c) => { sent.length = 0; return c.json({ ok: true }); });

const port = parseInt(process.env.PORT ?? "8080");
console.log(`[mock-botapi] Listening on :${port}`);
export default { port, fetch: app.fetch };
