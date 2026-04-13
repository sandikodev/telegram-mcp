# telegram-mcp

> 适用于 Telegram 的 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 服务器。  
> 读取消息历史、发送消息、管理论坛话题 — 基于 **Bun**、**GramJS** (MTProto) 和 **Zod** 构建。

**其他语言版本：**
[English](../../README.md) · [Bahasa Indonesia](../id/README.md) · [日本語](../ja/README.md) · [العربية](../ar/README.md)

---

## 为什么选择 telegram-mcp？

Telegram Bot API 存在限制 — 无法读取消息历史、无法访问私人群组，也无法完整管理论坛话题。本服务器使用 **MTProto 客户端 API**（通过 GramJS），以您自己的 Telegram 账户运行，为 AI 代理提供对 Telegram 工作区的完整访问权限。

## 可用工具

| 工具 | 描述 | 模式 |
|------|------|------|
| `telegram_get_messages` | 从任意聊天或论坛话题读取消息历史 | MTProto |
| `telegram_send_message` | 向任意聊天或话题发送 Markdown/HTML 消息 | 两种 |
| `telegram_send_document` | 向任意聊天或话题发送文件 | 两种 |
| `telegram_get_dialogs` | 列出所有聊天、群组和频道 | MTProto |
| `telegram_get_topics` | 列出超级群组中的论坛话题 | MTProto |

## 快速开始

```bash
git clone https://github.com/sandikodev/telegram-mcp.git
cd telegram-mcp
bun install
bun run auth   # 一次性认证
```

详细说明请参阅 [English README](../../README.md)。

## 贡献

欢迎所有贡献 — 新工具、错误修复、文档、翻译。  
请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 许可证

MIT
