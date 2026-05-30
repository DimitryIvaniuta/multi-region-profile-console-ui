// Runtime configuration loaded before the React bundle. Values can be replaced by the container entrypoint
// or Kubernetes ConfigMap without rebuilding the static assets.
window.__MRPS_CONFIG__ = window.__MRPS_CONFIG__ || {
  primaryBaseUrl: 'http://localhost:8080',
  euReadBaseUrl: 'http://localhost:8081',
  usReadBaseUrl: 'http://localhost:8082',
  apiKey: 'local-api-key',
  internalKey: 'local-internal-key',
  requestTimeoutMs: 8000,
};
