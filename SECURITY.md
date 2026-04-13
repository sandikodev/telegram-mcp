# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x | ✅ |

## Reporting a Vulnerability

**Please do not report security vulnerabilities via public GitHub issues.**

If you discover a security vulnerability, please send an email to:  
📧 **androxoss@hotmail.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive a response within **48 hours**.

## Security Best Practices

When using telegram-mcp:

1. **Never commit your session file** (`~/.config/telegram-mcp/session.txt`)
2. **Never commit your `api_hash`** — treat it like a password
3. **Use a dedicated Telegram account** for automation if possible
4. **Restrict file permissions** on your session file: `chmod 600 ~/.config/telegram-mcp/session.txt`
5. **Rotate your session** if you suspect it has been compromised — revoke at [my.telegram.org](https://my.telegram.org)

## Scope

The following are **in scope** for security reports:
- Authentication bypass
- Session token exposure
- Arbitrary file read/write via tool inputs
- Injection attacks via MCP tool parameters

The following are **out of scope**:
- Telegram's own security issues (report to Telegram directly)
- Issues requiring physical access to the machine
