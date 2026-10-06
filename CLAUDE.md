# lean-web-stack

FastAPI + Celery backend (`backend/`, uv), React + Vite frontend (`frontend/`, npm; rules in `frontend/CLAUDE.md`).
Postgres + Redis via `compose.yml`, commands in the `Makefile`. Playbooks in `docs/playbooks/`.

## Parallel agents

Agents share one Postgres and one Redis (ports from `.env`). Each agent works in its own git worktree and its own **slot**.

1. `scripts/stack lease <your-name>` first, once per worktree. It writes `.env.slot`.
2. Run every job that needs the DB, Redis or a port through `scripts/stack run`:
   - tests: `make check-backend` (runs pytest via `scripts/stack run --db test --heavy`), `make check-frontend`
   - dev DB: `scripts/stack run --db dev -- <cmd>` (clone of `app_template`, migrated)
   - servers: `scripts/stack run --db dev --ports -- <cmd>` (use `$API_PORT` / `$WEB_PORT`)
3. Never run `docker`, `docker compose`, `make dev`, `make up` or `make down`. If Postgres/Redis are down: `scripts/stack infra ensure`. Anything destructive: ask the human.
4. Done: `scripts/stack release` (drops your slot's DBs).

Slot N (1–6): API `8100+N`, web `5200+N`, dev DB `app_sN`, test DB `app_test_sN`, Redis `/N`. `scripts/stack ls` / `doctor` show who holds what. After a migration lands on the default branch: `scripts/stack template refresh`. Details: `docs/playbooks/10-parallel-agents.md`.
