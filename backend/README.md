# EduAI Backend (FastAPI)

Replaces direct frontend-to-Supabase access (`auth.js`, `supabase.js`) with a
server-side API. Supabase stays as the Postgres database, accessed here only
via the service-role key.

## Setup

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in SUPABASE_SERVICE_KEY and JWT_SECRET
```

Run the SQL in `migrations/001_init.sql` against the Supabase project once
(SQL editor or psql) before starting the API.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Test

```bash
pytest
```

## Notes

- Never put `SUPABASE_SERVICE_KEY` or `JWT_SECRET` in the frontend or commit
  them — `.env` is gitignored.
- See `/Users/sunnatbek/.claude/plans/sharded-hatching-frost.md` for the full
  migration plan and rollout phases.
