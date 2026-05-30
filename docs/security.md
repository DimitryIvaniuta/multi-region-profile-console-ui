# Security Review

## Implemented controls

- Strict TypeScript configuration.
- No `dangerouslySetInnerHTML` usage.
- API keys are never added to URLs.
- Secrets are stored in session storage only.
- Runtime `env.js` is no-store cached in nginx.
- CSP blocks frames and remote scripts.
- `Referrer-Policy: no-referrer` reduces accidental leakage.
- `credentials: 'omit'` prevents ambient cookie usage.
- All backend inputs are validated client-side before submission.
- Error rendering is line-break stripped and length limited.
- Error boundary avoids blank-screen failures and leaked stack traces in UI.
- Local activity audit masks profile ids and never stores payloads, emails, phone numbers or API keys.
- Idempotent read retry only; writes are not auto-retried by the browser.

## Production recommendations

- Replace local API keys with an enterprise OIDC/BFF pattern for real user-facing deployments.
- Serve the frontend and backend through HTTPS-only domains.
- Update CSP `connect-src` to exact production API origins.
- Use server-side audit logging for privileged internal operations.
- Keep dependency updates gated by lockfile review and `npm audit`/SCA scans.
- Run Playwright e2e tests in CI with installed browsers.
