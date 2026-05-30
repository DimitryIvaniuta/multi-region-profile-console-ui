import { useState } from 'react';
import { deactivateProfile, updateProfile } from '../../api/profileApi';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { PageHeader } from '../../components/PageHeader';
import { ProfileDetails } from '../../components/ProfileDetails';
import { ResultPanel } from '../../components/ResultPanel';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { AppSettings, ProfileResponse } from '../../types/api';
import { appendActivity } from '../../utils/activityLog';
import { hasErrors, trimToUndefined, validateUpdateProfile, type FieldErrors } from '../../utils/validation';

type UpdateProfilePageProps = {
  readonly settings: AppSettings;
};

export const UpdateProfilePage = ({ settings }: UpdateProfilePageProps) => {
  const [profileId, setProfileId] = useState('');
  const [displayName, setDisplayName] = useState('Alice Updated');
  const [phone, setPhone] = useState('+48100100299');
  const [errors, setErrors] = useState<FieldErrors<'profileId' | 'displayName' | 'phone'>>({});
  const action = useAsyncAction<ProfileResponse>();

  const context = {
    credentials: { apiKey: settings.apiKey, internalKey: settings.internalKey },
    timeoutMs: settings.requestTimeoutMs,
  };

  const submitUpdate = async () => {
    const validation = validateUpdateProfile({ profileId, displayName, phone });
    setErrors(validation);
    if (hasErrors(validation)) {
      return;
    }
    const trimmedPhone = trimToUndefined(phone);
    const updated = await action.run(() => updateProfile(settings.primaryBaseUrl, profileId.trim(), {
      displayName: displayName.trim(),
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
    }, context));
    appendActivity({
      action: 'UPDATE_PROFILE',
      region: 'primary',
      profileId: profileId.trim(),
      outcome: updated ? 'SUCCESS' : 'FAILED',
      details: updated ? `Updated to version ${String(updated.version)}.` : 'Profile update failed.',
    });
  };

  const submitDeactivate = async () => {
    const validation = validateUpdateProfile({ profileId, displayName: 'Valid Name', phone: '' });
    setErrors(validation);
    if (validation.profileId) {
      return;
    }
    const deactivated = await action.run(() => deactivateProfile(settings.primaryBaseUrl, profileId.trim(), context));
    appendActivity({
      action: 'DEACTIVATE_PROFILE',
      region: 'primary',
      profileId: profileId.trim(),
      outcome: deactivated ? 'SUCCESS' : 'FAILED',
      details: deactivated ? `Deactivated at version ${String(deactivated.version)}.` : 'Profile deactivate failed.',
    });
  };

  return (
    <div className="page-stack two-column">
      <section>
        <PageHeader
          eyebrow="Primary write model"
          title="Update or deactivate profile"
          description="Mutations are allowed only against the primary write region and return the new version for read-your-writes checks."
        />
        <form className="bank-card form-card" onSubmit={(event) => { event.preventDefault(); void submitUpdate(); }}>
          <Field label="Profile ID" name="profileId" value={profileId} onChange={(e) => setProfileId(e.target.value)} error={errors.profileId} autoComplete="off" />
          <Field label="Display name" name="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={errors.displayName} autoComplete="off" />
          <Field label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} autoComplete="off" />
          <div className="form-actions">
            <Button type="submit" loading={action.loading}>Update profile</Button>
            <Button type="button" variant="danger" loading={action.loading} onClick={() => void submitDeactivate()}>Deactivate profile</Button>
          </div>
        </form>
      </section>
      <ResultPanel title="Mutation result">
        {action.error ? <Alert type="error" title="Mutation failed">{action.error}</Alert> : null}
        {action.data ? <ProfileDetails profile={action.data} /> : <p className="empty-text">Update or deactivation result will appear here.</p>}
      </ResultPanel>
    </div>
  );
};
