# Saidit — Dockerized (app + self-hosted Supabase)

This directory runs the **entire app** in Docker: the Next.js frontend plus a
full self-hosted Supabase stack (Postgres, Auth, REST, Realtime, Storage,
imgproxy, Kong, Studio, Meta) and a local mail catcher.

Everything is driven from this `docker/` directory.

## Prerequisites

- Docker Desktop (or Docker Engine) with Compose v2

## Quick start (production image)

```bash
cd docker
docker compose up -d --build
```

On first boot the `app-migrate` one-shot:
1. applies the app schema (`../supabase/migrations/*.sql`),
2. creates the `saidit` + `saidit-defaults` storage buckets,
3. uploads the default avatar assets.

Then the app starts once migration completes.

| Service        | URL                          |
|----------------|------------------------------|
| App            | http://localhost:3000        |
| Supabase API   | http://localhost:8000        |
| Studio (DB UI) | http://localhost:8000 → Studio (login below) |
| Mailpit (mail) | http://localhost:8025        |

Studio login: `supabase` / `this_password_is_insecure_and_should_be_updated`
(from `.env` → `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD`).

## Development (hot reload)

Runs the app with `next dev` and your source bind-mounted, alongside the same
Supabase stack:

```bash
cd docker
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Runs `next dev --webpack` with polling so file watching works over bind mounts.

> ⚠️ **Windows note — hot reload & the C: drive.** If this repo lives on the
> Windows filesystem (e.g. `C:\Users\...`), Docker Desktop's bind mount does
> **not** propagate live file edits into the container, so hot reload won't
> work (the container only sees the snapshot from when it started). This is a
> Docker Desktop limitation, not a config issue. On Windows, choose one of:
>
> 1. **Develop on the host** — run `npm run dev` directly on Windows against
>    the dockerized Supabase (point `.env.local` at `http://localhost:8000`).
>    Best DX; native hot reload. *(Recommended on Windows.)*
> 2. **Move the repo into WSL2** (e.g. `~/git/saidit` inside your WSL distro)
>    and run Docker from there — bind mounts then deliver real file events and
>    container hot reload works.
>
> On macOS and Linux the dev container hot-reloads fine as-is.

## How the URLs work

`NEXT_PUBLIC_SUPABASE_URL` is **baked into the browser bundle** at build time,
so it must be the browser-reachable value (`http://localhost:8000`).
Server-side code (server actions, middleware, admin client) instead uses
`SUPABASE_INTERNAL_URL=http://kong:8000` to reach Kong over the docker network.
Outside Docker both fall back to `NEXT_PUBLIC_SUPABASE_URL`, so local `npm run
dev` against the Supabase CLI stack is unaffected.

## Configuration

All secrets/config live in `./.env`. The committed values are the well-known
Supabase **demo** keys — fine for local use only. **Generate fresh secrets
before any non-local deployment** (`sh utils/generate-keys.sh` from the upstream
supabase/docker repo, then update `.env`).

OAuth (Google/Discord): set `GOOGLE_*` / `GITHUB_*` etc. in `.env` and uncomment
the matching `GOTRUE_EXTERNAL_*` lines in `docker-compose.yml`.

## Stopping / resetting

```bash
docker compose down            # stop, keep data
docker compose down -v         # stop and wipe all volumes (fresh DB + storage)
```

After `down -v`, the next `up` re-runs migrations and re-seeds storage.
