---
paths:
  - 'docker/**'
  - 'docker-compose*'
  - 'scripts/**'
  - '**/.env*'
---

# Docker + Infrastructure Standards

> **Scope:** Local dev setup — Docker, ports, pnpm workspace, logging
> **Related:** the `deploy` skill, `database.md`

---

## Local Development Quickstart

Every new developer (or AI agent) runs these steps in order:

```bash
# 1. Prerequisites
node -v          # must be >= 22
pnpm -v          # must be >= 9 (install: npm i -g pnpm)
docker -v        # must be installed

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env    # fill in any missing values

# 4. Check ports are free
pnpm ports:check        # shows which ports are free/blocked

# 5. Start databases
docker compose up -d    # starts PostgreSQL + Redis

# 6. Build shared package (other packages depend on it)
pnpm --filter @app/shared build

# 7. Run migrations (creates DB tables — Prisma)
pnpm db:migrate

# 8. Start dev servers
pnpm dev                # starts API + Web concurrently
```

After setup, verify (using ports from your `.env`):

```bash
source .env
# /health is excluded from the /api/v1 prefix; responses use the success envelope
curl http://localhost:${API_PORT}/health   # → { "success": true, "data": { "status": "ok", "uptime": ... } }
open http://localhost:${WEB_PORT}           # → frontend loads
```

## Docker Naming Conventions

| What            | Convention                                                   | Example                     |
| --------------- | ------------------------------------------------------------ | --------------------------- |
| Docker services | kebab-case                                                   | `api`, `web`, `db`, `redis` |
| Container names | `{project}-{service}` (auto from compose)                    | `remoteterminal-api-1`      |
| Volumes         | `{project}_{purpose}`                                        | `remoteterminal_pgdata`     |
| Networks        | `{project}_default` (auto from compose)                      | `remoteterminal_default`    |
| Dockerfiles     | `docker/{service}/Dockerfile`                                | `docker/api/Dockerfile`     |
| Compose files   | `docker-compose.yml` (dev), `docker-compose.prod.yml` (prod) | —                           |

## Docker Compose (Dev)

Standard services for every project:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - '127.0.0.1:${DB_PORT}:5432'
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - ./docker-data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER}']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '127.0.0.1:${REDIS_PORT}:6379'
    volumes:
      - ./docker-data/redis:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
```

**Rules:**

- Bind to `127.0.0.1` — never expose to `0.0.0.0` in dev
- Each project uses a unique port range (see Port Allocation Convention below)
- `docker-data/` in `.gitignore` — never commit database volumes
- Always include `healthcheck` — services that depend on DB/Redis use `condition: service_healthy`

## Docker Alpine Gotchas

**Healthchecks — always use `127.0.0.1`, never `localhost`:**
BusyBox `wget` in Alpine images (nginx:alpine, node:alpine) cannot resolve `localhost` in some configurations. The container will show as "unhealthy" even though the service is running. Always use `127.0.0.1`:

```yaml
# WRONG — fails silently in Alpine
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:${API_PORT}/health || exit 1"]

# CORRECT — works reliably
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:${API_PORT}/health || exit 1"]
```

Same applies to Dockerfile `HEALTHCHECK` instructions. Always include `start_period` to give services time to boot.

**nginx:alpine has `wget` (BusyBox) but NOT `curl`.** Use `wget -qO-` for healthchecks in nginx containers.

**node:alpine has `wget` (BusyBox) but NOT `curl`.** Same pattern — `wget -qO-` with `127.0.0.1`.

**pnpm symlinks break across Docker stages — so use `pnpm deploy`.** Don't blindly `COPY --from=builder /app/node_modules` (pnpm's symlinked `.pnpm` store doesn't survive a cross-stage copy). The template's multi-stage Dockerfiles instead run `pnpm --filter @app/api --prod deploy /out`, which produces a self-contained, symlink-free `node_modules` that copies cleanly into the runtime stage. See the `deploy` skill.

**Changing POSTGRES_USER or POSTGRES_DB has no effect on existing volumes.** PostgreSQL only reads these env vars on first initialization. To rename, drop the volume: `docker compose down -v` (⚠️ destroys data) or manually create the new user/db inside the running container.

## Docker Compose (Production)

```yaml
services:
  caddy:
    image: caddy:2-alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - api
      - web

  api:
    build:
      context: .
      dockerfile: docker/api/Dockerfile
    deploy:
      resources:
        limits:
          memory: 1G

  web:
    build:
      context: .
      dockerfile: docker/web/Dockerfile
    deploy:
      resources:
        limits:
          memory: 128M
