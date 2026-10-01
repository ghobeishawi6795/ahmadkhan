# ahmadkhan Messenger — Cloudflare Worker + D1 + PWA

## Stack
- Cloudflare Worker + D1
- D1 only; no R2
- Cookie session authentication
- Image/audio upload in D1 chunks
- Image limit: 5 MiB
- Hourly cleanup for expired media
- Installable PWA (`ahmadkhan`)

## Deploy
```bash
npm install
npx wrangler secret put AUTH_SECRET
npx wrangler d1 migrations apply chat2 --remote
npx wrangler deploy
```

## Demo
Migration 0001 seeds `admin` and `demo`. Migration 0002 sets the initial admin password to `ChangeMe123!`. Change it immediately with the admin password endpoint.

## Migration note
Migrations are ordered one-time schema migrations. Do not manually rerun an already-applied migration against the same D1 database; Wrangler records migration state. Apply them in order.

## PWA
The web app includes `manifest.webmanifest`, `sw.js`, and 192/512 PNG icons. API requests are never cached by the service worker.
