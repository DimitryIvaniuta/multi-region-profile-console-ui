import { requestJson } from './http';
import type {
  ApiCredentials,
  BackendHealthResponse,
  ConsistencySlaResponse,
  CreateProfileRequest,
  InvalidProfileEventResponse,
  OutboxReplayResponse,
  OutboxStatsResponse,
  ProfileResponse,
  ProfileViewResponse,
  ProjectionWatermarkResponse,
  ReplicationLagResponse,
  UpdateProfileRequest,
} from '../types/api';

type ClientContext = {
  readonly credentials: ApiCredentials;
  readonly timeoutMs: number;
};

export const createProfile = (
  baseUrl: string,
  payload: CreateProfileRequest,
  context: ClientContext,
): Promise<ProfileResponse> =>
  requestJson<ProfileResponse>(baseUrl, '/api/v1/profiles', {
    method: 'POST',
    body: payload,
    auth: 'api',
    ...context,
  });

export const updateProfile = (
  baseUrl: string,
  profileId: string,
  payload: UpdateProfileRequest,
  context: ClientContext,
): Promise<ProfileResponse> =>
  requestJson<ProfileResponse>(baseUrl, `/api/v1/profiles/${encodeURIComponent(profileId)}`, {
    method: 'PUT',
    body: payload,
    auth: 'api',
    ...context,
  });

export const deactivateProfile = (
  baseUrl: string,
  profileId: string,
  context: ClientContext,
): Promise<ProfileResponse> =>
  requestJson<ProfileResponse>(baseUrl, `/api/v1/profiles/${encodeURIComponent(profileId)}`, {
    method: 'DELETE',
    auth: 'api',
    ...context,
  });

export const readProfile = (
  baseUrl: string,
  profileId: string,
  minVersion: number | undefined,
  context: ClientContext,
): Promise<ProfileViewResponse> =>
  requestJson<ProfileViewResponse>(baseUrl, `/api/v1/profiles/${encodeURIComponent(profileId)}`, {
    method: 'GET',
    query: { minVersion },
    auth: 'api',
    ...context,
  });

export const getSla = (baseUrl: string, context: ClientContext): Promise<ConsistencySlaResponse> =>
  requestJson<ConsistencySlaResponse>(baseUrl, '/api/v1/consistency/sla', {
    method: 'GET',
    auth: 'api',
    ...context,
  });

export const getReplicationLag = (baseUrl: string, context: ClientContext): Promise<ReplicationLagResponse> =>
  requestJson<ReplicationLagResponse>(baseUrl, '/internal/replication/lag', {
    method: 'GET',
    auth: 'internal',
    ...context,
  });

export const getWatermarks = (baseUrl: string, context: ClientContext): Promise<readonly ProjectionWatermarkResponse[]> =>
  requestJson<ProjectionWatermarkResponse[]>(baseUrl, '/internal/projection/watermarks', {
    method: 'GET',
    auth: 'internal',
    ...context,
  });

export const getInvalidEvents = (
  baseUrl: string,
  limit: number,
  context: ClientContext,
): Promise<readonly InvalidProfileEventResponse[]> =>
  requestJson<InvalidProfileEventResponse[]>(baseUrl, '/internal/projection/invalid-events', {
    method: 'GET',
    query: { limit },
    auth: 'internal',
    ...context,
  });

export const getOutboxStats = (baseUrl: string, context: ClientContext): Promise<OutboxStatsResponse> =>
  requestJson<OutboxStatsResponse>(baseUrl, '/internal/outbox/stats', {
    method: 'GET',
    auth: 'internal',
    ...context,
  });

export const replayOutbox = (
  baseUrl: string,
  limit: number,
  context: ClientContext,
): Promise<OutboxReplayResponse> =>
  requestJson<OutboxReplayResponse>(baseUrl, '/internal/outbox/replay', {
    method: 'POST',
    query: { limit },
    auth: 'internal',
    ...context,
  });


export const getBackendHealth = (baseUrl: string, context: ClientContext): Promise<BackendHealthResponse> =>
  requestJson<BackendHealthResponse>(baseUrl, '/actuator/health', {
    method: 'GET',
    auth: 'none',
    ...context,
  });
