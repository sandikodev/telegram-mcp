# telegram-mcp

> Telegram 向けの [Model Context Protocol (MCP)](https://modelcontextprotocol.io) サーバー。  
> メッセージ履歴の読み取り、メッセージ送信、フォーラムトピックの管理 — **Bun**、**GramJS** (MTProto)、**Zod** で構築。

**他の言語で読む：**
[English](../../README.md) · [Bahasa Indonesia](../id/README.md) · [中文](../zh/README.md) · [العربية](../ar/README.md)

---

## なぜ telegram-mcp？

Telegram Bot API には制限があります — メッセージ履歴の読み取り、プライベートグループへのアクセス、フォーラムトピックの完全な管理ができません。このサーバーは **MTProto クライアント API**（GramJS 経由）を使用し、AI エージェントに Telegram ワークスペースへの完全なアクセスを提供します。

## 利用可能なツール

| ツール | 説明 | モード |
|--------|------|--------|
| `telegram_get_messages` | 任意のチャットまたはフォーラムトピックのメッセージ履歴を読み取る | MTProto |
| `telegram_send_message` | 任意のチャットまたはトピックに Markdown/HTML メッセージを送信 | 両方 |
| `telegram_send_document` | 任意のチャットまたはトピックにファイルを送信 | 両方 |
| `telegram_get_dialogs` | すべてのチャット、グループ、チャンネルを一覧表示 | MTProto |
| `telegram_get_topics` | スーパーグループのフォーラムトピックを一覧表示 | MTProto |

## クイックスタート

```bash
git clone https://github.com/sandikodev/telegram-mcp.git
cd telegram-mcp
bun install
bun run auth   # 初回認証
```

詳細は [English README](../../README.md) を参照してください。

## コントリビューション

新しいツール、バグ修正、ドキュメント、翻訳など、あらゆる貢献を歓迎します。  
[CONTRIBUTING.md](../../CONTRIBUTING.md) をご覧ください。

## ライセンス

MIT
