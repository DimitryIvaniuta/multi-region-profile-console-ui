# Multi-Region Profile Console

Production-grade React 19.2 + TypeScript frontend for the **Multi-Region Read-Heavy Profile Service** backend.

## GitHub repository

**Repository name:** `multi-region-profile-console-ui`

**Description:** Banking-style React 19.2 operations console for a multi-region read-heavy profile service with primary writes, regional reads, consistency SLA monitoring, cross-region comparison, projection watermarks, local operator audit and outbox operations.

## Technology choices

- React `19.2.6` and React DOM `19.2.6`.
- Vite `8.0.14` with `@vitejs/plugin-react` `6.0.2`.
- TypeScript `6.0.3` in strict mode.
- Playwright `1.60.0` for essential e2e tests.
- Minimal runtime dependencies to reduce npm supply-chain exposure.
- No React Server Components, no SSR, no `dangerouslySetInnerHTML`.

## Backend endpoints covered

| Screen | Endpoint |
| --- | --- |
| Dashboard | `GET /actuator/health`, `GET /api/v1/consistency/sla`, `GET /internal/replication/lag` |
| Create Profile | `POST /api/v1/profiles` |
| Update Profile | `PUT /api/v1/profiles/{profileId}` |
| Deactivate Profile | `DELETE /api/v1/profiles/{profileId}` |
| Regional Read | `GET /api/v1/profiles/{profileId}?minVersion=` |
| Region Compare | `GET /api/v1/profiles/{profileId}?minVersion=` against all regions |
| Projection Watermarks | `GET /internal/projection/watermarks` |
| Invalid Events | `GET /internal/projection/invalid-events?limit=` |
| Outbox Stats | `GET /internal/outbox/stats` |
| Outbox Replay | `POST /internal/outbox/replay?limit=` |
| Settings Check | `GET /actuator/health` against all regions |

## Production upgrades in this version

- Runtime `public/env.js` config so one immutable Docker image can be promoted across environments.
- Docker entrypoint writes `env.js` from `MRPS_*` environment variables.
- Idempotent GET retry with small exponential backoff and jitter.
- Cross-region profile comparison screen for version skew and replica drift.
- Actuator health checks on dashboard and settings page.
- Session-local operator activity audit with masked profile refs and no PII/secrets.
- Error boundary with fail-closed UI.
- Stronger settings validation for URLs, secrets and timeout bounds.
- Extra e2e coverage for region comparison and activity audit.
- Accessibility improvements: skip link and visible focus styles.

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Default backend URLs:

- Primary: `http://localhost:8080`
- EU read: `http://localhost:8081`
- US read: `http://localhost:8082`

Default keys match the backend local profile:

- `X-API-Key: local-api-key`
- `X-Internal-Key: local-internal-key`

You can change them in **Connection Settings**. Values are stored in browser session storage only.

## Verification

```bash
npm run lint
npm run build
npm run audit
npx playwright install chromium
npm run test:e2e
# Optional locked-down Linux runners:
# PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

## Security notes

- API and internal keys are sent only in headers.
- Keys are not placed in query strings or URLs.
- Runtime key settings use session storage instead of local storage.
- Forms are controlled and validated before API calls.
- React automatically escapes rendered text; this project does not use raw HTML injection.
- CSP is configured in `index.html` and `nginx.conf`.
- The dependency graph is intentionally small; avoid adding large UI/state packages unless the value clearly outweighs supply-chain risk.

## Production deployment

```bash
docker build -t multi-region-profile-console-ui:latest .
docker run --rm -p 8088:8080 \
  -e MRPS_PRIMARY_BASE_URL=https://primary-api.example.com \
  -e MRPS_EU_READ_BASE_URL=https://eu-api.example.com \
  -e MRPS_US_READ_BASE_URL=https://us-api.example.com \
  multi-region-profile-console-ui:latest
```

For real environments, update CSP `connect-src` in `index.html`/`nginx.conf` to include the actual regional API domains.
