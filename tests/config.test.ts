import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { loadConfig } from "../src/config";

describe("loadConfig", () => {
  const env = process.env;

  beforeEach(() => {
    // isolate env per test
    process.env = { ...env };
    delete process.env.TELEGRAM_API_ID;
    delete process.env.TELEGRAM_API_HASH;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_SESSION;
    delete process.env.TELEGRAM_MODE;
  });

  afterEach(() => { process.env = env; });

  it("detects Bot API mode from TELEGRAM_BOT_TOKEN", () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    const cfg = loadConfig();
    expect(cfg.mode).toBe("botapi");
    expect(cfg.botToken).toBe("123:abc");
  });

  it("detects MTProto mode from API_ID + API_HASH", () => {
    process.env.TELEGRAM_API_ID = "12345";
    process.env.TELEGRAM_API_HASH = "abc123";
    const cfg = loadConfig();
    expect(cfg.mode).toBe("mtproto");
    expect(cfg.apiId).toBe(12345);
    expect(cfg.apiHash).toBe("abc123");
  });

  it("TELEGRAM_MODE=botapi forces Bot API even if MTProto vars present", () => {
    process.env.TELEGRAM_MODE = "botapi";
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    process.env.TELEGRAM_API_ID = "12345";
    process.env.TELEGRAM_API_HASH = "abc123";
    expect(loadConfig().mode).toBe("botapi");
  });

  it("TELEGRAM_SESSION env is used as session string", () => {
    process.env.TELEGRAM_API_ID = "12345";
    process.env.TELEGRAM_API_HASH = "abc123";
    process.env.TELEGRAM_SESSION = "mysessionstring";
    expect(loadConfig().session).toBe("mysessionstring");
  });

  it("throws when no credentials provided", () => {
    expect(() => loadConfig()).toThrow("No Telegram credentials found");
  });

  it("throws when Bot API mode forced but no token", () => {
    process.env.TELEGRAM_MODE = "botapi";
    expect(() => loadConfig()).toThrow("TELEGRAM_BOT_TOKEN is required");
  });

  it("throws when MTProto mode forced but missing hash", () => {
    process.env.TELEGRAM_MODE = "mtproto";
    process.env.TELEGRAM_API_ID = "12345";
    expect(() => loadConfig()).toThrow("TELEGRAM_API_ID and TELEGRAM_API_HASH are required");
  });
});
