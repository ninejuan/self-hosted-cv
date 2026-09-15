# Deployment Guide

## Quick Install (One Command)

```bash
curl -fsSL https://raw.githubusercontent.com/ninejuan/self-hosted-cv/main/install.sh | bash
```

This will:
1. Check for Docker and Docker Compose
2. Clone the repository to `~/self-hosted-cv`
3. Generate `.env` with secure random passwords
4. Build and start all containers
5. Print your admin credentials

After install, open `http://<your-server-ip>` for the public CV and `http://<your-server-ip>/admin` to log in.

## Manual Install

```bash
git clone https://github.com/ninejuan/self-hosted-cv.git
cd self-hosted-cv
cp .env.example .env
```

Edit `.env` — at minimum change these:

```
ADMIN_PASSWORD=<strong-password>
SESSION_SECRET=<random-64-char-string>
TOTP_ENCRYPTION_KEY=<output-of-openssl-rand-base64-32>
POSTGRES_PASSWORD=<random-password>
MINIO_SECRET_KEY=<random-password>
```

Then start:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

## Requirements

- Docker 24+ with Compose v2
- 1 GB RAM minimum (2 GB recommended)
- 5 GB disk (images + build cache)
- Ports: 80 (HTTP)

## Architecture

```
:80 → Nginx
       ├── /api/*     → NestJS server (:3000)
       ├── /minio/*   → MinIO (:9000)
       └── /*         → React Router web (:3000)

Internal:
  PostgreSQL (:5432)
  Redis (:6379)
  MinIO (:9000)
```

All services run in a single `cv-network` bridge. Only port 80 is exposed.

## Site Scripts and Analytics

Arbitrary custom head scripts are not supported. The public CV and admin API share an origin, so injected JavaScript could read browser-held CSRF data and call authenticated admin endpoints. Existing `customHeadScripts` values in the database are ignored and are removed the next time site settings are saved.

Google Analytics is the only allowlisted script integration. In **Settings → Integrations**, enter a GA measurement ID matching `G-` followed by 4-20 uppercase letters or digits, or leave it empty to disable analytics. The application rejects other values.

Analytics initialization does not use an inline script. The public document loads the fixed same-origin `/google-analytics.js` bootstrap, which validates the measurement ID again before loading `https://www.googletagmanager.com/gtag/js`. The NestJS CSP keeps its per-request nonce, does not allow `unsafe-inline` for scripts, and allowlists only `https://www.googletagmanager.com` in `script-src` and `https://www.google-analytics.com` in `connect-src` for analytics.

In the default topology, NestJS serves `/api/*` while React Router serves HTML. A reverse proxy that adds CSP to HTML responses must apply the same Google origins and provide a matching nonce to React Router's inline framework and theme scripts. Do not add `unsafe-inline` to `script-src`. Static exports have no server-generated nonce; configure their hosting CSP with reviewed script hashes or another host-supported policy.

## TLS / HTTPS

The default stack exposes HTTP on port 80. For production HTTPS, put a reverse proxy in front:

### Caddy (easiest)

```
your-domain.com {
    reverse_proxy localhost:80
}
```

### Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:80
```

### Traefik / Nginx Proxy Manager

Point your proxy to `localhost:80` and configure TLS certificates.

## Custom Domain

1. Point your domain's DNS A record to your server IP
2. Update `.env`:
   ```
   APP_URL=https://your-domain.com
   CORS_ORIGIN=https://your-domain.com
   ```
3. Restart: `docker compose -f docker/docker-compose.yml up -d`

## Update

Re-run the install script — it pulls the latest code and rebuilds:

```bash
curl -fsSL https://raw.githubusercontent.com/ninejuan/self-hosted-cv/main/install.sh | bash
```

Or manually:

```bash
cd ~/self-hosted-cv
git pull origin main
docker compose -f docker/docker-compose.yml up -d --build
```

Your `.env` and database volumes are preserved across updates.

## Backup

```bash
cd ~/self-hosted-cv

docker compose -f docker/docker-compose.yml exec postgres \
  pg_dump -U cv_user cv > backup-$(date +%Y%m%d).sql

docker cp cv-minio:/data ./minio-backup-$(date +%Y%m%d)
```

## Restore

```bash
cat backup-20260427.sql | docker compose -f docker/docker-compose.yml exec -T postgres \
  psql -U cv_user cv

docker cp ./minio-backup-20260427/. cv-minio:/data
docker compose -f docker/docker-compose.yml restart minio
```

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `ADMIN_USERNAME` | `admin` | Admin login username |
| `ADMIN_PASSWORD` | `changeme` | Admin login password |
| `SESSION_SECRET` | — | Session encryption key (required) |
| `TOTP_ENCRYPTION_KEY` | — | Base64-encoded 32-byte TOTP secret encryption key (required in production) |
| `POSTGRES_PASSWORD` | `cv_password` | Database password |
| `MINIO_SECRET_KEY` | `minioadmin123` | Object storage password |
| `APP_URL` | `http://localhost` | Public URL for OG tags and links |
| `CORS_ORIGIN` | `http://localhost` | Allowed CORS origin |
| `DISABLE_UPDATE_CHECK` | `false` | Disable GitHub release check |

Full list: `.env.example`

## Troubleshooting

### Containers not starting

```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs server --tail 50
```

### Database migration failed

```bash
docker compose -f docker/docker-compose.yml logs server | grep -i migration
```

If a migration is stuck, restart the server:

```bash
docker compose -f docker/docker-compose.yml restart server
```

### Port 80 already in use

Either stop the conflicting service or change the nginx port in `docker/docker-compose.yml`:

```yaml
nginx:
  ports:
    - "8080:80"
```

### Reset everything

```bash
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d --build
```

This destroys all data. Use backup/restore if you need to preserve data.

## Uninstall

```bash
docker compose -f ~/self-hosted-cv/docker/docker-compose.yml down -v
rm -rf ~/self-hosted-cv
```
