/**
 * Bot API mode — pure fetch(), zero native deps, edge-ready.
 * Tools available: send_message, send_document, get_messages (recent only)
 */

export class BotApiClient {
  private base: string;

  constructor(private token: string) {
    const apiBase = process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org";
    this.base = `${apiBase}/bot${token}`;
  }

  private async call(method: string, body: Record<string, unknown>): Promise<unknown> {
    const res = await fetch(`${this.base}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json() as { ok: boolean; result?: unknown; description?: string };
    if (!data.ok) throw new Error(data.description ?? "Bot API error");
    return data.result;
  }

  async sendMessage(chatId: string | number, text: string, threadId?: number, parseMode = "Markdown") {
    return this.call("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      ...(threadId ? { message_thread_id: threadId } : {}),
    });
  }

  async sendDocument(chatId: string | number, filePath: string, caption?: string, threadId?: number) {
    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append("document", Bun.file(filePath));
    if (caption) form.append("caption", caption);
    if (threadId) form.append("message_thread_id", String(threadId));

    const res = await fetch(`${this.base}/sendDocument`, { method: "POST", body: form });
    const data = await res.json() as { ok: boolean; result?: unknown; description?: string };
    if (!data.ok) throw new Error(data.description ?? "Bot API error");
    return data.result;
  }

  async getUpdates(limit = 20) {
    const result = await this.call("getUpdates", { limit }) as Array<{
      message?: { message_id: number; date: number; from?: { username?: string; first_name?: string }; text?: string; document?: unknown };
    }>;
    return result.map(u => ({
      id: u.message?.message_id ?? 0,
      date: new Date((u.message?.date ?? 0) * 1000).toISOString(),
      from: u.message?.from?.username ?? u.message?.from?.first_name ?? "unknown",
      text: u.message?.text ?? "",
      has_media: !!u.message?.document,
    }));
  }

  async getMe() {
    return this.call("getMe", {});
  }
}
