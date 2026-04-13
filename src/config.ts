/**
 * Config — auto-detect mode from environment variables.
 *
 * MTProto mode: TELEGRAM_API_ID + TELEGRAM_API_HASH (+ optional TELEGRAM_SESSION)
 * Bot API mode: TELEGRAM_BOT_TOKEN
 */

export type Mode = "mtproto" | "botapi";

export interface Config {
  mode: Mode;
  // MTProto
  apiId?: number;
  apiHash?: string;
  session?: string;
  // Bot API
  botToken?: string;
  defaultChatId?: string;
}

export function loadConfig(): Config {
  const apiId   = process.env.TELEGRAM_API_ID;
  const apiHash = process.env.TELEGRAM_API_HASH;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const session  = process.env.TELEGRAM_SESSION ?? "";
  const defaultChatId = process.env.TELEGRAM_CHAT_ID;

  const forcedMode = process.env.TELEGRAM_MODE as Mode | undefined;

  if (forcedMode === "botapi" || (!apiId && !apiHash && botToken)) {
    if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is required for Bot API mode");
    return { mode: "botapi", botToken, defaultChatId };
  }

  if (forcedMode === "mtproto" || (apiId && apiHash)) {
    if (!apiId || !apiHash) throw new Error("TELEGRAM_API_ID and TELEGRAM_API_HASH are required for MTProto mode");
    return { mode: "mtproto", apiId: parseInt(apiId), apiHash, session };
  }

  throw new Error(
    "No Telegram credentials found.\n" +
    "Set TELEGRAM_API_ID + TELEGRAM_API_HASH for MTProto mode, or\n" +
    "Set TELEGRAM_BOT_TOKEN for Bot API mode."
  );
}
