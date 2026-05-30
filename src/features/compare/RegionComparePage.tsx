import { useMemo, useState } from 'react';
import { readProfile } from '../../api/profileApi';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { DataTable } from '../../components/DataTable';
import { Field } from '../../components/Field';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { buildRegionTargets } from '../../config/defaults';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { AppSettings, ProfileViewResponse, RegionTarget } from '../../types/api';
import { appendActivity } from '../../utils/activityLog';
import { formatDateTime, formatSeconds } from '../../utils/date';
import { hasErrors, validateReadProfile, type FieldErrors } from '../../utils/validation';

type RegionComparePageProps = {
  readonly settings: AppSettings;
};

type CompareRow = {
  readonly region: RegionTarget;
  readonly result: ProfileViewResponse | null;
  readonly error: string | null;
};

type CompareResult = {
  readonly rows: readonly CompareRow[];
  readonly expectedVersion: number | null;
};

const versionSkew = (rows: readonly CompareRow[]): number | null => {
  const versions = rows
    .map((row) => row.result?.version)
    .filter((value): value is number => typeof value === 'number');
  return versions.length > 1 ? Math.max(...versions) - Math.min(...versions) : null;
};

/**
 * Reads one profile from every configured region and compares versions/SLA to expose replica drift quickly.
 */
export const RegionComparePage = ({ settings }: RegionComparePageProps) => {
  const regions = useMemo(() => buildRegionTargets(settings), [settings]);
  const [profileId, setProfileId] = useState('');
  const [minVersion, setMinVersion] = useState('');
  const [errors, setErrors] = useState<FieldErrors<'profileId' | 'minVersion'>>({});
  const action = useAsyncAction<CompareResult>();

  const context = {
    credentials: { apiKey: settings.apiKey, internalKey: settings.internalKey },
    timeoutMs: settings.requestTimeoutMs,
  };

  const submit = async () => {
    const validation = validateReadProfile({ profileId, minVersion });
    setErrors(validation);
    if (hasErrors(validation)) {
      return;
    }
    const parsedVersion = minVersion.trim().length > 0 ? Number(minVersion) : undefined;
    await action.run(async () => {
      const rows = await Promise.all(regions.map(async (region): Promise<CompareRow> => {
        try {
          const result = await readProfile(region.baseUrl, profileId.trim(), parsedVersion, context);
          return { region, result, error: null };
        } catch (error) {
          return { region, result: null, error: error instanceof Error ? error.message : 'Read failed' };
        }
      }));
      const failures = rows.filter((row) => row.error !== null).length;
      appendActivity({
        action: 'COMPARE_REGIONS',
        region: 'all-regions',
        profileId: profileId.trim(),
        outcome: failures === 0 ? 'SUCCESS' : 'FAILED',
        details: failures === 0 ? 'All configured regions returned a profile view.' : `${String(failures)} region(s) failed the comparison read.`,
      });
      return { rows, expectedVersion: parsedVersion ?? null };
    });
  };

  const skew = action.data ? versionSkew(action.data.rows) : null;
  const reachable = action.data?.rows.filter((row) => row.error === null).length ?? 0;
  const withinSla = action.data?.rows.filter((row) => row.result?.withinSla).length ?? 0;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Consistency diagnostics"
        title="Compare one profile across regions"
        description="Run a controlled cross-region read to detect version skew, read-model drift and SLA breaches after a primary-region mutation."
      />

      <section className="bank-card form-card form-card--inline">
        <Field label="Profile ID" name="profileId" value={profileId} onChange={(e) => setProfileId(e.target.value)} error={errors.profileId} autoComplete="off" />
        <Field label="Minimum version" name="minVersion" value={minVersion} onChange={(e) => setMinVersion(e.target.value)} error={errors.minVersion} hint="Optional read-your-writes guard." inputMode="numeric" autoComplete="off" />
        <div className="form-actions form-actions--inline">
          <Button type="button" loading={action.loading} onClick={() => void submit()}>Compare regions</Button>
          <Button type="button" variant="ghost" onClick={action.reset}>Clear result</Button>
        </div>
      </section>

      {action.error ? <Alert type="error" title="Comparison failed">{action.error}</Alert> : null}

      <section className="grid grid--3">
        <StatCard label="Reachable regions" value={`${String(reachable)}/${String(regions.length)}`} tone={reachable === regions.length ? 'good' : 'warning'} />
        <StatCard label="Within SLA" value={`${String(withinSla)}/${String(regions.length)}`} tone={withinSla === regions.length ? 'good' : 'warning'} />
        <StatCard label="Version skew" value={skew === null ? '—' : String(skew)} tone={skew === 0 ? 'good' : 'warning'} />
      </section>

      <section className="bank-card">
        <div className="card-title-row">
          <div>
            <h3>Regional comparison matrix</h3>
            <p>{action.data?.expectedVersion ? `Minimum accepted version: ${String(action.data.expectedVersion)}` : 'No minimum version required.'}</p>
          </div>
          <span className="pill">Primary + read regions</span>
        </div>
        <DataTable
          emptyText="Run comparison to inspect region drift."
          rows={action.data?.rows ?? []}
          columns={[
            { key: 'region', header: 'Region', render: (row) => row.region.label },
            { key: 'status', header: 'Status', render: (row) => row.error ? <span className="pill pill--danger">Failed</span> : row.result?.withinSla ? <span className="pill pill--good">Within SLA</span> : <span className="pill pill--warning">Lagging</span> },
            { key: 'version', header: 'Version', render: (row) => row.result?.version ?? '—' },
            { key: 'source', header: 'Source region', render: (row) => row.result?.sourceRegion ?? '—' },
            { key: 'lag', header: 'Lag', render: (row) => formatSeconds(row.result?.replicationLagSeconds) },
            { key: 'replicated', header: 'Replicated at', render: (row) => formatDateTime(row.result?.replicatedAt) },
            { key: 'error', header: 'Error', render: (row) => row.error ?? '—' },
          ]}
        />
      </section>
    </div>
  );
};