```

**Dockerfiles — multi-stage builds:**

```dockerfile
# API: node:22-alpine, dev + production targets
# Web: node:22-alpine for build → nginx:alpine for serve
```

## Port Management

### Port Scheme: `XXXYY`

Every project gets a unique port range. Never hardcode ports — they follow this scheme:

```
Port = XXX * 100 + YY

XXX = project ID (100–300) → 201 project slots
YY  = service ID (00–99)   → 100 services per project
Range: 10000–30099 (safe zone — no known services use this range)
```

### Service Mapping (YY)

| YY    | Service                          | Env Variable   |
| ----- | -------------------------------- | -------------- |
| 00    | PostgreSQL                       | `DB_PORT`      |
| 01    | Redis                            | `REDIS_PORT`   |
| 02    | API (NestJS)                     | `API_PORT`     |
| 03    | Web / Frontend                   | `WEB_PORT`     |
| 04    | Worker / Queue processor         | `WORKER_PORT`  |
| 05    | WebSocket (if separate from API) | `WS_PORT`      |
| 06    | Admin panel                      | `ADMIN_PORT`   |
| 07    | Monitoring / Metrics             | `METRICS_PORT` |
| 08–99 | Reserved for future services     | —              |

### Examples

| Project            | XXX | DB    | Redis | API   | Web   |
| ------------------ | --- | ----- | ----- | ----- | ----- |
| (template default) | 300 | 30000 | 30001 | 30002 | 30003 |
| (example)          | 145 | 14500 | 14501 | 14502 | 14503 |

### Assigning a Project ID

Shared scripts live in the rules library at `~/.claude/rules-library/fullstack-js/scripts/`. Copy or symlink them into each project:

```bash
# Copy scripts into a new project
mkdir -p scripts
cp ~/.claude/rules-library/fullstack-js/scripts/check-range.sh scripts/
cp ~/.claude/rules-library/fullstack-js/scripts/check-ports.sh scripts/

# Or symlink (stays in sync with rules library)
mkdir -p scripts
ln -s ~/.claude/rules-library/fullstack-js/scripts/check-range.sh scripts/check-range.sh
ln -s ~/.claude/rules-library/fullstack-js/scripts/check-ports.sh scripts/check-ports.sh
```

Before picking an ID for a new project, check that the entire range is free:

```bash
# Check if project ID 100 is available
bash scripts/check-range.sh 100

# Output:
# Checking ports 10000-10009 for project ID 100...
# FREE:    port 10000 (DB)
# FREE:    port 10001 (Redis)
# FREE:    port 10002 (API)
# FREE:    port 10003 (Web)
# ...
# All ports free. Project ID 100 is available.
#
# Add to .env.example:
#   DB_PORT=10000
#   REDIS_PORT=10001
#   API_PORT=10002
#   WEB_PORT=10003
```

The script also suggests the next free ID if the chosen one is blocked.

**Steps for a new project:**

1. Pick a project ID (100-300) that no other project uses
2. Run `bash scripts/check-range.sh <id>` to verify the range is free
3. Copy the output into `.env.example`
4. Document the ID and range in the project's `CLAUDE.md`

### .env.example (every project ships with this)

```env
# Port scheme: XXXYY (XXX=project ID, YY=service)
# This project's ID: 100
DB_PORT=10000
REDIS_PORT=10001
API_PORT=10002
WEB_PORT=10003
```

### Who Reads These Ports

| Consumer              | How it reads the port                                                    |
| --------------------- | ------------------------------------------------------------------------ | --- | ---------- |
| Docker compose        | `'127.0.0.1:${DB_PORT}:5432'` (maps host port → container internal port) |
| NestJS `main.ts`      | `app.listen(config.get('API_PORT'))`                                     |
| Vite `vite.config.ts` | `server: { port: parseInt(process.env.WEB_PORT                           |     | '5173') }` |
| API E2E tests         | `process.env.API_PORT` in test client base URL                           |
| Web E2E tests         | `process.env.WEB_PORT` in test config                                    |

### CLAUDE.md Template (every project must include this)

```markdown
## Ports

