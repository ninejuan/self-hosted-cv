# Self-Hosted CV

Self-Hosted CV is a ReadCV-inspired portfolio platform for developers, founders, speakers, and creators who want to own their professional profile. It ships with a public CV site, an authenticated admin panel, media uploads, audit logging, Redis-backed sessions and caching, and production-ready Docker deployment assets.

## Features

- Public CV endpoint and React Router web app with SEO metadata and JSON-LD.
- Admin CRUD for profile, sections, work experience, writing, speaking, projects, education, contacts, settings, and LinkedIn imports.
- Redis caching for `GET /api/cv` with 5-minute TTL and automatic invalidation after admin mutations.
- Password login with session storage in Redis, CSRF protection, throttling, audit logs, and optional TOTP 2FA.
- MinIO media upload flow with presigned URLs and hourly cleanup for stale pending uploads.
- Error boundaries, skeleton loading states, and toast notifications in the web app.
- GitHub Actions workflows for linting, tests, builds, audits, multi-arch GHCR images, Trivy scans, and GitHub Releases.

## Tech Stack

- Monorepo: Yarn workspaces, Node.js 22+
- Server: NestJS 11, Sequelize, PostgreSQL, Redis, MinIO, Speakeasy TOTP, `@nestjs/schedule`
- Web: React 19, React Router v7, Tailwind CSS v4, sonner, lucide-react
- Infrastructure: Docker Compose, Nginx, GHCR, GitHub Actions

## Quick Start with Docker Compose

1. Create `.env` in the project root.
2. Start the stack:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

3. Open the public site at `http://localhost`.
4. Open the admin panel at `http://localhost/admin`.

Generate an admin password hash:

```bash
node -e "const bcrypt=require('bcrypt'); bcrypt.hash(process.argv[1], 12).then(console.log)" 'change-me'
```

## Development Setup

Install dependencies:

```bash
yarn install
```

Run backing services:

```bash
docker compose -f docker/docker-compose.dev.yml up -d postgres redis minio
```

Run the apps:

```bash
yarn dev:server
yarn dev:web
```

Useful commands:

```bash
yarn test:server
yarn test:web
yarn build:server
yarn build:web
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | Yes | `development`, `production`, or `test`. |
| `SERVICE_NAME` | Yes | Service name used in structured logs. |
| `PORT` | Yes | NestJS server port. |
| `DB_HOST` | Yes | PostgreSQL host. |
| `DB_PORT` | Yes | PostgreSQL port. |
| `DB_USERNAME` | Yes | PostgreSQL user. |
| `DB_PASSWORD` | Yes | PostgreSQL password. |
| `DB_DATABASE` | Yes | PostgreSQL database. |
| `DB_SCHEMA` | No | Optional PostgreSQL schema. |
| `DB_SSL` | Yes | `true` for SSL database connections. |
| `REDIS_HOST` | Yes | Redis host. |
| `REDIS_PORT` | Yes | Redis port. |
| `REDIS_PASSWORD` | No | Redis password. |
| `REDIS_DB` | Yes | Redis database index. |
| `ADMIN_USERNAME` | Yes | Admin login username. |
| `ADMIN_PASSWORD_HASH` | Yes | Bcrypt hash for the admin password. |
| `SESSION_SECRET` | Yes | Long random secret for signed sessions. |
| `SESSION_IDLE_TIMEOUT` | Yes | Idle session timeout in seconds. |
| `SESSION_MAX_LIFETIME` | Yes | Maximum session lifetime in seconds. |
| `LOGIN_MAX_ATTEMPTS` | Yes | Login attempts allowed before throttling. |
| `LOGIN_LOCKOUT_DURATION` | Yes | Login throttle window in seconds. |
| `MINIO_INTERNAL_ENDPOINT` | Yes | Server-to-MinIO endpoint. |
| `MINIO_PUBLIC_ENDPOINT` | Yes | Browser-facing MinIO endpoint. |
| `MINIO_ACCESS_KEY` | Yes | MinIO access key. |
| `MINIO_SECRET_KEY` | Yes | MinIO secret key. |
| `MINIO_BUCKET` | Yes | Bucket for uploaded media. |
| `VITE_API_URL` | Web | Browser API base path, usually `/api`. |
| `API_INTERNAL_URL` | Web | SSR/server-to-server API URL. |

## Deployment Guide

### VPS

1. Install Docker and Docker Compose.
2. Clone the repository and create a production `.env`.
3. Point DNS to the VPS.
4. Run `docker compose -f docker/docker-compose.yml up -d --build`.
5. Put TLS in front of Nginx with Caddy, Traefik, or a host-managed reverse proxy.
6. Back up PostgreSQL and MinIO volumes regularly.

### Cloud

- Use managed PostgreSQL and Redis where possible.
- Run server and web containers from GHCR:
  - `ghcr.io/ninejuan/cv-server:<tag>`
  - `ghcr.io/ninejuan/cv-web:<tag>`
- Use S3-compatible object storage or MinIO.
- Configure health checks for `/api/health` and `/`.

## Updates

```bash
git pull
yarn install --frozen-lockfile
yarn build:server
yarn build:web
docker compose -f docker/docker-compose.yml up -d --build
```

Database migrations run during server bootstrap. Review release notes before upgrading production.

## TOTP 2FA

After logging in, call the 2FA setup endpoint from an authenticated session or wire it into your admin UI:

- `POST /api/auth/2fa/setup` returns `{ secret, qrCodeDataUrl }`.
- Scan the QR code in an authenticator app.
- `POST /api/auth/2fa/verify` with `{ "code": "123456" }` enables 2FA.
- Future `POST /api/auth/login` requests must include `totpCode` after password verification.
- `POST /api/auth/2fa/disable` disables 2FA after a valid current TOTP code.

The server stores `totp_secret` and `totp_enabled` in `app_settings`.

## LinkedIn Import Guide

1. Export your LinkedIn data from LinkedIn settings.
2. Download the archive ZIP.
3. Sign in to `/admin`.
4. Open the LinkedIn import page.
5. Upload the ZIP, preview detected records, and confirm import.
6. Review imported sections before publishing.

## CI and Releases

- `ci.yml` runs lint, server tests, web typecheck, builds, and `yarn audit` on main pushes and pull requests.
- `release.yml` runs on `v*.*.*` tags, validates the repository, builds multi-arch images, pushes GHCR images, scans with Trivy, and creates a GitHub Release with generated notes.

## Contributing

1. Create a feature branch.
2. Keep changes focused and covered by existing checks.
3. Run `yarn build:server` and `yarn build:web` before opening a pull request.
4. Do not commit secrets or local `.env` files.

## License

MIT
