import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { mkdirSync, writeFileSync } from "fs";
import * as readline from "readline";

const CONFIG_DIR   = `${process.env.HOME}/.config/telegram-mcp`;
const CONFIG_FILE  = `${CONFIG_DIR}/config.json`;
const SESSION_FILE = `${CONFIG_DIR}/session.txt`;

mkdirSync(CONFIG_DIR, { recursive: true });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> => new Promise(r => rl.question(q, r));

const apiId   = parseInt(await ask("API ID (dari my.telegram.org): "));
const apiHash = (await ask("API Hash: ")).trim();

writeFileSync(CONFIG_FILE, JSON.stringify({ apiId, apiHash }, null, 2));

const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
  connectionRetries: 3,
});

await client.start({
  phoneNumber: async () => (await ask("Nomor HP (+62...): ")).trim(),
  password:    async () => (await ask("2FA Password (Enter jika tidak ada): ")).trim(),
  phoneCode:   async () => (await ask("Kode OTP dari Telegram: ")).trim(),
  onError:     (err) => console.error(err),
});

const session = client.session.save() as unknown as string;
writeFileSync(SESSION_FILE, session);
rl.close();
console.log("✅ Session tersimpan di", SESSION_FILE);
await client.disconnect();
