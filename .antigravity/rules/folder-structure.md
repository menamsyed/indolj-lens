# Folder Structure & Rule Path-Scoping

> **Scope:** Canonical monorepo layout + how to scope rules to it. Always loaded (no `paths:` frontmatter).
> **Related:** every stack rule path-scopes against this layout.

---

## Canonical Layout

KoderLabs fullstack-js monorepo (pnpm workspaces). Each repo includes only the apps it actually has — omit the rest. This template ships `apps/api`, `apps/web`, `apps/mobile`, and `packages/shared`.

| Path              | Contents                      | Stack rule(s)                                            |
| ----------------- | ----------------------------- | -------------------------------------------------------- |
| `apps/api`        | NestJS + Prisma backend       | `nestjs.md`, `database.md`, `saas.md`, `integrations.md` |
| `apps/web`        | React + Vite frontend         | `react.md`, `ui-design.md`                               |
| `apps/mobile`     | React Native + Expo           | `react-native.md`, `ui-design.md`                        |
| `apps/desktop`    | Electron desktop app          | `electron.md`                                            |
| `apps/mcp`        | MCP server                    | `mcp.md`                                                 |
| `packages/shared` | enums, types, constants (CJS) | `typescript.md`                                          |

**Repo exceptions:** projects that are edge/deploy wrappers still place their app code under `apps/*` per this standard. Do not add new code outside `apps/*` / `packages/*`.

## Rule Loading Model

Three mechanisms, by purpose:

- **Always-on rules** — no `paths:` frontmatter; load every session. Reserve for truly cross-cutting conventions: `typescript.md`, `git-workflow.md`, `folder-structure.md`, `security.md`, `code-review.md`, `alpha-beta.md`, `stack-reference.md`, `ci.md`. Keep each short — they cost context on every prompt.
- **Path-scoped rules** — carry `paths:` frontmatter; load only when Claude touches a matching file. This is how a web-only session stays free of api/mobile/mcp walls. Every stack rule is path-scoped.
- **Skills** (`.claude/skills/<name>/SKILL.md`) — invoked workflows (deploy, qa, e2e). Zero standing context; load on demand when called or judged relevant.

## Authoring a New Rule

1. **Convention for one place in the tree** → path-scoped RULE. Add frontmatter using the canonical globs from the table above:

   ```markdown
   ---
   paths:
     - 'apps/api/**'
   ---

   # <Rule Title>
   ```

2. **Cross-cutting convention** (naming, git, this file) → always-on RULE, no frontmatter. Keep it tight.
3. **A task you run start-to-finish** (deploy, QA sweep, scaffold) → SKILL under `.claude/skills/`, not a rule.

**Glob vocabulary** — reuse these, don't invent per-repo paths:

| Glob                           | Matches                                        |
| ------------------------------ | ---------------------------------------------- |
| `apps/<app>/**`                | a whole stack (api, web, mobile, desktop, mcp) |
| `apps/<app>/test/**`           | that app's tests                               |
| `**/.env*`, `**/*.env.example` | env files anywhere                             |
| `docker/**`, `docker-compose*` | container/infra files                          |

A rule that would match every file is not path-scoped — it's an always-on rule; leave the frontmatter off.

## Rules Summary

- One canonical monorepo layout (`apps/*` + `packages/shared`); never add code outside it.
- Three loading mechanisms: always-on rules (no frontmatter, cross-cutting, keep short), path-scoped rules (`paths:` frontmatter, every stack rule), skills (`.claude/skills/`, on-demand workflows).
- Author a one-place convention as a path-scoped rule, a cross-cutting one as always-on, a start-to-finish task as a skill.
- Reuse the canonical glob vocabulary — don't invent per-repo paths.
