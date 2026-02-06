# MagAnon server (stub)

This is a placeholder API to unblock frontend work.

## Run

```bash
cd server
npm install
npm run dev
# http://localhost:8787/api/health
```

## Endpoints

- `GET /api/health`
- `POST /api/samples` – bulk ingest (in-memory), requires `opt_in: true`

Planned stack (later):
- Node/Express (or Fastify)
- Postgres + PostGIS
- H3 aggregation
