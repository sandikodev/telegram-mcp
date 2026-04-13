# telegram-mcp

> Server [Model Context Protocol (MCP)](https://modelcontextprotocol.io) untuk Telegram.  
> Baca riwayat pesan, kirim pesan, kelola topik forum — dibangun dengan **Bun**, **GramJS** (MTProto), dan **Zod**.

**Baca dalam bahasa lain:**
[English](../../README.md) · [中文](../zh/README.md) · [日本語](../ja/README.md) · [العربية](../ar/README.md)

---

## Mengapa telegram-mcp?

Telegram Bot API memiliki keterbatasan — tidak bisa membaca riwayat pesan, mengakses grup privat secara retroaktif, atau mengelola topik forum secara penuh. Server ini menggunakan **MTProto client API** (via GramJS) dengan akun Telegram Anda sendiri, memberikan AI agent akses penuh ke workspace Telegram Anda.

## Tools yang Tersedia

| Tool | Deskripsi | Mode |
|------|-----------|------|
| `telegram_get_messages` | Baca riwayat pesan dari chat atau topik forum manapun | MTProto |
| `telegram_send_message` | Kirim pesan Markdown/HTML ke chat atau topik manapun | Keduanya |
| `telegram_send_document` | Kirim file ke chat atau topik manapun | Keduanya |
| `telegram_get_dialogs` | Daftar semua chat, grup, dan channel | MTProto |
| `telegram_get_topics` | Daftar topik forum di supergroup | MTProto |

## Persyaratan

| Komponen | Versi Minimum |
|----------|---------------|
| [Bun](https://bun.sh) | 1.0 |
| Akun Telegram | — |
| `api_id` + `api_hash` | dari [my.telegram.org](https://my.telegram.org) |

## Mulai Cepat

### 1. Clone & Install

```bash
git clone https://github.com/sandikodev/telegram-mcp.git
cd telegram-mcp
bun install
```

### 2. Autentikasi (sekali saja)

```bash
bun run auth
```

Anda akan diminta memasukkan `api_id`, `api_hash`, nomor HP, dan kode OTP.  
Session string disimpan di `~/.config/telegram-mcp/session.txt`.

### 3. Konfigurasi MCP client

**Kiro CLI** (`~/.kiro/settings/mcp.json`):
```json
{
  "mcpServers": {
    "telegram": {
      "command": "/path/to/.bun/bin/bun",
      "args": ["run", "/path/to/telegram-mcp/src/index.ts"]
    }
  }
}
```

## Contoh Penggunaan

Setelah terhubung ke MCP client Anda:

- *"Baca 20 pesan terakhir dari grup tim saya"*
- *"Kirim laporan harian ke channel Operasional, topik Monitoring"*
- *"Daftar semua grup Telegram saya beserta ID-nya"*
- *"Topik apa saja yang tersedia di grup Perpustakaan?"*
- *"Kirim file CSV ini ke topik Laporan Data"*

## Keamanan

- Session string disimpan lokal di `~/.config/telegram-mcp/session.txt`
- **Jangan pernah commit** session file atau `api_hash` Anda
- `.gitignore` sudah mengecualikan session file secara default
- Pertimbangkan menggunakan akun Telegram terpisah untuk otomasi

## Kontribusi

Lihat [CONTRIBUTING.md](../../CONTRIBUTING.md). Semua kontribusi disambut — tools baru, perbaikan bug, dokumentasi, terjemahan.

## Lisensi

MIT — lihat [LICENSE](../../LICENSE)
