# Git Workflow & Collaboration Standards

> **Scope:** Git, branches, commits, PRs, code review, secrets, linting
> **Related:** the `deploy` skill

---

## Branching Strategy

Use **trunk-based development** with short-lived feature branches:

```
main                    ← production-ready, always deployable
  └── feature/xyz       ← short-lived (hours to days, not weeks)
  └── fix/xyz           ← bug fixes
  └── chore/xyz         ← dependency updates, config changes
```

**Rules:**

- `main` is the only long-lived branch — always deployable
- Feature branches are created from `main`, merged back to `main`
- Branch lifetime: hours to days, never weeks
- Delete branch after merge — no stale branches
- Never commit directly to `main` — always use PRs
- Never rebase shared/public branches

#### An open feature branch takes precedence over a new `fix/` branch

**Before opening `fix/…`, check whether the affected app already has an unmerged
feature branch. If it does, the fix is committed ON that branch.** A new branch is
only correct when the app has no feature branch in flight.

This repo runs one long-lived branch per app in parallel git worktrees
(`feat/api/…`, `feat/web/…`, `feat/mobile/…`), each merged into `staging` when ready.
Opening `fix/api/…` alongside an open `feat/api/…` is what the rules above literally
prescribe, and it is wrong here: the fix lands on a branch nobody merges, so it never
reaches `staging` and ships nowhere.

```bash
# Always check first — is this app's feature branch still open?
git branch -r --no-merged origin/staging | grep 'feat/'

# api fix, feat/api still open  → commit on it
git checkout feat/api/KYUC-48/backend-dev-api

# api fix, no open feat/api    → then, and only then, a new branch
git checkout -b fix/api/some-bug origin/dev
```

A change that is not any single app's source — a root-level build or CI file such as
`.dockerignore`, shared by `docker/api` and `docker/web` — goes on the branch that
already owns the surrounding deploy files, rather than to a branch of its own.

### Branch Naming

```
{type}/{ticket-or-short-description}

# Examples:
feature/user-authentication
feature/PROJ-123-terminal-sessions
fix/login-redirect-loop
chore/upgrade-nestjs-10
docs/api-endpoints
```

**Types:** `feature/`, `fix/`, `chore/`, `docs/`, `hotfix/`

- All lowercase, hyphens for spaces
- Include ticket ID if project uses issue tracking (e.g., `PROJ-123`)

## Commit Messages

Use **Conventional Commits** — every commit message follows this format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type       | When to Use                            |
| ---------- | -------------------------------------- |
| `feat`     | New feature or capability              |
| `fix`      | Bug fix                                |
| `refactor` | Code restructuring, no behavior change |
| `chore`    | Dependencies, config, build tooling    |
| `docs`     | Documentation changes                  |
| `test`     | Adding or updating tests               |
| `style`    | Code formatting (no logic change)      |
| `perf`     | Performance improvement                |

### Scope

The module or area affected — matches folder/module names:

```
feat(auth): add JWT refresh token rotation
fix(terminal): handle PTY crash on resize
refactor(session): extract adapter interface
chore(deps): upgrade socket.io to 4.8
test(auth): add login flow E2E tests
```

### Rules

- Subject line: imperative mood, lowercase, no period, max 72 characters
- Body: explain "why" not "what" — the diff shows what changed
- One logical change per commit — don't mix features with refactors
- Never use `--no-verify` to skip hooks
- Never use `--force` push to `main`

### Examples

```
# Good
feat(terminal): add session reattach on reconnect

When the WebSocket reconnects after a disconnect, existing PTY sessions
are reattached automatically instead of requiring manual session creation.

# Good
fix(auth): prevent duplicate registration on double-click

# Bad — vague
update stuff
fix things
WIP
```

## Pull Requests

### PR Title

Same format as commit: `type(scope): description`

```
feat(terminal): add multi-session tab switching
fix(auth): handle expired refresh token gracefully
```

### PR Description Template

```markdown
## Summary

- What this PR does and why

## Changes

- Bullet list of specific changes

## Test Plan

- [ ] How to verify this works
- [ ] What was tested (manual + automated)

## Screenshots

(if UI changes)
```

### Rules

