import type { AppSettings } from '../types/api';

type RuntimeWindow = Window & {
  readonly __MRPS_CONFIG__?: Partial<AppSettings>;
};

const runtimeWindow = window as RuntimeWindow;

const envValue = (key: string, fallback: string): string => {
  const value = (import.meta.env as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
};

const runtimeValue = (key: keyof AppSettings, fallback: string): string => {
  const value = runtimeWindow.__MRPS_CONFIG__?.[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
};

const runtimeNumber = (key: keyof AppSettings, fallback: number): number => {
  const value = runtimeWindow.__MRPS_CONFIG__?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

/**
 * Builds immutable application defaults from runtime config first and build-time Vite variables second.
 * This allows Docker/Kubernetes deployments to point the same immutable image at different regions.
 */
export const loadRuntimeDefaults = (): AppSettings => Object.freeze({
  primaryBaseUrl: runtimeValue('primaryBaseUrl', envValue('VITE_PRIMARY_BASE_URL', 'http://localhost:8080')),
  euReadBaseUrl: runtimeValue('euReadBaseUrl', envValue('VITE_EU_READ_BASE_URL', 'http://localhost:8081')),
  usReadBaseUrl: runtimeValue('usReadBaseUrl', envValue('VITE_US_READ_BASE_URL', 'http://localhost:8082')),
  apiKey: runtimeValue('apiKey', envValue('VITE_API_KEY', 'local-api-key')),
  internalKey: runtimeValue('internalKey', envValue('VITE_INTERNAL_KEY', 'local-internal-key')),
  requestTimeoutMs: runtimeNumber('requestTimeoutMs', 8_000),
});
