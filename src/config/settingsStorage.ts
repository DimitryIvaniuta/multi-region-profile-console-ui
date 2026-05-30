import { DEFAULT_SETTINGS } from './defaults';
import type { AppSettings } from '../types/api';

const STORAGE_KEY = 'mrps.console.settings.v1';

const sanitizeUrl = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallback;
  }
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) {
      return fallback;
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return fallback;
  }
};

const sanitizeSecret = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 256 ? trimmed : fallback;
};

const sanitizeTimeout = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(Math.trunc(value), 1_000), 30_000);
};

/**
 * Reads console settings from session storage only. Session storage avoids long-lived API key persistence
 * while keeping a practical local-operator workflow during one browser session.
 */
export const loadSettings = (): AppSettings => {
  const fallback = DEFAULT_SETTINGS;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      primaryBaseUrl: sanitizeUrl(parsed.primaryBaseUrl, fallback.primaryBaseUrl),
      euReadBaseUrl: sanitizeUrl(parsed.euReadBaseUrl, fallback.euReadBaseUrl),
      usReadBaseUrl: sanitizeUrl(parsed.usReadBaseUrl, fallback.usReadBaseUrl),
      apiKey: sanitizeSecret(parsed.apiKey, fallback.apiKey),
      internalKey: sanitizeSecret(parsed.internalKey, fallback.internalKey),
      requestTimeoutMs: sanitizeTimeout(parsed.requestTimeoutMs, fallback.requestTimeoutMs),
    };
  } catch {
    return fallback;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const resetSettings = (): AppSettings => {
  window.sessionStorage.removeItem(STORAGE_KEY);
  return DEFAULT_SETTINGS;
};