| Service    | Port  | Env Var    |
| ---------- | ----- | ---------- |
| PostgreSQL | 10000 | DB_PORT    |
| Redis      | 10001 | REDIS_PORT |
| API        | 10002 | API_PORT   |
| Web        | 10003 | WEB_PORT   |

Project ID: 100
Port range: 10000–10099
```

### Port Check — Before Starting a Project

Run `check-ports.sh` before `docker compose up` to verify all project ports are free. The script reads ports from `.env`, checks each one, and shows what's blocking if any are taken.

```bash
bash scripts/check-ports.sh

# Output:
# Checking project ports...
# FREE:    DB port 10000
# FREE:    Redis port 10001
# BLOCKED: API port 10002 — used by node (PID: 12345)
# FREE:    Web port 10003
#
# Blocked ports found. Options:
#   1. Kill blocking processes: kill -9 12345
#   2. Stop Docker containers: docker compose down
```

Add to `package.json`:

```json
"scripts": {
  "ports:check": "bash scripts/check-ports.sh",
  "ports:assign": "bash scripts/check-range.sh"
}
```

### Port Conflict Resolution

```bash
# Find what's using a port
lsof -ti:10002
# Output: 12345 (PID)

# See the process details
ps aux | grep 12345

# Kill it (graceful)
kill 12345

# Kill it (force — if graceful doesn't work)
kill -9 12345

# Kill everything on a specific port (one-liner)
lsof -ti:10002 | xargs kill -9 2>/dev/null; echo "port freed"

# Kill ALL project ports at once (read from .env)
source .env && for p in $DB_PORT $REDIS_PORT $API_PORT $WEB_PORT; do lsof -ti:$p | xargs kill -9 2>/dev/null; done; echo "all ports freed"

# Check if port is now free
lsof -ti:10002 || echo "port is free"
```

**Common causes of blocked ports:**

- Previous dev server didn't shut down cleanly → kill the orphaned process
- Docker container still running → `docker compose down`
- Another project using the same port range → assign a different project ID (XXX)
- System service using the port → unlikely in 10000–30000 range, but check with `lsof`

**Rules:**

- Every project gets a unique XXX project ID — never reuse
- All ports come from `.env` — never hardcode in source code
- Run `pnpm ports:check` before starting if unsure
- Document project ID and port range in project's `CLAUDE.md`
- If a port conflict occurs, check what's using it before killing

## Commands Pattern

Root `package.json` scripts:

```json
{
  "dev": "pnpm -r --parallel dev",
  "dev:api": "pnpm --filter @app/api dev",
  "dev:web": "pnpm --filter @app/web dev",
  "build": "pnpm -r build",
  "docker:up": "docker compose up -d",
  "docker:down": "docker compose down",
  "db:migrate": "pnpm --filter @app/api migration:run",
  "db:generate": "pnpm --filter @app/api migration:generate"
}
```

## Shared Scripts (`.claude/scripts`)

Every project symlinks shared scripts from the rules library. These are identical across all projects — never recreate or modify them.

```bash
# Setup during project scaffolding
mkdir -p .claude
ln -s ~/.claude/rules-library/fullstack-js/scripts .claude/scripts

