---
paths:
  - 'apps/mcp/**'
---

# MCP Server Standards

> **Scope:** Model Context Protocol (MCP) server integration with NestJS apps
> **Related:** `nestjs.md`, the `deploy` skill, `infrastructure.md`

---

## Overview

MCP servers allow AI clients (Claude Desktop, Claude Code, Cursor, etc.) to interact with your app via structured tool calls. The server runs as an HTTP endpoint inside the NestJS API — not a separate container or process.

## Architecture

```
AI Client (Claude Desktop)
    ↓ MCP protocol (Streamable HTTP)
NestJS API Container
    ├── /api/v1/*          ← existing REST API
    ├── /mcp               ← MCP transport endpoint
    ├── /mcp/oauth/*       ← OAuth 2.1 flow
    └── /.well-known/...   ← OAuth discovery
```

The MCP module lives inside the NestJS app as `modules/mcp/`. It calls existing services directly (NotesService, etc.) — no REST API round-trip.

## Critical: @modelcontextprotocol/sdk Causes tsc OOM

**Problem:** The official `@modelcontextprotocol/sdk` package has 430+ type definition files (9.1MB) that cause TypeScript's compiler to exceed the default heap limit. This is a **known, open issue** ([typescript-sdk#985](https://github.com/modelcontextprotocol/typescript-sdk/issues/985)) with no SDK-side fix planned.

**Symptoms:**

- `tsc --noEmit` crashes with `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`
- `nest start --watch` (using tsc) hangs indefinitely or OOMs
- Happens even on machines with 16GB+ RAM

**Solution: Switch NestJS to SWC compiler**

SWC is a pure transpiler — it never runs type checking, so the MCP SDK's heavy types are irrelevant. NestJS has first-class SWC support since v10.

```json
// nest-cli.json
{
  "compilerOptions": {
    "builder": "swc",
    "typeCheck": false,
    "deleteOutDir": true
  }
}
```

Install SWC:

```bash
pnpm --filter @app/api add -D @swc/cli @swc/core
```

**Result:** Compilation drops from OOM/infinite to ~60ms.

**Type checking in CI:** Run separately with increased heap:

```bash
node --max-old-space-size=4096 ./node_modules/.bin/tsc --noEmit
```

**DO NOT attempt these alternatives — they don't fully fix the OOM:**

- `skipLibCheck: true` in tsconfig (partial relief only)
- `incremental: true` (helps on subsequent builds but first build still OOMs)
- Increasing `--max-old-space-size` for dev server (wastes memory, slow)

## Module Structure

```
modules/mcp/
  mcp.module.ts                    # NestJS module
  mcp.service.ts                   # MCP Server instance + tool registration
  mcp.controller.ts                # HTTP transport + OAuth endpoints + consent page
  oauth/
    oauth.service.ts               # OAuth 2.1 + PKCE flow
    oauth.guard.ts                 # Validates MCP bearer tokens
  tools/
    notes.tools.ts                 # Tool definitions per domain
    folders.tools.ts
    tags.tools.ts
    templates.tools.ts
  converters/
    markdown-tiptap.ts             # Markdown ↔ app-specific format conversion
```

## Authentication: OAuth 2.1 with PKCE

MCP servers use OAuth 2.1 for authentication. The flow:

1. Client discovers OAuth config via `GET /.well-known/oauth-authorization-server`
2. Client registers via `POST /mcp/oauth/register` (dynamic client registration)
3. Browser opens consent page: `GET /mcp/oauth/authorize?client_id=...&code_challenge=...`
4. User logs in + clicks "Allow"
5. Client exchanges code for tokens: `POST /mcp/oauth/token`
6. All MCP requests include `Authorization: Bearer mcp_xxxxx`

### OAuth Entities

| Entity                 | Table                       | Purpose                | Expiry     |
| ---------------------- | --------------------------- | ---------------------- | ---------- |
| OAuthClient            | `oauth_clients`             | Registered MCP clients | None       |
| OAuthAuthorizationCode | `oauth_authorization_codes` | Single-use auth codes  | 10 minutes |
| OAuthAccessToken       | `oauth_access_tokens`       | Bearer tokens for MCP  | 1 hour     |
| OAuthRefreshToken      | `oauth_refresh_tokens`      | Long-lived refresh     | 30 days    |

### Token Pattern

Same as API tokens — store SHA-256 hash, never plaintext:

```typescript
const rawToken = 'mcp_' + crypto.randomBytes(32).toString('base64url');
const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
const tokenPrefix = rawToken.slice(0, 12);
```

### Consent Page

Self-contained HTML served by the controller (no React build needed). Includes:

- Login form (email + password)
- App name requesting access
- Permission list
- Allow / Deny buttons
- CSRF protection

### Cleanup Cron

Add `@Cron(CronExpression.EVERY_HOUR)` to clean up expired codes and tokens.

## MCP Tools

### Registration Pattern

