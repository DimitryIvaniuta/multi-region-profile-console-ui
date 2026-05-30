export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const PHONE_PATTERN = /^\+?[0-9 ()-]{7,64}$/u;

export const trimToUndefined = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const isValidUuid = (value: string): boolean => UUID_PATTERN.test(value.trim());

export const validateCreateProfile = (input: {
  readonly email: string;
  readonly displayName: string;
  readonly phone: string;
}): FieldErrors<'email' | 'displayName' | 'phone'> => {
  const errors: FieldErrors<'email' | 'displayName' | 'phone'> = {};
  const email = input.email.trim();
  const displayName = input.displayName.trim();
  const phone = input.phone.trim();

  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    errors.email = 'Use a valid email address, max 320 characters.';
  }
  if (displayName.length < 2 || displayName.length > 160) {
    errors.displayName = 'Display name must be 2-160 characters.';
  }
  if (phone.length > 0 && !PHONE_PATTERN.test(phone)) {
    errors.phone = 'Use digits, spaces, dashes and optional + only.';
  }
  return errors;
};

export const validateUpdateProfile = (input: {
  readonly profileId: string;
  readonly displayName: string;
  readonly phone: string;
}): FieldErrors<'profileId' | 'displayName' | 'phone'> => {
  const errors: FieldErrors<'profileId' | 'displayName' | 'phone'> = {};
  if (!isValidUuid(input.profileId)) {
    errors.profileId = 'Use a valid UUID profile id.';
  }
  if (input.displayName.trim().length < 2 || input.displayName.trim().length > 160) {
    errors.displayName = 'Display name must be 2-160 characters.';
  }
  if (input.phone.trim().length > 0 && !PHONE_PATTERN.test(input.phone.trim())) {
    errors.phone = 'Use digits, spaces, dashes and optional + only.';
  }
  return errors;
};

export const validateReadProfile = (input: {
  readonly profileId: string;
  readonly minVersion: string;
}): FieldErrors<'profileId' | 'minVersion'> => {
  const errors: FieldErrors<'profileId' | 'minVersion'> = {};
  if (!isValidUuid(input.profileId)) {
    errors.profileId = 'Use a valid UUID profile id.';
  }
  if (input.minVersion.trim().length > 0) {
    const value = Number(input.minVersion);
    if (!Number.isSafeInteger(value) || value < 1) {
      errors.minVersion = 'Minimum version must be a positive integer.';
    }
  }
  return errors;
};

export const hasErrors = <T extends string>(errors: FieldErrors<T>): boolean =>
  Object.values(errors).some((value) => typeof value === 'string' && value.length > 0);


const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) && url.username.length === 0 && url.password.length === 0;
  } catch {
    return false;
  }
};

export const validateSettings = (input: {
  readonly primaryBaseUrl: string;
  readonly euReadBaseUrl: string;
  readonly usReadBaseUrl: string;
  readonly apiKey: string;
  readonly internalKey: string;
  readonly requestTimeoutMs: number;
}): FieldErrors<'primaryBaseUrl' | 'euReadBaseUrl' | 'usReadBaseUrl' | 'apiKey' | 'internalKey' | 'requestTimeoutMs'> => {
  const errors: FieldErrors<'primaryBaseUrl' | 'euReadBaseUrl' | 'usReadBaseUrl' | 'apiKey' | 'internalKey' | 'requestTimeoutMs'> = {};
  if (!isValidHttpUrl(input.primaryBaseUrl)) {
    errors.primaryBaseUrl = 'Use an http(s) URL without username/password.';
  }
  if (!isValidHttpUrl(input.euReadBaseUrl)) {
    errors.euReadBaseUrl = 'Use an http(s) URL without username/password.';
  }
  if (!isValidHttpUrl(input.usReadBaseUrl)) {
    errors.usReadBaseUrl = 'Use an http(s) URL without username/password.';
  }
  if (input.apiKey.trim().length < 8 || input.apiKey.trim().length > 256) {
    errors.apiKey = 'API key must be 8-256 characters.';
  }
  if (input.internalKey.trim().length < 8 || input.internalKey.trim().length > 256) {
    errors.internalKey = 'Internal key must be 8-256 characters.';
  }
  if (!Number.isSafeInteger(input.requestTimeoutMs) || input.requestTimeoutMs < 1_000 || input.requestTimeoutMs > 30_000) {
    errors.requestTimeoutMs = 'Timeout must be between 1000 and 30000 ms.';
  }
  return errors;
};