# Then symlink individual scripts into project locations as needed
ln -s .claude/scripts/runner.mjs apps/web/test/e2e/runner.mjs
ln -s .claude/scripts/assertions.mjs apps/web/test/e2e/assertions.mjs
ln -s .claude/scripts/qa-helpers.mjs apps/web/test/e2e/qa-helpers.mjs
```

**Available shared scripts:**

| Script           | Purpose                                        | Used By                             |
| ---------------- | ---------------------------------------------- | ----------------------------------- |
| `runner.mjs`     | Playwright E2E test runner + CSV reporter      | the `e2e-web` skill                 |
| `assertions.mjs` | Generic test assertion helpers                 | the `e2e-web` skill                 |
| `qa-helpers.mjs` | Visual annotation helpers (colored highlights) | the `qa` skill, the `e2e-web` skill |
| `check-ports.sh` | Check if project ports are free                | `infrastructure.md`                 |
| `check-range.sh` | Verify a project ID's port range is available  | `infrastructure.md`                 |

**Rules:**

- Shared scripts live in `.claude/scripts/` — symlinked from rules library
- Never recreate these scripts manually — always symlink or copy from `.claude/scripts/`
- If the AI needs one of these scripts, tell it to use the symlinked version, not generate new code
- Add `.claude/` to `.gitignore` — scripts are proprietary, not committed to project repo

## Environment Files

```
.env              # Dev defaults (gitignored)
.env.example      # Template (committed) — document every variable
.env.test         # Test credentials (gitignored)
```

**Rules:**

- Never commit `.env` files with real credentials
- Always maintain `.env.example` with placeholder values and comments
- Production secrets via Docker secrets or env injection (never in compose files)

## Monorepo pnpm Workspace

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'packages/zero/packages/*' # if Zero submodule is used
```

**Build order matters:**

1. `packages/shared` first (other packages depend on it)
2. `packages/zero` (if present)
3. `apps/api` and `apps/web` (can build in parallel)

## Logging

```typescript
// NestJS Logger — use in every service/processor
private readonly logger = new Logger(ClassName.name);

this.logger.log('Message');          // info
this.logger.warn('Warning');         // warning
this.logger.error('Error', stack);   // error with stack trace
```

**Rules:**

- Never use `console.log` in production code — always NestJS `Logger`
- Include entity IDs and context in log messages for debugging
- Log at appropriate levels: `log` for flow, `warn` for recoverable issues, `error` for failures

## Rules Summary

- Bind Docker dev ports to `127.0.0.1` — never expose to `0.0.0.0`
- Each project gets a unique port range (XXXYY scheme) — never reuse project IDs
- All ports come from `.env` — never hardcode in source code
- Always include `healthcheck` on Docker services; use `condition: service_healthy` for dependencies
- Always use `127.0.0.1` in Alpine healthchecks — never `localhost`
- Use `wget -qO-` for healthchecks in nginx:alpine and node:alpine (no curl available)
- Never `COPY --from=builder /app/node_modules` in pnpm monorepos — symlinks break across stages
- Changing POSTGRES_USER or POSTGRES_DB has no effect on existing volumes — drop volume to rename
- Put `docker-data/` in `.gitignore` — never commit database volumes
- Never commit `.env` files with real credentials; always maintain `.env.example` with placeholders
- Production secrets via Docker secrets or env injection — never in compose files
- Build `packages/shared` first — other packages depend on it
- Run `pnpm ports:check` before starting if port availability is uncertain
- Document project ID and port range in the project's CLAUDE.md
- Never use `console.log` in production code — always use NestJS Logger
- **Container paths are NOT host paths.** Files at `/app/scripts/foo.json` on the host and `/app/scripts/foo.json` inside a container are the same path string but two different inodes unless that directory is bind-mounted. Editing or deleting on the host has no effect on the container (and vice versa) for non-mounted paths. Always operate on the side that matches your goal: `docker exec <container> rm /app/foo` for the container copy, plain `rm /app/foo` on the host for the host copy. When resetting state during a debug loop, list BOTH sides (`ls -la /app/foo` on host AND `docker exec <container> ls -la /app/foo`) before assuming the reset took.
- **Resetting a database is not the same as resetting your tool's cached state.** Local state files (`.state.json`, `.cache/`, BullMQ keys in Redis, in-container scratch dirs) survive `TRUNCATE`. Idempotent importers/migrators key off these caches and will skip work whose DB row you just deleted, leaving you with confusing "already done" runs. When you wipe the DB, sweep adjacent caches in the same step.
