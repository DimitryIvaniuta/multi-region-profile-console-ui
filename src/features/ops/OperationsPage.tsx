import { useMemo, useState } from 'react';
import { getInvalidEvents, getOutboxStats, getReplicationLag, getWatermarks, replayOutbox } from '../../api/profileApi';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { DataTable } from '../../components/DataTable';
import { Field, SelectField } from '../../components/Field';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { buildRegionTargets } from '../../config/defaults';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type {
  AppSettings,
  InvalidProfileEventResponse,
  OutboxReplayResponse,
  OutboxStatsResponse,
  ProjectionWatermarkResponse,
  RegionCode,
  ReplicationLagResponse,
} from '../../types/api';
import { appendActivity } from '../../utils/activityLog';
import { formatDateTime, formatSeconds } from '../../utils/date';

type OperationsPageProps = {
  readonly settings: AppSettings;
};

type OpsSnapshot = {
  readonly lag: ReplicationLagResponse;
  readonly watermarks: readonly ProjectionWatermarkResponse[];
  readonly invalidEvents: readonly InvalidProfileEventResponse[];
  readonly outboxStats: OutboxStatsResponse;
};

export const OperationsPage = ({ settings }: OperationsPageProps) => {
  const regions = useMemo(() => buildRegionTargets(settings), [settings]);
  const [regionCode, setRegionCode] = useState<RegionCode>('eu');
  const [invalidLimit, setInvalidLimit] = useState('50');
  const [replayLimit, setReplayLimit] = useState('100');
  const selectedRegion = regions.find((region) => region.code === regionCode) ?? {
    code: 'primary',
    label: 'Primary Write Region',
    role: 'PRIMARY',
    baseUrl: settings.primaryBaseUrl,
  } as const;
  const loadAction = useAsyncAction<OpsSnapshot>();
  const replayAction = useAsyncAction<OutboxReplayResponse>();
  const context = {
    credentials: { apiKey: settings.apiKey, internalKey: settings.internalKey },
    timeoutMs: settings.requestTimeoutMs,
  };

  const load = async () => {
    const safeLimit = Math.min(Math.max(Number(invalidLimit) || 50, 1), 500);
    const loaded = await loadAction.run(async () => {
      const [lag, watermarks, invalidEvents, outboxStats] = await Promise.all([
        getReplicationLag(selectedRegion.baseUrl, context),
        getWatermarks(selectedRegion.baseUrl, context),
        getInvalidEvents(selectedRegion.baseUrl, safeLimit, context),
        getOutboxStats(selectedRegion.baseUrl, context),
      ]);
      return { lag, watermarks, invalidEvents, outboxStats };
    });
    appendActivity({
      action: 'REFRESH_OPERATIONS',
      region: selectedRegion.code,
      outcome: loaded ? 'SUCCESS' : 'FAILED',
      details: loaded ? `Loaded ${String(loaded.watermarks.length)} watermark(s) and ${String(loaded.invalidEvents.length)} invalid event(s).` : 'Operations refresh failed.',
    });
  };

  const replay = async () => {
    const safeLimit = Math.min(Math.max(Number(replayLimit) || 100, 1), 500);
    const replayed = await replayAction.run(() => replayOutbox(settings.primaryBaseUrl, safeLimit, context));
    appendActivity({
      action: 'REPLAY_OUTBOX',
      region: 'primary',
      outcome: replayed ? 'SUCCESS' : 'FAILED',
      details: replayed ? `Submitted ${String(replayed.submitted)} outbox event(s).` : 'Outbox replay failed.',
    });
  };

  const statsEntries = Object.entries(loadAction.data?.outboxStats.countsByStatus ?? {});

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="SRE operations"
        title="Replication and outbox operations"
        description="Inspect lag, projection watermarks, invalid event quarantine and transactional outbox state. Replay is restricted to the primary region."
      />

      <section className="bank-card form-card form-card--inline">
        <SelectField label="Ops region" value={regionCode} onChange={(e) => setRegionCode(e.target.value as RegionCode)}>
          {regions.map((region) => <option key={region.code} value={region.code}>{region.label}</option>)}
        </SelectField>
        <Field label="Invalid event limit" value={invalidLimit} onChange={(e) => setInvalidLimit(e.target.value)} inputMode="numeric" />
        <Field label="Replay limit" value={replayLimit} onChange={(e) => setReplayLimit(e.target.value)} inputMode="numeric" />
        <div className="form-actions form-actions--inline">
          <Button type="button" loading={loadAction.loading} onClick={() => void load()}>Refresh operations</Button>
          <Button type="button" variant="secondary" loading={replayAction.loading} onClick={() => void replay()}>Replay outbox</Button>
        </div>
      </section>

      {loadAction.error ? <Alert type="error" title="Operations load failed">{loadAction.error}</Alert> : null}
      {replayAction.error ? <Alert type="error" title="Replay failed">{replayAction.error}</Alert> : null}
      {replayAction.data ? <Alert type="success" title="Replay submitted">Submitted {replayAction.data.submitted} events from requested limit {replayAction.data.requestedLimit}.</Alert> : null}

      <section className="grid grid--3">
        <StatCard label="Lag" value={formatSeconds(loadAction.data?.lag.lagSeconds)} tone={loadAction.data?.lag.withinSla ? 'good' : 'warning'} />
        <StatCard label="SLA" value={loadAction.data ? `${String(loadAction.data.lag.visibilitySlaSeconds)}s` : '—'} />
        <StatCard label="Lag source" value={loadAction.data?.lag.lagSource ?? '—'} />
      </section>

      <section className="bank-card">
        <div className="card-title-row"><h3>Outbox status</h3><span className="pill">{settings.primaryBaseUrl}</span></div>
        <div className="stats-row">
          {statsEntries.length === 0 ? <p className="empty-text">No outbox stats loaded.</p> : statsEntries.map(([status, count]) => (
            <StatCard key={status} label={status} value={count} tone={status === 'EXHAUSTED' ? 'danger' : status === 'FAILED' ? 'warning' : 'neutral'} />
          ))}
        </div>
      </section>

      <section className="bank-card">
        <div className="card-title-row"><h3>Projection watermarks</h3><span className="pill">{selectedRegion.label}</span></div>
        <DataTable
          emptyText="No watermarks loaded."
          rows={loadAction.data?.watermarks ?? []}
          columns={[
            { key: 'topic', header: 'Topic', render: (row) => row.topicName },
            { key: 'partition', header: 'Partition', render: (row) => row.partitionId },
            { key: 'offset', header: 'Offset', render: (row) => row.currentOffset },
            { key: 'eventTime', header: 'Latest event', render: (row) => formatDateTime(row.latestEventTime) },
            { key: 'consumed', header: 'Consumed', render: (row) => formatDateTime(row.lastConsumedAt) },
            { key: 'region', header: 'Region', render: (row) => row.region },
          ]}
        />
      </section>

      <section className="bank-card">
        <div className="card-title-row"><h3>Invalid event quarantine</h3><span className="pill">Limited view</span></div>
        <DataTable
          emptyText="No invalid events loaded."
          rows={loadAction.data?.invalidEvents ?? []}
          columns={[
            { key: 'id', header: 'ID', render: (row) => row.id },
            { key: 'topic', header: 'Topic', render: (row) => row.topicName },
            { key: 'partition', header: 'Partition', render: (row) => row.partitionId },
            { key: 'offset', header: 'Offset', render: (row) => row.recordOffset },
            { key: 'error', header: 'Error', render: (row) => row.error },
            { key: 'occurred', header: 'Occurred', render: (row) => formatDateTime(row.occurredAt) },
          ]}
        />
      </section>
    </div>
  );
};
