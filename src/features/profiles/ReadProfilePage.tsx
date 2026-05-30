import { useMemo, useState } from 'react';
import { readProfile } from '../../api/profileApi';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Field, SelectField } from '../../components/Field';
import { PageHeader } from '../../components/PageHeader';
import { ProfileDetails } from '../../components/ProfileDetails';
import { ResultPanel } from '../../components/ResultPanel';
import { buildRegionTargets } from '../../config/defaults';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { AppSettings, ProfileViewResponse, RegionCode } from '../../types/api';
import { appendActivity } from '../../utils/activityLog';
import { hasErrors, validateReadProfile, type FieldErrors } from '../../utils/validation';

type ReadProfilePageProps = {
  readonly settings: AppSettings;
};

export const ReadProfilePage = ({ settings }: ReadProfilePageProps) => {
  const regions = useMemo(() => buildRegionTargets(settings), [settings]);
  const [regionCode, setRegionCode] = useState<RegionCode>('eu');
  const [profileId, setProfileId] = useState('');
  const [minVersion, setMinVersion] = useState('');
  const [errors, setErrors] = useState<FieldErrors<'profileId' | 'minVersion'>>({});
  const action = useAsyncAction<ProfileViewResponse>();
  const selectedRegion = regions.find((region) => region.code === regionCode) ?? {
    code: 'primary',
    label: 'Primary Write Region',
    role: 'PRIMARY',
    baseUrl: settings.primaryBaseUrl,
  } as const;

  const submit = async () => {
    const validation = validateReadProfile({ profileId, minVersion });
    setErrors(validation);
    if (hasErrors(validation)) {
      return;
    }
    const parsedVersion = minVersion.trim().length > 0 ? Number(minVersion) : undefined;
    const result = await action.run(() => readProfile(selectedRegion.baseUrl, profileId.trim(), parsedVersion, {
      credentials: { apiKey: settings.apiKey, internalKey: settings.internalKey },
      timeoutMs: settings.requestTimeoutMs,
    }));
    appendActivity({
      action: 'READ_PROFILE',
      region: selectedRegion.code,
      profileId: profileId.trim(),
      outcome: result ? 'SUCCESS' : 'FAILED',
      details: result ? `Read version ${String(result.version)} with lag ${String(result.replicationLagSeconds)}s.` : 'Regional read failed.',
    });
  };

  return (
    <div className="page-stack two-column">
      <section>
        <PageHeader
          eyebrow="Regional read model"
          title="Read profile from local region"
          description="Fetch a profile from a regional Postgres/Redis read model. Use minVersion to reject stale replicas after writes."
        />
        <form className="bank-card form-card" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <SelectField label="Read region" name="region" value={regionCode} onChange={(e) => setRegionCode(e.target.value as RegionCode)}>
            {regions.map((region) => <option key={region.code} value={region.code}>{region.label}</option>)}
          </SelectField>
          <Field label="Profile ID" name="profileId" value={profileId} onChange={(e) => setProfileId(e.target.value)} error={errors.profileId} autoComplete="off" />
          <Field label="Minimum version" name="minVersion" value={minVersion} onChange={(e) => setMinVersion(e.target.value)} error={errors.minVersion} hint="Optional read-your-writes guard." inputMode="numeric" autoComplete="off" />
          <div className="form-actions">
            <Button type="submit" loading={action.loading}>Read profile</Button>
            <Button type="button" variant="ghost" onClick={action.reset}>Clear result</Button>
          </div>
        </form>
      </section>
      <ResultPanel title="Regional profile view">
        {action.error ? <Alert type="error" title="Read failed">{action.error}</Alert> : null}
        {action.data ? <ProfileDetails profile={action.data} /> : <p className="empty-text">Regional profile view will appear here.</p>}
      </ResultPanel>
    </div>
  );
};
