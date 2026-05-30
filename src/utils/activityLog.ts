import type { ActivityLogEntry, ActivityOutcome } from '../types/api';

const STORAGE_KEY = 'mrps.console.activity.v1';
const MAX_ENTRIES = 100;

const isActivityLogEntry = (value: unknown): value is ActivityLogEntry => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<ActivityLogEntry>;
  return typeof candidate.id === 'string'
    && typeof candidate.occurredAt === 'string'
    && typeof candidate.action === 'string'
    && typeof candidate.region === 'string'
    && ['SUCCESS', 'FAILED', 'INFO'].includes(String(candidate.outcome));
};

const readRaw = (): readonly ActivityLogEntry[] => {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isActivityLogEntry).slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
};

const writeRaw = (entries: readonly ActivityLogEntry[]): void => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
};

const maskProfileId = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
};

/**
 * Stores an operator-local, non-PII activity trail in session storage for audit-friendly UX.
 * It intentionally masks profile ids and never stores API keys, emails, names, phone numbers or payload bodies.
 */
export const appendActivity = (input: {
  readonly action: string;
  readonly region: string;
  readonly outcome: ActivityOutcome;
  readonly profileId?: string | undefined;
  readonly details?: string | undefined;
}): ActivityLogEntry => {
  const entry: ActivityLogEntry = {
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    action: input.action,
    region: input.region,
    outcome: input.outcome,
    profileRef: maskProfileId(input.profileId),
    details: input.details?.slice(0, 180),
  };
  writeRaw([entry, ...readRaw()]);
  window.dispatchEvent(new CustomEvent('mrps:activity'));
  return entry;
};

export const listActivities = (): readonly ActivityLogEntry[] => readRaw();

export const clearActivities = (): void => {
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('mrps:activity'));
};
