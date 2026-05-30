export type ProfileStatus = 'ACTIVE' | 'INACTIVE';

export type RegionCode = 'primary' | 'eu' | 'us';

export type RegionTarget = {
  readonly code: RegionCode;
  readonly label: string;
  readonly role: 'PRIMARY' | 'READ_REPLICA';
  readonly baseUrl: string;
};

export type ProfileResponse = {
  readonly profileId: string;
  readonly email: string;
  readonly displayName: string;
  readonly phone: string | null;
  readonly status: ProfileStatus;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProfileViewResponse = ProfileResponse & {
  readonly sourceRegion: string;
  readonly eventId: string;
  readonly eventTime: string;
  readonly replicatedAt: string;
  readonly replicationLagSeconds: number;
  readonly withinSla: boolean;
};

export type CreateProfileRequest = {
  readonly email: string;
  readonly displayName: string;
  readonly phone?: string;
};

export type UpdateProfileRequest = {
  readonly displayName: string;
  readonly phone?: string;
};

export type ConsistencySlaResponse = {
  readonly region: string;
  readonly role: string;
  readonly visibilitySlaSeconds: number;
  readonly cacheTtlSeconds: number;
  readonly model: string;
};

export type ReplicationLagResponse = {
  readonly region: string;
  readonly role: string;
  readonly latestEventTime: string | null;
  readonly measuredAt: string;
  readonly lagSeconds: number | null;
  readonly visibilitySlaSeconds: number;
  readonly withinSla: boolean;
  readonly lagSource: string;
};

export type BackendHealthResponse = {
  readonly status: string;
  readonly components?: Record<string, { readonly status?: string }>;
};

export type ProjectionWatermarkResponse = {
  readonly topicName: string;
  readonly partitionId: number;
  readonly currentOffset: number;
  readonly latestEventTime: string;
  readonly lastConsumedAt: string;
  readonly region: string;
};

export type InvalidProfileEventResponse = {
  readonly id: number;
  readonly topicName: string;
  readonly partitionId: number;
  readonly recordOffset: number;
  readonly recordKey: string | null;
  readonly error: string;
  readonly occurredAt: string;
  readonly region: string;
};

export type OutboxStatsResponse = {
  readonly countsByStatus: Record<string, number>;
};

export type OutboxReplayResponse = {
  readonly requestedLimit: number;
  readonly submitted: number;
};

export type ErrorResponse = {
  readonly code: string;
  readonly message: string;
  readonly path: string;
  readonly timestamp: string;
};

export type ApiCredentials = {
  readonly apiKey: string;
  readonly internalKey: string;
};

export type AppSettings = ApiCredentials & {
  readonly primaryBaseUrl: string;
  readonly euReadBaseUrl: string;
  readonly usReadBaseUrl: string;
  readonly requestTimeoutMs: number;
};

export type ActivityOutcome = 'SUCCESS' | 'FAILED' | 'INFO';

export type ActivityLogEntry = {
  readonly id: string;
  readonly occurredAt: string;
  readonly action: string;
  readonly region: string;
  readonly outcome: ActivityOutcome;
  readonly profileRef?: string | undefined;
  readonly details?: string | undefined;
};
