import type { ApiCredentials, ErrorResponse } from '../types/api';
import { safeMessage } from '../utils/security';

type AuthMode = 'api' | 'internal' | 'none';

type RequestOptions = {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly body?: unknown;
  readonly query?: Readonly<Record<string, string | number | boolean | undefined | null>>;
  readonly auth?: AuthMode;
  readonly credentials: ApiCredentials;
  readonly timeoutMs: number;
  readonly retries?: number;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly path: string | undefined;
  readonly retryable: boolean;

  constructor(status: number, code: string, message: string, path?: string, retryable = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.path = path;
    this.retryable = retryable;
  }
}

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

const buildUrl = (
  baseUrl: string,
  path: string,
  query?: RequestOptions['query'],
): string => {
  const url = new URL(path, `${baseUrl.replace(/\/$/, '')}/`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).length > 0) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

const parseError = async (response: Response): Promise<ApiError> => {
  try {
    const payload = (await response.json()) as Partial<ErrorResponse>;
    return new ApiError(
      response.status,
      payload.code ?? `HTTP_${String(response.status)}`,
      safeMessage(payload.message ?? response.statusText),
      payload.path,
      RETRYABLE_STATUSES.has(response.status),
    );
  } catch {
    return new ApiError(
      response.status,
      `HTTP_${String(response.status)}`,
      safeMessage(response.statusText),
      undefined,
      RETRYABLE_STATUSES.has(response.status),
    );
  }
  throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach selected backend region.');
};

const delay = (attempt: number): Promise<void> => {
  const jitterMs = Math.floor(Math.random() * 80);
  const backoffMs = Math.min(1_000, 150 * 2 ** attempt) + jitterMs;
  return new Promise((resolve) => window.setTimeout(resolve, backoffMs));
};

const canRetry = (method: RequestOptions['method'], retries: number, error: ApiError, attempt: number): boolean =>
  method === 'GET' && attempt < retries && error.retryable;

/**
 * Minimal hardened API client for this console. It sends secrets only as headers,
 * attaches correlation ids, times out slow calls, retries only idempotent reads, and never logs PII/API keys.
 */
export const requestJson = async <T>(
  baseUrl: string,
  path: string,
  options: RequestOptions,
): Promise<T> => {
  const method = options.method ?? 'GET';
  const retries = options.retries ?? (method === 'GET' ? 2 : 0);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs);
    const headers = new Headers({
      Accept: 'application/json',
      'X-Correlation-Id': crypto.randomUUID(),
    });

    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    if (options.auth === 'api') {
      headers.set('X-API-Key', options.credentials.apiKey);
    }
    if (options.auth === 'internal') {
      headers.set('X-Internal-Key', options.credentials.internalKey);
    }

    try {
      const init: RequestInit = {
        method,
        headers,
        signal: controller.signal,
        cache: 'no-store',
        credentials: 'omit',
      };
      if (options.body !== undefined) {
        init.body = JSON.stringify(options.body);
      }

      const response = await fetch(buildUrl(baseUrl, path, options.query), init);

      if (!response.ok) {
        throw await parseError(response);
      }
      if (response.status === 204) {
        return undefined as T;
      }
      return (await response.json()) as T;
    } catch (error) {
      const normalizedError = (() => {
        if (error instanceof ApiError) {
          return error;
        }
        if (error instanceof DOMException && error.name === 'AbortError') {
          return new ApiError(408, 'REQUEST_TIMEOUT', 'The backend did not respond before the console timeout.', undefined, true);
        }
        return new ApiError(0, 'NETWORK_ERROR', 'Cannot reach selected backend region.', undefined, true);
      })();

      if (canRetry(method, retries, normalizedError, attempt)) {
        window.clearTimeout(timeout);
        await delay(attempt);
        continue;
      }
      throw normalizedError;
    } finally {
      window.clearTimeout(timeout);
    }
  }
  throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach selected backend region.');
};
