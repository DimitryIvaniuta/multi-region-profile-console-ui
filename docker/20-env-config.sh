#!/usr/bin/env sh
set -eu

cat > /usr/share/nginx/html/env.js <<EOF_JS
window.__MRPS_CONFIG__ = {
  primaryBaseUrl: "${MRPS_PRIMARY_BASE_URL:-http://localhost:8080}",
  euReadBaseUrl: "${MRPS_EU_READ_BASE_URL:-http://localhost:8081}",
  usReadBaseUrl: "${MRPS_US_READ_BASE_URL:-http://localhost:8082}",
  apiKey: "${MRPS_API_KEY:-local-api-key}",
  internalKey: "${MRPS_INTERNAL_KEY:-local-internal-key}",
  requestTimeoutMs: ${MRPS_REQUEST_TIMEOUT_MS:-8000}
};
EOF_JS
