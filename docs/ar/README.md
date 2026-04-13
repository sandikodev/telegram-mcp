# telegram-mcp

> خادم [Model Context Protocol (MCP)](https://modelcontextprotocol.io) لتيليغرام.  
> قراءة سجل الرسائل، إرسال الرسائل، إدارة مواضيع المنتدى — مبني بـ **Bun** و **GramJS** (MTProto) و **Zod**.

**اقرأ بلغات أخرى:**
[English](../../README.md) · [Bahasa Indonesia](../id/README.md) · [中文](../zh/README.md) · [日本語](../ja/README.md)

---

## لماذا telegram-mcp؟

واجهة برمجة تطبيقات Telegram Bot API محدودة — لا تستطيع قراءة سجل الرسائل، أو الوصول إلى المجموعات الخاصة، أو إدارة مواضيع المنتدى بشكل كامل. يستخدم هذا الخادم **MTProto Client API** (عبر GramJS) مع حسابك الشخصي على تيليغرام، مما يمنح وكلاء الذكاء الاصطناعي وصولاً كاملاً إلى مساحة عمل تيليغرام الخاصة بك.

## الأدوات المتاحة

| الأداة | الوصف | الوضع |
|--------|-------|-------|
| `telegram_get_messages` | قراءة سجل الرسائل من أي محادثة أو موضوع منتدى | MTProto |
| `telegram_send_message` | إرسال رسائل Markdown/HTML إلى أي محادثة أو موضوع | كلاهما |
| `telegram_send_document` | إرسال ملفات إلى أي محادثة أو موضوع | كلاهما |
| `telegram_get_dialogs` | عرض قائمة بجميع المحادثات والمجموعات والقنوات | MTProto |
| `telegram_get_topics` | عرض مواضيع المنتدى في مجموعة فائقة | MTProto |

## البدء السريع

```bash
git clone https://github.com/sandikodev/telegram-mcp.git
cd telegram-mcp
bun install
bun run auth   # مصادقة لمرة واحدة
```

للتفاصيل الكاملة، راجع [README الإنجليزي](../../README.md).

## المساهمة

نرحب بجميع المساهمات — أدوات جديدة، إصلاح الأخطاء، التوثيق، الترجمات.  
راجع [CONTRIBUTING.md](../../CONTRIBUTING.md).

## الرخصة

MIT
