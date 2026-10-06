# 10 · Parallel agents

Several AI agents (or people) working in separate git worktrees of this repo can share one Postgres and one Redis without colliding on ports or databases. `scripts/stack` hands each worktree a **slot**; agent rules are in the "Parallel agents" section of `CLAUDE.md`.

## What a slot gets

| | slot N |
|---|---|
| API / web port | `8100+N` / `5200+N` (`API_PORT`, `WEB_PORT`) |
| dev DB | `app_sN`, cloned from `app_template` (migrated) in well under a second |
| test DB | `app_test_sN`, empty; `tests/conftest.py` builds the schema |
| Redis | DB index `N` |

`scripts/stack run` exports `DATABASE_URL`, `TEST_DATABASE_URL`, `REDIS_URL` and the ports from `.env.slot` before running the command. Config lives in `stack.toml`.

## First time (human, main checkout)

```sh
make setup
scripts/stack infra ensure        # docker compose up db redis (never recreates)
scripts/stack template refresh    # build app_template at this checkout's migration head
```

## Each worktree

```sh
scripts/stack lease me                              # writes .env.slot
make check-backend                                  # pytest in app_test_sN
scripts/stack run --db dev --ports -- bash -c 'cd backend && uv run uvicorn app.api.main:app --port $API_PORT'
scripts/stack ls                                    # who holds what
scripts/stack release                               # drop the slot's DBs, free it
```

After a migration lands on the default branch: `scripts/stack template refresh`. `scripts/stack doctor` shows connections, template revision and heavy-job waits.

## Limits

- Postgres and Redis only. Other services are not sliced.
- One shared Postgres: slots are separate DBs on one server. `--heavy` caps concurrent test suites (`limits.heavy`); it does not isolate CPU or I/O.
- When all slots are taken, a new lease reclaims the oldest slot whose worktree has no running process and was idle longer than `limits.grace_s`, and drops its DBs.
- `scripts/stack infra down|reset` need `STACK_ROLE=human`.
- Needs `uv` (or Python 3.11+ with `psycopg`), `git`, `lsof`. The slot registry lives in `~/.stack/`.