- PR should be reviewable in under 30 minutes — if it takes longer, split it
- One PR per feature/fix — don't bundle unrelated changes
- All CI checks must pass before merge
- Squash merge to `main` — keeps history clean, one commit per PR
- PR title becomes the squash commit message — make it good
- Delete source branch after merge

## Code Review

### What Reviewers Check

1. **Correctness** — does it do what the PR claims?
2. **Consistency** — does it follow the rules in this library?
3. **Security** — any injection, auth bypass, or data leak risks?
4. **Tests** — are changes tested? Do existing tests still pass?

### What Reviewers Do NOT Bikeshed

- Formatting (Prettier handles this)
- Import order (ESLint handles this)
- Naming style (TypeScript rules handle this)

### Turnaround

- Review within 24 hours (business days)
- Author addresses feedback within 24 hours
- If no response in 48 hours, reviewer can merge with approval

### Closing the Loop After Addressing Review Comments

When you push a commit that resolves review feedback (human or automated bot
reviewer, e.g. an "InstantCodeReviewer" PR-event bot), you MUST close the loop
so the PR's state reflects reality — don't leave fixed findings showing as open
threads. After the fix commit is pushed:

1. **Verify the fix is real** — the code actually addresses the comment, and
   `lint` + `typecheck` + the relevant tests pass. Never resolve a thread you
   haven't actually fixed.
2. **Resolve each addressed review thread.** GitHub review-thread resolution is
   GraphQL-only (REST cannot set it). List unresolved threads, then resolve the
   ones your commit fixed:

   ```bash
   # List threads with resolved state + first comment (to match to your fix)
   gh api graphql -f query='
   { repository(owner: "OWNER", name: "REPO") {
       pullRequest(number: PR) {
         reviewThreads(first: 50) {
           nodes { id isResolved comments(first:1){ nodes { path body } } } } } } }' \
     --jq '.data.repository.pullRequest.reviewThreads.nodes[]
            | select(.isResolved|not)
            | "\(.id) | \(.comments.nodes[0].path) | \(.comments.nodes[0].body[0:60])"'

   # Resolve a thread once its finding is fixed in a pushed commit
   gh api graphql -f query='mutation($id:ID!){
     resolveReviewThread(input:{threadId:$id}){ thread { isResolved } } }' \
     -f id="PRRT_xxx"
   ```

   Only resolve threads whose finding is genuinely fixed; leave threads you
   disagree with open and reply with the rationale instead.

3. **Signal merge-readiness.** If the PR was opened as a Draft, mark it ready
   once CI is green and all addressed threads are resolved
   (`gh pr ready PR`). For a normal (non-draft) PR, a one-line summary comment
   noting "all review findings addressed + threads resolved, green CI" is the
   ready signal. Do NOT self-merge — readiness ≠ permission to merge; the human
   still triggers the merge (see Pull Requests §Rules).

**Rules:**