Each domain gets its own tool file. Tools are registered on the `McpServer` instance:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerNoteTools(
  server: McpServer,
  notesService: NotesService,
  getUserId: () => string,
) {
  server.tool(
    'create_note',
    'Create a new note. Content should be Markdown.',
    {
      title: z.string().optional().describe('Note title.'),
      content: z.string().optional().describe('Content in Markdown.'),
      folderId: z.string().uuid().optional().describe('Folder UUID.'),
    },
    async ({ title, content, folderId }) => {
      const userId = getUserId();
      const note = await notesService.create({ title, content, folderId }, userId, 'mcp');
      return {
        content: [{ type: 'text', text: `Created note "${note.title}" (ID: ${note.id})` }],
      };
    },
  );
}
```

### userId Injection

The `McpService` holds a `currentUserId` field. The controller sets it before handling each request and clears it after. Tool handlers access it via a `getUserId()` closure.

```typescript
// McpService
setCurrentUser(userId: string) { this.currentUserId = userId; }
clearCurrentUser() { this.currentUserId = null; }

// Tool registration
const getUserId = () => {
  if (!this.currentUserId) throw new Error('No authenticated user');
  return this.currentUserId;
};
```

### Content Format Conversion

If the app uses a rich text format (TipTap JSON, ProseMirror, Slate), MCP tools should accept/return **Markdown**. The converter sits between the tool handler and the service:

```
Claude → Markdown → [converter] → TipTap JSON → Service → DB
DB → Service → TipTap JSON → [converter] → Markdown → Claude
```

Use `marked` (Markdown → HTML/tokens) and `turndown` (HTML → Markdown) for conversion.

### Source Tracking

Pass `'mcp'` as the `editSource`/`source` parameter to all service calls. This appears in:

- Activity log entries
- Version history
- Distinguishes MCP content from web/API content

Add `MCP = 'mcp'` to the edit source enum in `packages/shared`.

## Route Configuration

MCP routes must be **excluded from the `/api/v1` global prefix**:

```typescript
// main.ts
app.setGlobalPrefix('api/v1', {
  exclude: [
    { path: 'mcp', method: RequestMethod.ALL },
    { path: 'mcp/(.*)', method: RequestMethod.ALL },
    { path: '.well-known/oauth-authorization-server', method: RequestMethod.GET },
  ],
});
```

## Caddy Configuration

Add **before** the SPA catch-all:

```
# MCP server
handle /mcp* {
    reverse_proxy api:{$API_PORT}
}

# OAuth discovery
handle /.well-known/oauth-authorization-server {
    reverse_proxy api:{$API_PORT}
}
```

**Important:** Restart Caddy after config changes — it doesn't auto-reload:

```bash
docker compose -f docker-compose.prod.yml restart caddy
```

## Docker / Deployment

The MCP module ships inside the existing API container — no separate Dockerfile or container needed.

**Ensure SWC is in the build pipeline:**

- `nest-cli.json` must have `"builder": "swc"` — production `nest build` uses this
- `@swc/cli` and `@swc/core` must be in devDependencies
- The single-stage Dockerfile (required for pnpm) will use `nest build` which now uses SWC

## NestJS MCP Wrapper Packages

Several community packages provide NestJS decorator-based MCP integration:

- `@rekog/mcp-nest` — most active, decorator-based tools/resources
- `@nestjs-mcp/server` — similar approach

These wrap the official SDK but **do NOT solve the tsc OOM** — SWC is still required.

## Claude Desktop Configuration

Users connect by adding the MCP server URL:

```json
{
  "mcpServers": {
    "your-app": {
      "url": "https://your-domain.com/mcp"
    }
  }
}
```

OAuth flow handles the rest — no manual token setup needed.

## Dependencies

```bash
pnpm --filter @app/api add @modelcontextprotocol/sdk marked turndown
pnpm --filter @app/api add -D @types/turndown @swc/cli @swc/core
```

Also ensure `zod` is installed (required by MCP SDK for tool schemas).

## CLAUDE.md Section

Every project with MCP should include:

```markdown
### MCP Server

- Endpoint: `/mcp` (Streamable HTTP transport)
- Auth: OAuth 2.1 with PKCE (consent page at `/mcp/oauth/authorize`)
- Discovery: `GET /.well-known/oauth-authorization-server`
- Tools: [list of tools]
- Compiler: SWC (required — MCP SDK types cause tsc OOM)
```

## Rules Summary

- MCP server runs inside the existing NestJS API container — no separate process or container
- **Always use SWC compiler** when `@modelcontextprotocol/sdk` is installed — tsc will OOM (known issue #985)
- Set `"builder": "swc"` and `"typeCheck": false` in `nest-cli.json`
- Run type checking separately in CI with `--max-old-space-size=4096`
- OAuth 2.1 with PKCE for authentication — consent page served as inline HTML by NestJS
- Store all tokens as SHA-256 hashes — never plaintext
- MCP access tokens expire in 1 hour, refresh tokens in 30 days, auth codes in 10 minutes
- Add hourly cron to clean up expired OAuth tokens
- Exclude `/mcp` routes from the `/api/v1` global prefix in `main.ts`
- Add `/mcp*` and `/.well-known` routes to Caddy **before** the SPA catch-all
- Restart Caddy after config changes
- MCP tools accept/return Markdown — converter handles app-specific format internally
- Pass `'mcp'` as edit source to all service calls for activity tracking
- Add `MCP = 'mcp'` to the edit source enum in `packages/shared`
- Use `getUserId()` closure for injecting authenticated user into tool handlers
- Ensure `express` is an explicit dependency for pnpm strict mode in Docker (per the `deploy` skill)
- `zod` must be in API dependencies (MCP SDK uses it for tool schemas)
