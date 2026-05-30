import { useCallback, useEffect, useMemo, useState } from 'react';
import { getBackendHealth, getReplicationLag, getSla } from '../../api/profileApi';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { buildRegionTargets } from '../../config/defaults';
import type { AppSettings, BackendHealthResponse, ConsistencySlaResponse, RegionTarget, ReplicationLagResponse } from '../../types/api';
import { formatDateTime, formatSeconds } from '../../utils/date';

type DashboardPageProps = {
  readonly settings: AppSettings;
};

type RegionSnapshot = {
  readonly region: RegionTarget;
  readonly health: BackendHealthResponse | null;
  readonly sla: ConsistencySlaResponse | null;
  readonly lag: ReplicationLagResponse | null;
  readonly error: string | null;
};

export const DashboardPage = ({ settings }: DashboardPageProps) => {
  const regions = useMemo(() => buildRegionTargets(settings), [settings]);
  const [snapshots, setSnapshots] = useState<readonly RegionSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  const credentials = useMemo(() => ({ apiKey: settings.apiKey, internalKey: settings.internalKey }), [settings.apiKey, settings.internalKey]);

  const load = useCallback(async () => {
    setLoading(true);
    const next = await Promise.all(regions.map(async (region) => {
      try {
        const [health, sla, lag] = await Promise.all([
          getBackendHealth(region.baseUrl, { credentials, timeoutMs: settings.requestTimeoutMs }),
          getSla(region.baseUrl, { credentials, timeoutMs: settings.requestTimeoutMs }),
          getReplicationLag(region.baseUrl, { credentials, timeoutMs: settings.requestTimeoutMs }),
        ]);
        return { region, health, sla, lag, error: null } satisfies RegionSnapshot;
      } catch (error) {
        return {
          region,
          health: null,
          sla: null,
          lag: null,
          error: error instanceof Error ? error.message : 'Region unavailable',
        } satisfies RegionSnapshot;
      }
    }));
    setSnapshots(next);
    setLastRefreshedAt(new Date().toISOString());
    setLoading(false);
  }, [credentials, regions, settings.requestTimeoutMs]);

  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(), 30_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [load]);

  const activeRegions = snapshots.filter((item) => item.error === null).length;
  const healthyRegions = snapshots.filter((item) => item.health?.status === 'UP').length;
  const withinSla = snapshots.filter((item) => item.lag?.withinSla).length;
  const worstLag = snapshots
    .map((item) => item.lag?.lagSeconds)
    .filter((value): value is number => typeof value === 'number')
    .reduce((max, value) => Math.max(max, value), 0);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Global read platform"
        title="Regional profile health overview"
        description="Track eventual-consistency SLA, replication lag, actuator health and operational region availability from one banking-style console."
      />

      <section className="toolbar-card">
        <span className="pill">Last refresh: {formatDateTime(lastRefreshedAt)}</span>
        <Button type="button" variant="ghost" loading={loading} onClick={() => void load()}>Refresh now</Button>
      </section>

      <section className="grid grid--3">
        <StatCard label="Reachable regions" value={`${String(activeRegions)}/${String(regions.length)}`} tone={activeRegions === regions.length ? 'good' : 'warning'} />
        <StatCard label="Healthy regions" value={`${String(healthyRegions)}/${String(regions.length)}`} tone={healthyRegions === regions.length ? 'good' : 'warning'} />
        <StatCard label="Regions within SLA" value={`${String(withinSla)}/${String(regions.length)}`} tone={withinSla === regions.length ? 'good' : 'warning'} />
        <StatCard label="Worst observed lag" value={formatSeconds(worstLag)} tone={worstLag <= 5 ? 'good' : 'warning'} />
      </section>

      {loading ? <Alert type="info" title="Refreshing regional telemetry">Fetching health, SLA and lag from configured regions.</Alert> : null}

      <section className="grid grid--regions">
        {snapshots.map((snapshot) => (
          <article key={snapshot.region.code} className="bank-card region-card">
            <div className="card-title-row">
              <div>
                <h3>{snapshot.region.label}</h3>
                <p>{snapshot.region.baseUrl}</p>
              </div>
              <span className={`pill ${snapshot.error ? 'pill--danger' : snapshot.lag?.withinSla && snapshot.health?.status === 'UP' ? 'pill--good' : 'pill--warning'}`}>
                {snapshot.error ? 'Unavailable' : snapshot.lag?.withinSla && snapshot.health?.status === 'UP' ? 'Healthy' : 'Attention'}
              </span>
            </div>
            {snapshot.error ? <Alert type="error" title="Region check failed">{snapshot.error}</Alert> : (
              <dl className="details-grid details-grid--compact">
                <div><dt>Health</dt><dd>{snapshot.health?.status ?? '—'}</dd></div>
                <div><dt>Model</dt><dd>{snapshot.sla?.model ?? '—'}</dd></div>
                <div><dt>Visibility SLA</dt><dd>{snapshot.sla?.visibilitySlaSeconds ?? '—'}s</dd></div>
                <div><dt>Cache TTL</dt><dd>{snapshot.sla?.cacheTtlSeconds ?? '—'}s</dd></div>
                <div><dt>Lag source</dt><dd>{snapshot.lag?.lagSource ?? '—'}</dd></div>
                <div><dt>Lag</dt><dd>{formatSeconds(snapshot.lag?.lagSeconds)}</dd></div>
                <div><dt>Measured</dt><dd>{formatDateTime(snapshot.lag?.measuredAt)}</dd></div>
              </dl>
            )}
          </article>
        ))}
      </section>
    </div>
  );
};