- Never resolve a review thread without a pushed commit that actually fixes it
  (or an explicit reply explaining why it's a non-issue).
- Resolve threads via the GraphQL `resolveReviewThread` mutation — REST has no
  equivalent.
- Marking a PR ready-for-merge is a state signal, not a merge — never merge
  your own PR unless the human explicitly says so.
- Re-run `lint` + `typecheck` + affected tests before resolving anything; a
  green local run is the precondition for claiming a finding is closed.

## Secrets & Environment Variables

### .env Files

```
.env                    ← local dev values — NEVER committed
.env.example            ← variable names + placeholder values — ALWAYS committed
.env.production         ← template with CHANGE_ME markers — committed as reference
```

### .gitignore (mandatory entries)

```
.env
.env.local
.env.*.local
```

### Secret Generation

```bash
# Generate a random secret (JWT_SECRET, encryption keys, etc.)
openssl rand -base64 48
```

### Rules

- `.env` is in `.gitignore` — always. No exceptions.
- `.env.example` is committed — lists every variable with placeholder values
- Never hardcode secrets in source code — always use environment variables
- Never log secrets — mask or omit from log output
- If a secret is accidentally committed: rotate it immediately, clean git history with `git filter-repo`
- Production secrets: use the hosting platform's secret management (environment variables in Docker, VPS env files with restricted permissions)
- Rotate secrets every 90 days for production systems

## ESLint & Prettier

### Setup

Root-level config shared across all packages — devDependencies in root `package.json`:

```json
// package.json (root)
{
  "devDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint-config-prettier": "^9.0.0"
  }
}
```

### Prettier Config

```json
// .prettierrc (root)
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### ESLint Config

```javascript
// eslint.config.mjs (root — ESLint v9 flat config)
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parser: tsparser },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  prettier,
];
```

### Rules

- Prettier runs on save (editor config) and on commit (lint-staged)
- ESLint runs on commit (lint-staged) and in CI
- No `eslint-disable` comments without an explanation comment above
- Root config applies to all packages — sub-packages can extend but not override
- `no-console` is enforced — use NestJS `Logger` in backend, proper error reporting in frontend

## Pre-Commit Hooks

### Setup with Husky + lint-staged

```json
// package.json (root)
{
  "scripts": {
    "prepare": "husky || true"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

`prepare: husky || true` keeps installs non-fatal when git/husky is absent
(e.g. a `--prod` install or a Docker build that excludes `.git`).

```bash
# .husky/pre-commit
pnpm lint-staged
```

Always commit a `.prettierignore` so the `*.{json,md,yml,yaml}` glob does not
reformat generated files — most importantly `pnpm-lock.yaml`, which would then
fail `pnpm install --frozen-lockfile` in CI and Docker builds:

```
# .prettierignore
pnpm-lock.yaml
dist
.husky/_
```

### Rules

- Pre-commit hooks are mandatory — never skip with `--no-verify`
- Hooks lint and format only staged files (lint-staged), not the whole repo
- If a hook fails, fix the issue — don't bypass the hook
- Husky + lint-staged installed at root level, applies to entire monorepo

## CI Checks (before merge)

Every PR must pass these before merging:

1. **Lint** — `pnpm lint` (ESLint across all packages)
2. **Type check** — `pnpm build` (TypeScript compilation)
3. **Unit tests** — `pnpm test` (Jest)
4. **E2E tests** — run against staging/test environment (if applicable)

Failed CI blocks merge — no exceptions.

## Rules Summary

- `main` is the only long-lived branch — always deployable
- Never commit directly to `main` — always use PRs
- Never rebase shared/public branches
- Delete branch after merge — no stale branches
- Branch naming: `{type}/{description}` in lowercase with hyphens
- Commit messages use Conventional Commits format: `type(scope): description`
- Subject line: imperative mood, lowercase, no period, max 72 characters
- One logical change per commit — do not mix features with refactors
- Never use `--no-verify` to skip pre-commit hooks
- Never use `--force` push to `main`
- PRs should be reviewable in under 30 minutes — split if larger
- One PR per feature/fix — do not bundle unrelated changes
- Squash merge to `main` — PR title becomes the squash commit message
- All CI checks (lint, type check, unit tests, E2E) must pass before merge
- `.env` is in `.gitignore` — always, no exceptions
- `.env.example` is committed with every variable and placeholder values
- Never hardcode secrets in source code — always use environment variables
- Never log secrets — mask or omit from log output
- If a secret is accidentally committed, rotate it immediately
- No `eslint-disable` comments without an explanation comment above
- Pre-commit hooks are mandatory — never skip; fix the issue if a hook fails
- Prettier runs on save and on commit; ESLint runs on commit and in CI
- After pushing a commit that addresses review feedback (human or bot reviewer), close the loop: resolve each fixed review thread via the GraphQL `resolveReviewThread` mutation (REST cannot), then signal merge-readiness (`gh pr ready` for drafts, or a summary comment) — but never resolve a thread without a real pushed fix, and never self-merge; readiness is a signal, the human triggers the merge
- **Never run a global rename (`sed -i`, IDE refactor across the whole repo) over a generic token without scoping it.** Identifiers like `api`, `app`, `user`, `name` collide with library code, external API paths, comments, and docs. Always: (a) scope the rename to a directory (e.g. `apps/web/src` not the repo root), (b) include surrounding context in the pattern (`\bapi\b` is still too broad — prefer `from '@app/api'` or `class FooApi`), (c) `git diff` the result and read every hunk before committing. After-the-fact symptoms (404s on third-party endpoints, broken constraint names, mangled docs) take far longer to chase than the rename took to run.
